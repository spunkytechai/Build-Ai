import { NextResponse } from "next/server";
import { getRegulatoryContext } from "../../lib/regulatory-db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const jurisdiction = typeof body?.jurisdiction === "string" ? body.jurisdiction.trim() : "";
  if (!jurisdiction) return NextResponse.json({ error: "Jurisdiction is required" }, { status: 400 });

  try {
    return NextResponse.json(await getRegulatoryContext(jurisdiction));
  } catch {
    return NextResponse.json({ error: "Unable to load regulatory context" }, { status: 500 });
  }
}
