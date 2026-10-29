/**
 * Post URL validation — Unit Tests
 *
 * A campaign's post URL is rendered as a link on the campaign list and the
 * public client report, so only Instagram https links may be stored or linked.
 */

import { describe, it, expect } from "vitest";
import { instagramPostUrl, safeExternalHref, webUrl } from "../lib/campaigns/post-url";

describe("instagramPostUrl", () => {
  it("accepts Instagram post and reel permalinks", () => {
    expect(instagramPostUrl.safeParse("https://www.instagram.com/p/Bu0TyFsAwoD/").success).toBe(true);
    expect(instagramPostUrl.safeParse("https://instagram.com/reel/DfEReVqJ1Fe/").success).toBe(true);
  });

  it("rejects script, http and non-Instagram URLs", () => {
    for (const url of [
      "javascript:alert(1)",
      "JavaScript:alert(document.cookie)//https://www.instagram.com/",
      "data:text/html,<script>alert(1)</script>",
      "http://www.instagram.com/p/abc/",
      "https://instagram.com.evil.example/p/abc/",
      "https://evil.example/?instagram.com",
    ]) {
      expect(instagramPostUrl.safeParse(url).success, url).toBe(false);
    }
  });
});

describe("safeExternalHref", () => {
  it("keeps http(s) links and replaces anything else", () => {
    expect(safeExternalHref("https://www.instagram.com/p/abc/")).toBe(
      "https://www.instagram.com/p/abc/"
    );
    expect(safeExternalHref("javascript:alert(1)")).toBe("#");
    expect(safeExternalHref(" javascript:alert(1)")).toBe("#");
    expect(safeExternalHref(null)).toBe("#");
  });
});

describe("webUrl", () => {
  it("accepts http(s) destinations only", () => {
    expect(webUrl.safeParse("https://yourstore.com/product").success).toBe(true);
    expect(webUrl.safeParse("http://example.com").success).toBe(true);
    expect(webUrl.safeParse("javascript:alert(1)").success).toBe(false);
    expect(webUrl.safeParse("data:text/html,hi").success).toBe(false);
  });
});
