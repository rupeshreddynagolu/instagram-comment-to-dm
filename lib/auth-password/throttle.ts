// Fixed-window counters, kept in memory like the sign-in lockout: per
// process, so a few workers on cPanel each keep their own count. Enough to
// stop an inbox being flooded or an email list being run through sign-in.
const windows = new Map<string, { count: number; since: number }>();

/** Counts one use of `key`; false once it has been used `limit` times in the window. */
export function take(key: string, limit: number, windowMs: number, now: number = Date.now()): boolean {
  const entry = windows.get(key);
  if (!entry || now - entry.since > windowMs) {
    windows.set(key, { count: 1, since: now });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function resetThrottleForTests() {
  windows.clear();
}

/**
 * The client's address as the proxy in front of the app saw it. The proxy
 * appends that address to x-forwarded-for, so the last entry is the one to
 * trust; earlier entries come from the client and can say anything.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return `ip:${forwarded || headers.get("x-real-ip")?.trim() || "unknown"}`;
}
