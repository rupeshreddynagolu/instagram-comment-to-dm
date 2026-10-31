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
import { authenticateWithPassword, resetAttemptsForTests } from "../lib/auth-password/authenticate";

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
