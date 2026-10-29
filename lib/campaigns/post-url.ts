import { z } from "zod";

/**
 * A campaign's post URL is rendered as a link on the campaign list and on
 * the public client report, so it must be an Instagram https link. A plain
 * z.string().url() also accepts javascript: and data: URLs, which would run
 * script for whoever clicks the link.
 */
export const instagramPostUrl = z.string().refine((value) => {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/\.$/, "").toLowerCase();
    return (
      url.protocol === "https:" &&
      (host === "instagram.com" || host.endsWith(".instagram.com"))
    );
  } catch {
    return false;
  }
}, "Must be an https://instagram.com link");

/** An href that can only open a web page; anything else becomes "#". */
export function safeExternalHref(url: string | null | undefined): string {
  return url && /^https?:\/\//i.test(url) ? url : "#";
}

/**
 * People type links as "yourstore.com/page" or "www.yourstore.com". Give a
 * link with no scheme https://, and leave one that has a scheme alone so the
 * check below can still refuse javascript:, data: and the like.
 */
export function normalizeWebUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || /^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, "")}`;
}

const WEB_URL_MESSAGE = "Enter a full web address, like https://yourstore.com/page";

/** A link the tracked redirect may send people to: http(s) only. */
export const webUrl = z.preprocess(
  (value) => (typeof value === "string" ? normalizeWebUrl(value) : value),
  z
    .string()
    .url(WEB_URL_MESSAGE)
    .refine((value) => /^https?:\/\//i.test(value), WEB_URL_MESSAGE)
);
