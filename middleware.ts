import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  // If using placeholder credentials, allow browsing without redirect loops during local mock development
  if (
    supabaseUrl.includes("placeholder") ||
    supabaseAnonKey.includes("placeholder")
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Caregiver public routes
  const isCaregiverAuthRoute =
    pathname === "/caregiver/login" || pathname === "/caregiver/signup";
  // Patient public routes
  const isPatientAuthRoute = pathname === "/patient/login";

  // Caregiver protected routes
  const isCaregiverRoute =
    pathname.startsWith("/caregiver") && !isCaregiverAuthRoute;
  // Patient protected routes
  const isPatientRoute =
    pathname.startsWith("/patient") && !isPatientAuthRoute;

  if (isCaregiverRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/caregiver/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    const role =
      user.app_metadata?.role || user.user_metadata?.role;

    if (role !== "caregiver") {
      const url = request.nextUrl.clone();
      url.pathname = role === "patient" ? "/patient" : "/caregiver/login";
      return NextResponse.redirect(url);
    }
  }

  if (isPatientRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/patient/login";
      return NextResponse.redirect(url);
    }

    const role =
      user.app_metadata?.role || user.user_metadata?.role;

    if (role !== "patient") {
      const url = request.nextUrl.clone();
      url.pathname = role === "caregiver" ? "/caregiver" : "/patient/login";
      return NextResponse.redirect(url);
    }
  }

  // Redirect if already logged in and visiting auth pages
  if (user) {
    const role =
      user.app_metadata?.role || user.user_metadata?.role;
    if (isCaregiverAuthRoute && role === "caregiver") {
      const url = request.nextUrl.clone();
      url.pathname = "/caregiver";
      return NextResponse.redirect(url);
    }
    if (isPatientAuthRoute && role === "patient") {
      const url = request.nextUrl.clone();
      url.pathname = "/patient";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg, manifest.json
     * - api routes (they handle their own auth checks)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json|api/).*)",
  ],
};
