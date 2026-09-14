import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isFiniteNumber(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }
function isValidModel(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const model = value as Record<string, unknown>;
  if (typeof model.modelId !== "string" || typeof model.version !== "number" || !Number.isInteger(model.version) || model.version < 1 || model.units !== "m") return false;
  const plot = model.plot as Record<string, unknown> | null;
  if (!plot || !isFiniteNumber(plot.width) || plot.width <= 0 || !isFiniteNumber(plot.depth) || plot.depth <= 0) return false;
  if (!Array.isArray(model.rooms) || model.rooms.length > 500) return false;
  return model.rooms.every((room) => {
    if (!room || typeof room !== "object") return false;
    const r = room as Record<string, unknown>;
    return typeof r.id === "string" && typeof r.name === "string" && Number.isInteger(r.floor) && isFiniteNumber(r.x) && isFiniteNumber(r.y) && isFiniteNumber(r.w) && isFiniteNumber(r.h) && r.w > 0 && r.h > 0 && isFiniteNumber(r.area);
  });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || typeof claimsData?.claims?.sub !== "string") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: project, error: projectError } = await supabase.from("projects").select("id").eq("id", id).single();
  if (projectError || !project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const { data, error } = await supabase.from("building_models").select("id,project_id,version,status,model,created_by,created_at").eq("project_id", id).order("version", { ascending: false }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to load building model" }, { status: 500 });
  return NextResponse.json({ model: data ?? null });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || typeof userId !== "string") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const payload = body as Record<string, unknown>;
  if (!isValidModel(payload.model)) return NextResponse.json({ error: "Invalid building model" }, { status: 400 });
  const expectedVersion = Number(payload.expectedVersion ?? 0);
  if (!Number.isInteger(expectedVersion) || expectedVersion < 0) return NextResponse.json({ error: "Invalid expected model version" }, { status: 400 });
  const status = payload.status === "draft" || payload.status === "unresolved" ? payload.status : "unresolved";
  const { data, error } = await supabase.rpc("commit_building_model", { p_project_id: id, p_expected_version: expectedVersion, p_status: status, p_model: payload.model, p_created_by: userId });
  if (error) {
    if (error.code === "40001" || error.message.startsWith("version_conflict:")) {
      const currentVersion = Number(error.message.split(":")[1] ?? 0);
      return NextResponse.json({ error: "Model version conflict", code: "VERSION_CONFLICT", currentVersion }, { status: 409 });
    }
    if (error.message === "project_not_found") return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({ error: "Unable to save building model" }, { status: 500 });
  }
  return NextResponse.json({ model: Array.isArray(data) ? data[0] ?? null : data });
}
