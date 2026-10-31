import { randomBytes, scrypt, timingSafeEqual } from "crypto";

// scrypt with Node's own crypto, so no native dependency has to match the
// cPanel host. Stored as "scrypt$N$r$p$salt$hash", base64, so the cost can be
// raised later without breaking existing hashes.
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key)
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

/** Checks a password against a stored hash in constant time. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, keyB64] = parts;
  const expected = Buffer.from(keyB64, "base64");
  if (expected.length !== KEY_LENGTH) return false;
  try {
    const key = await derive(password, Buffer.from(saltB64, "base64"), Number(n), Number(r), Number(p));
    return timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

/**
 * What's wrong with a new password, or null. Length only, as NIST suggests:
 * long passphrases beat forced symbols.
 */
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 128) return "Use 128 characters or fewer.";
  return null;
}
