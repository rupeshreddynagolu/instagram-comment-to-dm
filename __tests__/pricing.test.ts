/**
 * Pricing — Unit Tests
 *
 * The yearly prices shown on the site must stay the advertised discount off
 * twelve monthly payments.
 */

import { describe, it, expect } from "vitest";
import {
  formatInr,
  monthlyEquivalentInr,
  PLAN_PRICES_INR,
  YEARLY_DISCOUNT_PERCENT,
} from "../lib/billing/pricing";

describe("plan pricing", () => {
  it("prices yearly at the advertised discount, to the rupee", () => {
    for (const plan of ["PRO", "AGENCY"] as const) {
      const { MONTHLY, YEARLY } = PLAN_PRICES_INR[plan];
      const discounted = (MONTHLY * 12 * (100 - YEARLY_DISCOUNT_PERCENT)) / 100;
      expect(Math.abs(YEARLY - discounted)).toBeLessThan(1);
    }
  });

  it("shows the yearly price as a monthly figure without rounding up", () => {
    expect(monthlyEquivalentInr("PRO")).toBe(1279);
    expect(monthlyEquivalentInr("AGENCY")).toBe(3199);
  });

  it("formats rupees with Indian digit grouping", () => {
    expect(formatInr(15350)).toBe("₹15,350");
    expect(formatInr(138390)).toBe("₹1,38,390");
  });
});
