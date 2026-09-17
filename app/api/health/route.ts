import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      {
        status: "degraded",
        service: "build-ai",
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
        timestamp,
        checks: {
          application: "ok",
          database: "not_configured",
          external_data: "not_configured",
        },
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("projects").select("id").limit(1);

    if (error) throw error;

    return NextResponse.json(
      {
        status: "ok",
        service: "build-ai",
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
        timestamp,
        checks: {
          application: "ok",
          database: "ok",
          external_data: "not_configured",
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        service: "build-ai",
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
        timestamp,
        checks: {
          application: "ok",
          database: "error",
          external_data: "not_configured",
        },
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }
}
