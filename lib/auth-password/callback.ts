const BASE = "https://replynxt.invalid";

/**
 * A callbackUrl turned into a path on this site, or the fallback. The value is
 * resolved the way a browser would, kept only if it stays on this origin, and
 * its leading slashes are collapsed so the path can't be re-read as
 * "//other.site" when it's redirected to.
 */
export function safeCallbackPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value) return fallback;
  try {
    const target = new URL(value, BASE);
    if (target.origin !== BASE) return fallback;
    return target.pathname.replace(/^[/\\]+/, "/") + target.search + target.hash;
  } catch {
    return fallback;
  }
}
