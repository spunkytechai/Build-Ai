import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    const login = new URL("/auth", request.url);
    login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  return response;
}

// Keep the public landing page and other public routes outside the auth proxy.
// Only the authenticated application workspace needs session refresh/protection.
export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*"],
};
