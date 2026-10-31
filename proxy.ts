import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/automations", "/campaigns", "/logs", "/settings"];

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token")
  );
}

/**
 * Where a visitor who is already signed in should go instead of /login:
 * the campaign builder for a "Use this template" link, a same-site
 * callbackUrl, or the dashboard.
 */
function signedInDestination(params: URLSearchParams): string {
  const template = params.get("template");
  if (template && /^[a-z0-9-]+$/.test(template)) {
    return `/campaigns/new?template=${template}`;
  }
  const callbackUrl = params.get("callbackUrl");
  // A path on this site only: "/x" yes, "//other.site" or "https://…" no.
  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }
  return "/dashboard";
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isLogin = pathname === "/login";
  const isAuthenticated = hasSessionCookie(request);

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Keep the query too, so a pricing link like /settings?plan=PRO&billing=yearly
    // lands back on the same choice after sign-in.
    loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && isAuthenticated) {
    return NextResponse.redirect(
      new URL(signedInDestination(request.nextUrl.searchParams), request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/automations/:path*",
    "/campaigns/:path*",
    "/logs/:path*",
    "/settings/:path*",
    "/login",
  ],
};
