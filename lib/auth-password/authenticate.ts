import { prisma } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth-password/hash";

export type PasswordSignIn =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "unverified" | "locked" };

// Failed attempts per email, kept in memory: after five in fifteen minutes the
// email is locked for the rest of that window. Per process, which on cPanel
// means a determined attacker gets a few windows' worth across workers; it
// still turns guessing into a crawl.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; since: number }>();

function isLocked(email: string): boolean {
  const entry = failures.get(email);
  if (!entry) return false;
  if (Date.now() - entry.since > WINDOW_MS) {
    failures.delete(email);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(email: string) {
  const entry = failures.get(email);
  if (!entry || Date.now() - entry.since > WINDOW_MS) {
    failures.set(email, { count: 1, since: Date.now() });
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
  if (isLocked(email)) return { ok: false, reason: "locked" };

  const user = email
    ? await prisma.user.findUnique({
        where: { email },
        select: { id: true, passwordHash: true, emailVerified: true },
      })
    : null;

  if (!user?.passwordHash) {
    decoyHash ??= hashPassword("decoy password for timing");
    await verifyPassword(password, await decoyHash);
    recordFailure(email);
    return { ok: false, reason: "invalid" };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    recordFailure(email);
    return { ok: false, reason: "invalid" };
  }

  if (!user.emailVerified) return { ok: false, reason: "unverified" };

  failures.delete(email);
  return { ok: true, userId: user.id };
}
