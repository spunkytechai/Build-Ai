import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRegulatoryContext } from "../../../../../lib/regulatory-db";
import { calculateFeasibility, isValidPlot, type PlotInput } from "../../../../../lib/feasibility-engine";

async function getAuth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || typeof userId !== "string") return null;
  return { supabase, userId };
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const payload = body as Record<string, unknown>;
  const siteResponse = await auth.supabase.from("sites").select("jurisdiction,building_type,plot_width_m,plot_depth_m,analysis").eq("project_id", id).maybeSingle();
  if (siteResponse.error) return NextResponse.json({ error: "Unable to load project site" }, { status: 500 });
  const site = siteResponse.data;
  if (!site) return NextResponse.json({ error: "Project site not found" }, { status: 404 });
  const feasibility = site.analysis && typeof site.analysis === "object" ? (site.analysis as Record<string, unknown>).feasibility : null;
  const input = (payload.plot && typeof payload.plot === "object" ? payload.plot : feasibility && typeof feasibility === "object" ? feasibility : {}) as Record<string, unknown>;
  const plot: PlotInput = {
    width: Number(input.width ?? site.plot_width_m),
    depth: Number(input.depth ?? site.plot_depth_m),
    frontSetback: Number(input.frontSetback ?? input.front ?? 0),
    rearSetback: Number(input.rearSetback ?? input.rear ?? 0),
    leftSetback: Number(input.leftSetback ?? input.left ?? 0),
    rightSetback: Number(input.rightSetback ?? input.right ?? 0),
  };
  if (!isValidPlot(plot)) return NextResponse.json({ error: "Invalid plot geometry" }, { status: 400 });
  const jurisdiction = typeof site.jurisdiction === "string" ? site.jurisdiction.trim() : "";
  if (!jurisdiction) return NextResponse.json({ error: "Project jurisdiction is unresolved" }, { status: 422 });
  const parkingMode = typeof payload.parkingMode === "string" ? payload.parkingMode : null;
  try {
    const regulatory = await getRegulatoryContext(jurisdiction);
    const result = calculateFeasibility(plot, regulatory.rules, parkingMode);
    return NextResponse.json({ projectId: id, jurisdiction, buildingType: site.building_type, result, sources: regulatory.sources, status: regulatory.status });
  } catch {
    return NextResponse.json({ error: "Unable to calculate feasibility" }, { status: 500 });
  }
}
