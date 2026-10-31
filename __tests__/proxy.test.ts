/**
 * Proxy — Unit Tests
 *
 * "Use this template" links to /login?template=<slug>. A visitor who is
 * already signed in must land in the campaign builder with that template,
 * not on the dashboard, and signed-out visits to app pages must come back
 * to the same page and query after sign-in.
 */

import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

function request(url: string, signedIn: boolean) {
  const req = new NextRequest(url);
  if (signedIn) req.cookies.set("authjs.session-token", "token");
  return req;
}

function location(res: Response) {
  const value = res.headers.get("location");
  return value ? new URL(value).pathname + new URL(value).search : null;
}

describe("proxy", () => {
  it("sends a signed-in visitor with a template to the campaign builder", () => {
    const res = proxy(request("http://localhost/login?template=fitness-plan", true));
    expect(location(res)).toBe("/campaigns/new?template=fitness-plan");
  });

  it("sends a signed-in visitor to a same-site callbackUrl", () => {
    const res = proxy(
      request("http://localhost/login?callbackUrl=%2Fsettings%3Fplan%3DPRO%26billing%3Dyearly", true)
    );
    expect(location(res)).toBe("/settings?plan=PRO&billing=yearly");
  });

  it("never follows a callbackUrl to another site", () => {
    const res = proxy(request("http://localhost/login?callbackUrl=%2F%2Fevil.example%2Fx", true));
    expect(location(res)).toBe("/dashboard");
  });

  it("ignores a template slug that isn't a slug", () => {
    const res = proxy(request("http://localhost/login?template=..%2F..%2Fadmin", true));
    expect(location(res)).toBe("/dashboard");
  });

  it("protects the campaign builder and keeps the template through sign-in", () => {
    const res = proxy(request("http://localhost/campaigns/new?template=fitness-plan", false));
    const target = new URL(res.headers.get("location")!);
    expect(target.pathname).toBe("/login");
    expect(target.searchParams.get("callbackUrl")).toBe("/campaigns/new?template=fitness-plan");
  });
});
