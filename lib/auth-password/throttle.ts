// Fixed-window counters, kept in memory like the sign-in lockout: per
// process, so a few workers on cPanel each keep their own count. Enough to
// stop an inbox being flooded or an email list being run through sign-in.
const windows = new Map<string, { count: number; limit: number; expires: number }>();
// Ended windows are cleared at most once a minute, and only once there are
// many keys. Past MAX_KEYS, room is made by dropping the oldest counter that
// isn't blocking anyone: a counter at its limit is never dropped (that would
// lift someone's block), and a flood of new keys can't lock everyone out,
// since its own keys are the first to go. Only if every counter is blocking
// is a new key refused.
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

/** Drops the oldest counter below its limit; false if every counter is at its limit. */
function makeRoom(now: number): boolean {
  // A Map iterates in insertion order, so the first keys are the oldest.
  for (const [key, entry] of windows) {
    if (entry.expires <= now || entry.count < entry.limit) {
      windows.delete(key);
      return true;
    }
  }
  return false;
}

/** Counts one use of `key`; false once it has been used `limit` times in the window. */
export function take(key: string, limit: number, windowMs: number, now: number = Date.now()): boolean {
  const entry = windows.get(key);
  if (!entry || entry.expires <= now) {
    windows.delete(key);
    prune(now);
    if (windows.size >= MAX_KEYS && !makeRoom(now)) return false;
    windows.set(key, { count: 1, limit, expires: now + windowMs });
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
  const address = forwarded || headers.get("x-real-ip")?.trim() || "unknown";
  return `ip:${address.includes(":") ? ipv6Network(address) : address}`;
}

/**
 * An IPv6 address's /64 network: one home or phone usually gets a whole /64,
 * so counting single addresses would hand it billions of fresh budgets.
 */
function ipv6Network(address: string): string {
  const [head, tail = ""] = address.toLowerCase().split("::");
  const front = head ? head.split(":") : [];
  const back = address.includes("::") && tail ? tail.split(":") : [];
  const groups = address.includes("::")
    ? [...front, ...Array(Math.max(0, 8 - front.length - back.length)).fill("0"), ...back]
    : front;
  return `${groups.slice(0, 4).map((group) => group.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}
