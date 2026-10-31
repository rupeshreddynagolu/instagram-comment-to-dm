import type { BillingInterval, PaidPlan } from "@/lib/billing/plans";

/** Yearly billing is this many percent off twelve monthly payments. */
export const YEARLY_DISCOUNT_PERCENT = 20;

/**
 * What each paid plan costs in rupees, per billing interval. These must match
 * the Razorpay plans named in RAZORPAY_PLAN_* (monthly) and
 * RAZORPAY_PLAN_*_YEARLY (yearly); Razorpay is what actually charges.
 */
export const PLAN_PRICES_INR: Record<PaidPlan, Record<BillingInterval, number>> = {
  PRO: { MONTHLY: 1599, YEARLY: 15350 },
  AGENCY: { MONTHLY: 3999, YEARLY: 38390 },
};

/** The yearly price spread over twelve months, rounded down to the rupee. */
export function monthlyEquivalentInr(plan: PaidPlan): number {
  return Math.floor(PLAN_PRICES_INR[plan].YEARLY / 12);
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
