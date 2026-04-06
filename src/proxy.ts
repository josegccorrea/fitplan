import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public paths that don't need auth
  const publicPaths = ["/", "/login", "/register"];
  const isPublicPath = publicPaths.some((p) => pathname === p);
  const isOnboardingPath = pathname.startsWith("/onboarding");
  const isAdminPath = pathname.startsWith("/admin");
  const isApiPath = pathname.startsWith("/api");

  // Allow API routes to pass through
  if (isApiPath) return supabaseResponse;

  // Not logged in → redirect to login (except public paths)
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged in user accessing public/auth pages → redirect to app
  if (user && isPublicPath) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, role")
      .eq("id", user.id)
      .single();

    if (!profile?.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding/step/1";
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = "/treino";
    return NextResponse.redirect(url);
  }

  // Logged in but onboarding not complete → force onboarding
  if (user && !isOnboardingPath && !isPublicPath) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, role")
      .eq("id", user.id)
      .single();

    if (!profile?.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding/step/1";
      return NextResponse.redirect(url);
    }

    // Admin route guard
    if (isAdminPath && profile?.role === "user") {
      const url = request.nextUrl.clone();
      url.pathname = "/treino";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
