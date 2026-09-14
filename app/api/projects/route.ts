import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export async function GET() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("projects")
    .select("id,name,description,status,created_at,updated_at,sites(address,latitude,longitude,jurisdiction,authority)")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || typeof userId !== "string") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "My Building Project";
  const type = typeof body.type === "string" ? body.type.trim() : "Residential";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const lat = body.lat === null || body.lat === undefined || body.lat === "" ? null : Number(body.lat);
  const lon = body.lon === null || body.lon === undefined || body.lon === "" ? null : Number(body.lon);
  const width = Number(body.width);
  const depth = Number(body.depth);
  const analysis = body.analysis && typeof body.analysis === "object" ? body.analysis : null;

  if ((lat !== null && !isFiniteNumber(lat)) || (lon !== null && !isFiniteNumber(lon)) || !isFiniteNumber(width) || !isFiniteNumber(depth) || width <= 0 || depth <= 0) {
    return NextResponse.json({ error: "Invalid site dimensions or coordinates" }, { status: 400 });
  }
  if ((lat === null) !== (lon === null)) return NextResponse.json({ error: "Latitude and longitude must be provided together" }, { status: 400 });
  if (lat !== null && (lat < -90 || lat > 90 || lon! < -180 || lon! > 180)) return NextResponse.json({ error: "Coordinates are out of range" }, { status: 400 });

  const { data: orgId, error: orgError } = await supabase.rpc("bootstrap_user_organization", { org_name: "My Organization" });
  if (orgError || !orgId) return NextResponse.json({ error: orgError?.message ?? "Unable to initialize organization" }, { status: 500 });

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({ organization_id: orgId, name, description: `${type} · ${width} × ${depth} m`, status: "draft", created_by: userId })
    .select("id,name,description,status,created_at,updated_at")
    .single();
  if (projectError || !project) return NextResponse.json({ error: projectError?.message ?? "Unable to create project" }, { status: 500 });

  const site = {
    project_id: project.id,
    address: address || null,
    latitude: lat,
    longitude: lon,
    jurisdiction: typeof body.jurisdiction === "string" ? body.jurisdiction : null,
    authority: typeof body.authority === "string" ? body.authority : null,
  };
  const { error: siteError } = await supabase.from("sites").insert(site);
  if (siteError) {
    await supabase.from("projects").delete().eq("id", project.id);
    return NextResponse.json({ error: siteError.message }, { status: 500 });
  }

  const { error: auditError } = await supabase.from("audit_events").insert({
    organization_id: orgId,
    project_id: project.id,
    user_id: userId,
    event_type: "project.created",
    payload: { type, width, depth, analysis },
  });
  if (auditError) return NextResponse.json({ project, warning: "Project created but audit event could not be recorded." });

  return NextResponse.json({ project }, { status: 201 });
}
