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
function signedInDestination(request: NextRequest): string {
  const params = request.nextUrl.searchParams;
  const template = params.get("template");
  if (template && /^[a-z0-9-]+$/.test(template)) {
    return `/campaigns/new?template=${template}`;
  }
  const callbackUrl = params.get("callbackUrl");
  if (callbackUrl) {
    // Resolve it the way the browser will, then check where it really points:
    // "//other.site", "/\other.site" and "https://…" all leave this origin.
    try {
      const target = new URL(callbackUrl, request.url);
      if (target.origin === request.nextUrl.origin) {
        return target.pathname + target.search + target.hash;
      }
    } catch {
      // Not a URL at all; fall through to the dashboard.
    }
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
      new URL(signedInDestination(request), request.url)
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
