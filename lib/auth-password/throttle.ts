// Fixed-window counters, kept in memory like the sign-in lockout: per
// process, so a few workers on cPanel each keep their own count. Enough to
// stop an inbox being flooded or an email list being run through sign-in.
const windows = new Map<string, { count: number; since: number }>();
// Past this many keys, ended windows are cleared before adding another.
const PRUNE_AT = 10_000;

/** Counts one use of `key`; false once it has been used `limit` times in the window. */
export function take(key: string, limit: number, windowMs: number, now: number = Date.now()): boolean {
  if (windows.size >= PRUNE_AT) {
    for (const [stored, entry] of windows) {
      if (now - entry.since > windowMs) windows.delete(stored);
    }
  }
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

export function throttleSizeForTests(): number {
  return windows.size;
}

/**
 * The address a sign-in link will really go to, or null. Auth.js lowercases
 * and trims the email, and keeps only what comes before a comma in the
 * domain; accepting only plain addresses means this is exactly the address it
 * sends to, so limits keyed on it can't be dodged with variants.
 */
export function plainEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (email.length > 254) return null;
  return /^[^\s@,"]+@[^\s@,"]+\.[^\s@,"]+$/.test(email) ? email : null;
}

/**
 * The client's address as the proxy in front of the app saw it. The proxy
 * appends that address to x-forwarded-for, so the last entry is the one to
 * trust; earlier entries come from the client and can say anything. Server
 * actions can't see the socket address, so if nothing in front of the app
 * sets this header, a client can name any address it likes: these per-client
 * limits are then a speed bump, and the per-address ones do the real work.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return `ip:${forwarded || headers.get("x-real-ip")?.trim() || "unknown"}`;
}
