import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function optionalFinite(value: unknown) {
  return value == null || finite(value);
}

async function getAuth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || typeof userId !== "string") return null;
  return { supabase, userId };
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: site, error } = await auth.supabase
    .from("sites")
    .select("id,project_id,address,latitude,longitude,jurisdiction,authority,plot_width_m,plot_depth_m,building_type,analysis,created_at,updated_at")
    .eq("project_id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Unable to load site" }, { status: 500 });
  if (!site) return NextResponse.json({ site: null });
  return NextResponse.json({ site });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const payload = body as Record<string, unknown>;

  const address = typeof payload.address === "string" ? payload.address.trim() : "";
  const latitude = payload.latitude == null ? null : Number(payload.latitude);
  const longitude = payload.longitude == null ? null : Number(payload.longitude);
  const plotWidth = payload.plotWidthM == null ? null : Number(payload.plotWidthM);
  const plotDepth = payload.plotDepthM == null ? null : Number(payload.plotDepthM);
  const buildingType = typeof payload.buildingType === "string" ? payload.buildingType.trim() : "house";

  if (!optionalFinite(latitude) || !optionalFinite(longitude) || !optionalFinite(plotWidth) || !optionalFinite(plotDepth)) {
    return NextResponse.json({ error: "Invalid numeric site values" }, { status: 400 });
  }
  if (latitude != null && (latitude < -90 || latitude > 90)) return NextResponse.json({ error: "Invalid latitude" }, { status: 400 });
  if (longitude != null && (longitude < -180 || longitude > 180)) return NextResponse.json({ error: "Invalid longitude" }, { status: 400 });
  if (plotWidth != null && plotWidth <= 0) return NextResponse.json({ error: "Plot width must be positive" }, { status: 400 });
  if (plotDepth != null && plotDepth <= 0) return NextResponse.json({ error: "Plot depth must be positive" }, { status: 400 });

  const { data: existing, error: existingError } = await auth.supabase
    .from("sites")
    .select("id,project_id")
    .eq("project_id", id)
    .maybeSingle();
  if (existingError) return NextResponse.json({ error: "Unable to resolve project site" }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Project site not found" }, { status: 404 });

  const patch: Record<string, unknown> = {
    address: address || null,
    latitude,
    longitude,
    plot_width_m: plotWidth,
    plot_depth_m: plotDepth,
    building_type: buildingType || "house",
  };
  if (Object.prototype.hasOwnProperty.call(payload, "analysis")) patch.analysis = payload.analysis ?? null;
  if (typeof payload.jurisdiction === "string") patch.jurisdiction = payload.jurisdiction.trim() || null;
  if (typeof payload.authority === "string") patch.authority = payload.authority.trim() || null;

  const { data: site, error } = await auth.supabase
    .from("sites")
    .update(patch)
    .eq("id", existing.id)
    .select("id,project_id,address,latitude,longitude,jurisdiction,authority,plot_width_m,plot_depth_m,building_type,analysis,created_at,updated_at")
    .single();
  if (error) return NextResponse.json({ error: "Unable to save site" }, { status: 500 });

  const { data: project } = await auth.supabase.from("projects").select("organization_id").eq("id", id).single();
  if (project?.organization_id) {
    await auth.supabase.from("audit_events").insert({
      organization_id: project.organization_id,
      project_id: id,
      user_id: auth.userId,
      event_type: "site_updated",
      payload: { source: "site_intelligence", analysis_updated: Object.prototype.hasOwnProperty.call(payload, "analysis") },
    });
  }

  return NextResponse.json({ site });
}
