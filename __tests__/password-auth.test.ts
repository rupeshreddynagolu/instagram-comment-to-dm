/**
 * Password sign-in — Unit Tests
 *
 * Passwords are stored as scrypt hashes and checked in constant time. Sign-in
 * gives one answer for every failure so it doesn't reveal which emails have
 * accounts, and repeated failures for an email are slowed down.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: { user: { findUnique: vi.fn() } },
}));
vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));

import { hashPassword, passwordProblem, verifyPassword } from "../lib/auth-password/hash";
import { mayChangeWithoutCurrentPassword } from "../lib/auth-password/reauth";
import { authenticateWithPassword, resetAttemptsForTests, verifyCurrentPassword } from "../lib/auth-password/authenticate";

beforeEach(() => {
  vi.clearAllMocks();
  resetAttemptsForTests();
});

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).toMatch(/^scrypt\$/);
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("correct horse batterY", hash)).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same password")).not.toBe(await hashPassword("same password"));
  });

  it("treats a malformed stored hash as a mismatch", async () => {
    expect(await verifyPassword("anything", "not-a-hash")).toBe(false);
  });

  it("asks for 8 to 128 characters and nothing more", () => {
    expect(passwordProblem("short")).toMatch(/at least 8/);
    expect(passwordProblem("x".repeat(129))).toMatch(/128/);
    expect(passwordProblem("eight ch")).toBeNull();
  });
});

describe("authenticateWithPassword", () => {
  it("signs in a verified user with the right password, matching email case-insensitively", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      passwordHash: await hashPassword("right password"),
      emailVerified: new Date(),
    });
    const result = await authenticateWithPassword(" Owner@Example.com ", "right password");
    expect(result).toEqual({ ok: true, userId: "user_1" });
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "owner@example.com" } })
    );
  });

  it("gives the same answer for a wrong password, an unknown email and an account without a password", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "user_1",
      passwordHash: await hashPassword("right password"),
      emailVerified: new Date(),
    });
    const wrong = await authenticateWithPassword("a@example.com", "wrong password");
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    const unknown = await authenticateWithPassword("b@example.com", "whatever pw");
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: "user_2", passwordHash: null, emailVerified: new Date() });
    const noPassword = await authenticateWithPassword("c@example.com", "whatever pw");
    expect(wrong).toEqual({ ok: false, reason: "invalid" });
    expect(unknown).toEqual({ ok: false, reason: "invalid" });
    expect(noPassword).toEqual({ ok: false, reason: "invalid" });
  });

  it("refuses an account whose email was never verified", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      passwordHash: await hashPassword("right password"),
      emailVerified: null,
    });
    expect(await authenticateWithPassword("a@example.com", "right password")).toEqual({
      ok: false,
      reason: "unverified",
    });
  });

  it("refuses non-ASCII emails before looking anything up, so the lock key always matches the database", async () => {
    expect(await authenticateWithPassword("á@example.com", "any password")).toEqual({ ok: false, reason: "invalid" });
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("locks an email across letter case, whether or not an account exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    for (const email of ["x@example.com", "X@example.com", "x@EXAMPLE.com", "X@Example.Com", "x@example.com"]) {
      await authenticateWithPassword(email, "wrong password");
    }
    expect(await authenticateWithPassword("x@example.COM", "any password")).toEqual({ ok: false, reason: "locked" });
  });

  it("shares one budget between sign-in and the current-password check", async () => {
    const passwordHash = await hashPassword("right password");
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user_7", passwordHash, emailVerified: new Date() });
    for (let i = 0; i < 3; i++) await verifyCurrentPassword("user_7", passwordHash, "wrong guess");
    for (let i = 0; i < 2; i++) await authenticateWithPassword("seven@example.com", "wrong password");
    expect(await authenticateWithPassword("seven@example.com", "right password")).toEqual({
      ok: false,
      reason: "locked",
    });
  });

  it("locks an email for a while after repeated failures, even with the right password", async () => {
    const passwordHash = await hashPassword("right password");
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user_1", passwordHash, emailVerified: new Date() });
    for (let i = 0; i < 5; i++) {
      expect((await authenticateWithPassword("a@example.com", "wrong password")).ok).toBe(false);
    }
    expect(await authenticateWithPassword("a@example.com", "right password")).toEqual({
      ok: false,
      reason: "locked",
    });
  });
});

describe("mayChangeWithoutCurrentPassword", () => {
  const now = new Date("2026-10-31T12:00:00Z");
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000);

  it("lets someone with no password set one", () => {
    expect(mayChangeWithoutCurrentPassword({ passwordHash: null }, null, now)).toBe(true);
  });

  it("lets this session change it within 15 minutes of its own email-link sign-in", () => {
    const session = { createdAt: minutesAgo(10), viaPassword: false };
    expect(mayChangeWithoutCurrentPassword({ passwordHash: "scrypt$x" }, session, now)).toBe(true);
  });

  it("asks an older session, a password session, or an unknown session for the current password", () => {
    const user = { passwordHash: "scrypt$x" };
    expect(mayChangeWithoutCurrentPassword(user, { createdAt: minutesAgo(20), viaPassword: false }, now)).toBe(false);
    expect(mayChangeWithoutCurrentPassword(user, { createdAt: minutesAgo(1), viaPassword: true }, now)).toBe(false);
    expect(mayChangeWithoutCurrentPassword(user, { createdAt: null, viaPassword: false }, now)).toBe(false);
    expect(mayChangeWithoutCurrentPassword(user, null, now)).toBe(false);
  });
});

describe("verifyCurrentPassword", () => {
  it("accepts the right password and locks after repeated wrong ones", async () => {
    const hash = await hashPassword("current password");
    expect(await verifyCurrentPassword("user_9", hash, "current password")).toBe("ok");
    for (let i = 0; i < 5; i++) {
      expect(await verifyCurrentPassword("user_9", hash, "wrong guess")).toBe("invalid");
    }
    expect(await verifyCurrentPassword("user_9", hash, "current password")).toBe("locked");
  });
});
