import { prisma } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth-password/hash";

export type PasswordSignIn =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "unverified" | "locked" };

// Failed attempts, kept in memory, counted against the email and (when it
// exists) the account: after five in fifteen minutes either is locked for the
// rest of that window. Per process, which on cPanel
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

/** The lockout key for an email: lowercased, which for ASCII matches MySQL's
 * case-insensitive comparison exactly. Non-ASCII emails never get this far. */
function lockKey(email: string): string {
  return `email:${email}`;
}

function accountKey(userId: string): string {
  return `user:${userId}`;
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
  const emailKey = lockKey(email);

  // MySQL compares emails ignoring case and accents. Lowercasing matches that
  // exactly only for ASCII, so other characters are refused before the lookup:
  // the lock key and the row it finds can never disagree.
  if (!email || !/^[\x21-\x7e]+$/.test(email)) {
    recordFailure(emailKey);
    return { ok: false, reason: "invalid" };
  }
  if (isLocked(emailKey)) return { ok: false, reason: "locked" };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, emailVerified: true },
  });

  if (!user?.passwordHash) {
    decoyHash ??= hashPassword("decoy password for timing");
    await verifyPassword(password, await decoyHash);
    recordFailure(emailKey);
    return { ok: false, reason: "invalid" };
  }

  // The account's own budget is shared with the current-password check, so
  // sign-in and re-authentication can't each take five guesses.
  const userKey = accountKey(user.id);
  if (isLocked(userKey)) return { ok: false, reason: "locked" };

  if (!(await verifyPassword(password, user.passwordHash))) {
    recordFailure(emailKey);
    recordFailure(userKey);
    return { ok: false, reason: "invalid" };
  }

  if (!user.emailVerified) return { ok: false, reason: "unverified" };

  failures.delete(emailKey);
  failures.delete(userKey);
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
  const key = accountKey(userId);
  if (isLocked(key)) return "locked";
  if (!passwordHash || !(await verifyPassword(password, passwordHash))) {
    recordFailure(key);
    return "invalid";
  }
  return "ok";
}
