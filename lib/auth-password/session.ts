import { randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db/client";

// Auth.js's database sessions: 30 days, the same as its default.
const SESSION_SECONDS = 30 * 24 * 60 * 60;
const COOKIE = "authjs.session-token";

/**
 * Whether this request came over HTTPS, the way Auth.js decides it: the
 * forwarded protocol behind cPanel's proxy, else the configured site URL.
 */
async function isSecure(): Promise<boolean> {
  const forwarded = (await headers()).get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwarded) return forwarded === "https";
  return (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "").startsWith("https:");
}

/** The session cookie's name for this request, matching what Auth.js reads. */
export async function sessionCookieName(): Promise<string> {
  return (await isSecure()) ? `__Secure-${COOKIE}` : COOKIE;
}

/**
 * Signs a user in after a correct password: the same database session and
 * cookie a magic link creates, so auth(), sign-out and the proxy treat both
 * kinds of sign-in alike.
 */
export async function startSession(userId: string): Promise<void> {
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_SECONDS * 1000);
  await prisma.session.create({ data: { sessionToken, userId, expires, viaPassword: true } });

  const secure = await isSecure();
  (await cookies()).set(secure ? `__Secure-${COOKIE}` : COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    expires,
  });
}

/** This request's session row, or null. */
export async function currentSession() {
  const token = (await cookies()).get(await sessionCookieName())?.value;
  if (!token) return null;
  return prisma.session.findUnique({
    where: { sessionToken: token },
    select: { id: true, createdAt: true, viaPassword: true },
  });
}

/** Ends every other session of this user, e.g. after a password change. */
export async function endOtherSessions(userId: string): Promise<void> {
  const current = (await cookies()).get(await sessionCookieName())?.value;
  await prisma.session.deleteMany({
    where: { userId, ...(current ? { sessionToken: { not: current } } : {}) },
  });
}
