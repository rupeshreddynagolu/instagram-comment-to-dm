// Fixed-window counters, kept in memory like the sign-in lockout: per
// process, so a few workers on cPanel each keep their own count. Enough to
// stop an inbox being flooded or an email list being run through sign-in.
const windows = new Map<string, { count: number; expires: number }>();
// Ended windows are cleared at most once a minute, and only once there are
// many keys. Live counters are never dropped to make room: that would let a
// flood of new keys reset someone's limit. Past MAX_KEYS, new keys are
// refused instead, until ended windows can be cleared.
const PRUNE_AT = 10_000;
const MAX_KEYS = 50_000;
const PRUNE_EVERY_MS = 60_000;
let lastPrune = 0;

function prune(now: number) {
  if (windows.size < PRUNE_AT || now - lastPrune < PRUNE_EVERY_MS) return;
  lastPrune = now;
  for (const [key, entry] of windows) {
    if (entry.expires <= now) windows.delete(key);
  }
}

/** Counts one use of `key`; false once it has been used `limit` times in the window. */
export function take(key: string, limit: number, windowMs: number, now: number = Date.now()): boolean {
  const entry = windows.get(key);
  if (!entry || entry.expires <= now) {
    windows.delete(key);
    prune(now);
    if (windows.size >= MAX_KEYS) return false;
    windows.set(key, { count: 1, expires: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function resetThrottleForTests() {
  windows.clear();
  lastPrune = 0;
}

export function throttleSizeForTests(): number {
  return windows.size;
}

// A plain addr-spec in ASCII: the local part's allowed characters, then
// dot-separated domain labels that don't start or end with a hyphen. Nothing
// a mail library could read as a display name, group, comment or second
// address.
const LOCAL = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*";
const LABEL = "[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?";
const PLAIN_EMAIL = new RegExp(`^${LOCAL}@(?:${LABEL}\\.)+[a-z]{2,63}$`);

/**
 * The address a sign-in link will really go to, or null. Auth.js lowercases
 * and trims the email before sending; accepting only plain addresses means
 * this is exactly the address the mail goes to, so limits keyed on it can't
 * be dodged with variants.
 */
export function plainEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (email.length > 254) return null;
  return PLAIN_EMAIL.test(email) ? email : null;
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
