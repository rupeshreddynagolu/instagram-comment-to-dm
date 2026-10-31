import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";

const PROTECTED_PREFIXES = ["/dashboard", "/account", "/automations", "/campaigns", "/logs", "/settings"];

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

/**
 * Whether the cookie's session still exists. A cookie can outlive its
 * session (signed out elsewhere, expired, or ended by a password change);
 * trusting the cookie alone would bounce /login to the dashboard and the
 * dashboard straight back to /login, forever.
 */
async function hasLiveSession(request: NextRequest): Promise<boolean> {
  for (const name of SESSION_COOKIES) {
    const token = request.cookies.get(name)?.value;
    if (!token) continue;
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      select: { expires: true },
    });
    if (session && session.expires > new Date()) return true;
  }
  return false;
}

/**
 * Where a visitor who is already signed in should go instead of /login:
 * the campaign builder for a "Use this template" link, a same-site
 * callbackUrl, or the dashboard.
 */
function signedInDestination(request: NextRequest): URL {
  const params = request.nextUrl.searchParams;
  const template = params.get("template");
  if (template && /^[a-z0-9-]+$/.test(template)) {
    return new URL(`/campaigns/new?template=${template}`, request.url);
  }
  const callbackUrl = params.get("callbackUrl");
  if (callbackUrl) {
    // Resolve it the way the browser will and keep the resolved URL itself:
    // turning it back into a path and parsing that again would let
    // "/.//other.site" become "//other.site".
    try {
      const target = new URL(callbackUrl, request.url);
      if (target.origin === request.nextUrl.origin) return target;
    } catch {
      // Not a URL at all; fall through to the dashboard.
    }
  }
  return new URL("/dashboard", request.url);
}

export async function proxy(request: NextRequest) {
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
    if (await hasLiveSession(request)) {
      return NextResponse.redirect(signedInDestination(request));
    }
    // A dead session: show the login page and drop the stale cookie.
    const response = NextResponse.next();
    for (const name of SESSION_COOKIES) {
      // A __Secure- cookie is only replaced by one that is itself Secure.
      if (request.cookies.has(name)) {
        response.cookies.set(name, "", { path: "/", maxAge: 0, secure: name.startsWith("__Secure-") });
      }
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/automations/:path*",
    "/campaigns/:path*",
    "/logs/:path*",
    "/settings/:path*",
    "/login",
  ],
};
