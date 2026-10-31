/**
 * Throttle — Unit Tests
 *
 * The email-first sign-in step reveals whether an account exists and sends
 * sign-in emails, so both are capped: per address (no flooding someone's
 * inbox) and per client (no running a list of emails through it).
 */

import { beforeEach, describe, expect, it } from "vitest";
import { clientKey, plainEmail, resetThrottleForTests, take, throttleSizeForTests } from "@/lib/auth-password/throttle";

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

  it("counts IPv6 clients by their /64 network", () => {
    const key = (ip: string) => clientKey(new Headers({ "x-real-ip": ip }));
    expect(key("2001:db8:aa:bb:1:2:3:4")).toBe("ip:2001:db8:aa:bb::/64");
    expect(key("2001:0db8:00aa:00bb::9")).toBe("ip:2001:db8:aa:bb::/64");
    expect(key("2001:db8::1")).toBe("ip:2001:db8:0:0::/64");
  });
});

describe("plainEmail", () => {
  it("lowercases and trims, as Auth.js does before sending", () => {
    expect(plainEmail("  Riya@Example.COM ")).toBe("riya@example.com");
  });

  it("refuses anything Auth.js would quietly rewrite to another address", () => {
    // Auth.js keeps only what's before a comma in the domain, so these would
    // all reach riya@example.com while counting as different addresses.
    for (const bad of ["riya@example.com>", "<riya@example.com>", "a;b@example.com", "riya@exa(mple).com", "riya@example.com\\", "ri\u0000ya@example.com", "rïya@example.com", "riya@example..com", "riya@-example.com", "riya@example.com,1", "riya@example.com, x", "a@b@example.com", "\"a\"@example.com", "riya", "riya@", ""]) {
      expect(plainEmail(bad)).toBeNull();
    }
  });

  it("refuses an address longer than email allows", () => {
    expect(plainEmail(`${"a".repeat(250)}@example.com`)).toBeNull();
  });
});

describe("take, under load", () => {
  beforeEach(() => resetThrottleForTests());

  it("forgets windows that have ended once there are many keys", () => {
    for (let i = 0; i < 10_001; i++) take(`old-${i}`, 1, 1_000, 0);
    take("new", 1, 1_000, 120_000);
    expect(throttleSizeForTests()).toBe(1);
  });

  it("keeps a blocked counter through a flood of new keys", () => {
    take("victim", 1, 3_600_000, 0);
    for (let i = 0; i < 50_010; i++) take(`flood-${i}`, 3, 3_600_000, 0);
    expect(throttleSizeForTests()).toBe(50_000);
    // The victim is still blocked, and newcomers still get in.
    expect(take("victim", 1, 3_600_000, 1)).toBe(false);
    expect(take("someone-new", 3, 3_600_000, 1)).toBe(true);
  });

  it("refuses a new key only when every counter is blocking", () => {
    for (let i = 0; i < 50_000; i++) take(`blocked-${i}`, 1, 3_600_000, 0);
    expect(take("someone-new", 1, 3_600_000, 1)).toBe(false);
  });

  it("makes room again once those windows have ended", () => {
    for (let i = 0; i < 50_000; i++) take(`flood-${i}`, 1, 1_000, 0);
    expect(take("later", 1, 1_000, 120_000)).toBe(true);
  });

  it("accepts ordinary addresses", () => {
    for (const ok of ["riya.k+ig@example.co.in", "o'neil@mail.example.com", "a_b-c@x-y.io"]) {
      expect(plainEmail(ok)).toBe(ok);
    }
  });
});
