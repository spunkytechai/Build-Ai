import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || typeof userId !== "string") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .single();
  if (projectError || !project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("building_models")
    .select("id,project_id,version,status,model,created_by,created_at")
    .eq("project_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ model: data ?? null });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || typeof userId !== "string") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !body.model || typeof body.model !== "object") {
    return NextResponse.json({ error: "A building model is required" }, { status: 400 });
  }
  const expectedVersion = Number(body.expectedVersion ?? 0);
  if (!Number.isInteger(expectedVersion) || expectedVersion < 0) {
    return NextResponse.json({ error: "Invalid expected model version" }, { status: 400 });
  }
  const status = body.status === "draft" || body.status === "unresolved" ? body.status : "unresolved";

  const { data, error } = await supabase.rpc("commit_building_model", {
    p_project_id: id,
    p_expected_version: expectedVersion,
    p_status: status,
    p_model: body.model,
    p_created_by: userId,
  });
  if (error) {
    if (error.code === "40001" || error.message.startsWith("version_conflict:")) {
      const currentVersion = Number(error.message.split(":")[1] ?? 0);
      return NextResponse.json({ error: "Model version conflict", code: "VERSION_CONFLICT", currentVersion }, { status: 409 });
    }
    if (error.message === "project_not_found") return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ model: Array.isArray(data) ? data[0] ?? null : data }, { status: 200 });
}
