/**
 * Callback paths — Unit Tests
 *
 * Where to send someone after signing in comes from the URL, so it must never
 * lead off this site, however it's written.
 */

import { describe, it, expect } from "vitest";
import { safeCallbackPath } from "../lib/auth-password/callback";

describe("safeCallbackPath", () => {
  it("keeps a same-site path with its query", () => {
    expect(safeCallbackPath("/campaigns/new?template=fitness-plan")).toBe("/campaigns/new?template=fitness-plan");
  });

  it("falls back for empty, absolute and protocol-relative values", () => {
    for (const bad of [undefined, "", "https://evil.example/x", "//evil.example/x", "/\\evil.example"]) {
      expect(safeCallbackPath(bad)).toBe("/dashboard");
    }
  });

  it("collapses leading slashes so the result can't be re-read as another site", () => {
    const path = safeCallbackPath("/.//evil.example/x");
    expect(path.startsWith("//")).toBe(false);
    expect(new URL(path, "https://replynxt.com").origin).toBe("https://replynxt.com");
  });
});
