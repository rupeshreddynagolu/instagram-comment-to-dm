import type {
  BillingProvider,
  Prisma,
  SubscriptionStatus,
} from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/client";
import { getPlanForRazorpayPlanId } from "@/lib/billing/plans";
import type {
  RazorpaySubscription,
  RazorpaySubscriptionStatus,
} from "@/lib/razorpay";

const PAID_STATUSES: SubscriptionStatus[] = ["ACTIVE", "TRIALING"];

/**
 * A workspace pays through one provider at a time. A provider's webhook may
 * update the workspace when it already owns the subscription, or when the
 * workspace has no paid access — never while the other provider is billing it.
 * This keeps a late event from an old subscription (e.g. a Stripe
 * cancellation after switching to Razorpay) from downgrading a paying customer.
 */
export function ownedByOrUnpaid(
  provider: BillingProvider
): Prisma.WorkspaceWhereInput {
  return {
    OR: [
      { billingProvider: provider },
      { subscriptionStatus: { notIn: PAID_STATUSES } },
    ],
  };
}

export function mapRazorpayStatus(
  status: RazorpaySubscriptionStatus
): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "pending":
      return "PAST_DUE";
    // No paused state in our model; both mean charges have stopped.
    case "halted":
    case "paused":
      return "UNPAID";
    case "cancelled":
    case "completed":
    case "expired":
      return "CANCELED";
    // created/authenticated: the mandate is not charged yet, so no access.
    default:
      return "NONE";
  }
}

/**
 * Copy a Razorpay subscription's current state onto the workspace that
 * started it. Matched by subscription id, which the checkout route stores, so
 * a superseded checkout's subscription never touches the workspace.
 */
export async function syncRazorpaySubscription(
  subscription: RazorpaySubscription
) {
  return prisma.workspace.updateMany({
    where: {
      razorpaySubscriptionId: subscription.id,
      ...ownedByOrUnpaid("RAZORPAY"),
    },
    data: {
      billingProvider: "RAZORPAY",
      plan: getPlanForRazorpayPlanId(subscription.plan_id),
      subscriptionStatus: mapRazorpayStatus(subscription.status),
      razorpayPlanId: subscription.plan_id,
      razorpayCustomerId: subscription.customer_id ?? undefined,
      currentPeriodEnd: subscription.current_end
        ? new Date(subscription.current_end * 1000)
        : null,
    },
  });
}
