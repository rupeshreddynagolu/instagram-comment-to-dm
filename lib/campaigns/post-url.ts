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

/** A link the tracked redirect may send people to: http(s) only. */
export const webUrl = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), "Must be an http(s) link");
