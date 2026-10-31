/**
 * Throttle — Unit Tests
 *
 * The email-first sign-in step reveals whether an account exists and sends
 * sign-in emails, so both are capped: per address (no flooding someone's
 * inbox) and per client (no running a list of emails through it).
 */

import { beforeEach, describe, expect, it } from "vitest";
import { clientKey, resetThrottleForTests, take } from "@/lib/auth-password/throttle";

describe("take", () => {
  beforeEach(() => resetThrottleForTests());

  it("allows up to the limit, then refuses within the window", () => {
    const now = 1_000_000;
    expect([1, 2, 3].map(() => take("k", 3, 60_000, now))).toEqual([true, true, true]);
    expect(take("k", 3, 60_000, now + 1)).toBe(false);
  });

  it("starts over once the window has passed", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i++) take("k", 3, 60_000, now);
    expect(take("k", 3, 60_000, now + 60_001)).toBe(true);
  });

  it("counts each key separately", () => {
    take("a", 1, 60_000, 0);
    expect(take("a", 1, 60_000, 1)).toBe(false);
    expect(take("b", 1, 60_000, 1)).toBe(true);
  });
});

describe("clientKey", () => {
  it("uses the address the proxy appended, not one the client sent", () => {
    const headers = new Headers({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" });
    expect(clientKey(headers)).toBe("ip:203.0.113.9");
  });

  it("falls back to x-real-ip, then to one shared key", () => {
    expect(clientKey(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("ip:198.51.100.4");
    expect(clientKey(new Headers())).toBe("ip:unknown");
  });
});
