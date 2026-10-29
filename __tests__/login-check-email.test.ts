/**
 * Login "check your email" state — Unit Tests
 *
 * Auth.js appends its own query string to the verify-request page, so the
 * login page must recognise the redirect it actually sends.
 */

import { describe, it, expect } from "vitest";
import { isCheckEmailRedirect } from "../lib/login/check-email";

describe("isCheckEmailRedirect", () => {
  it("recognises the redirect Auth.js sends after emailing the link", () => {
    expect(isCheckEmailRedirect({ provider: "nodemailer", type: "email" })).toBe(true);
    expect(isCheckEmailRedirect({ provider: "resend", type: "email" })).toBe(true);
  });

  it("still honours the old ?checkEmail=1 link", () => {
    expect(isCheckEmailRedirect({ checkEmail: "1" })).toBe(true);
  });

  it("shows the sign-in form otherwise", () => {
    expect(isCheckEmailRedirect({})).toBe(false);
    expect(isCheckEmailRedirect({ callbackUrl: "/dashboard" })).toBe(false);
  });
});
