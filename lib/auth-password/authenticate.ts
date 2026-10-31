import { prisma } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth-password/hash";

export type PasswordSignIn =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "unverified" | "locked" };

// Failed attempts per account (or per email when there is no account), kept in
// memory: after five in fifteen minutes it is locked for the rest of that window. Per process, which on cPanel
// means a determined attacker gets a few windows' worth across workers; it
// still turns guessing into a crawl.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; since: number }>();

function isLocked(key: string): boolean {
  const entry = failures.get(key);
  if (!entry) return false;
  if (Date.now() - entry.since > WINDOW_MS) {
    failures.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(key: string) {
  const entry = failures.get(key);
  if (!entry || Date.now() - entry.since > WINDOW_MS) {
    failures.set(key, { count: 1, since: Date.now() });
  } else {
    entry.count += 1;
  }
}

export function resetAttemptsForTests() {
  failures.clear();
}

// A real hash to check against when the account doesn't exist, so a wrong
// email takes as long as a wrong password and timing can't reveal accounts.
let decoyHash: Promise<string> | null = null;

export async function authenticateWithPassword(
  rawEmail: string,
  password: string
): Promise<PasswordSignIn> {
  const email = rawEmail.trim().toLowerCase();

  const user = email
    ? await prisma.user.findUnique({
        where: { email },
        select: { id: true, passwordHash: true, emailVerified: true },
      })
    : null;

  // Failures count per account when there is one. MySQL matches emails
  // ignoring case and accents, so counting by the typed address would give
  // every spelling of the same email its own five tries.
  const key = user ? `user:${user.id}` : `email:${email}`;
  if (isLocked(key)) return { ok: false, reason: "locked" };

  if (!user?.passwordHash) {
    decoyHash ??= hashPassword("decoy password for timing");
    await verifyPassword(password, await decoyHash);
    recordFailure(key);
    return { ok: false, reason: "invalid" };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    recordFailure(key);
    return { ok: false, reason: "invalid" };
  }

  if (!user.emailVerified) return { ok: false, reason: "unverified" };

  failures.delete(key);
  return { ok: true, userId: user.id };
}

/**
 * Checks a signed-in user's current password before a change, sharing the
 * sign-in lockout so an open session can't be used to guess it.
 */
export async function verifyCurrentPassword(
  userId: string,
  passwordHash: string | null,
  password: string
): Promise<"ok" | "invalid" | "locked"> {
  const key = `user:${userId}`;
  if (isLocked(key)) return "locked";
  if (!passwordHash || !(await verifyPassword(password, passwordHash))) {
    recordFailure(key);
    return "invalid";
  }
  return "ok";
}
