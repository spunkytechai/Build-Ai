import { NextResponse } from "next/server";
import { getRegulatoryContext } from "@/lib/regulatory-db";
import { evaluateRules } from "@/lib/regulatory-evaluator";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const jurisdiction = typeof payload.jurisdiction === "string" ? payload.jurisdiction.trim() : "";
  if (!jurisdiction) return NextResponse.json({ error: "Jurisdiction is required" }, { status: 400 });

  const context = payload.context && typeof payload.context === "object" ? payload.context as Record<string, unknown> : {};
  const values = payload.values && typeof payload.values === "object" ? payload.values as Record<string, number | null> : {};

  try {
    const regulatory = await getRegulatoryContext(jurisdiction);
    const evaluations = evaluateRules(regulatory.rules, values, context);
    return NextResponse.json({
      jurisdiction,
      status: regulatory.status,
      evaluations,
      summary: {
        pass: evaluations.filter((item) => item.status === "pass").length,
        fail: evaluations.filter((item) => item.status === "fail").length,
        notEvaluable: evaluations.filter((item) => item.status === "not_evaluable").length,
      },
      sources: regulatory.sources,
    });
  } catch {
    return NextResponse.json({ error: "Unable to evaluate regulatory controls" }, { status: 500 });
  }
}
