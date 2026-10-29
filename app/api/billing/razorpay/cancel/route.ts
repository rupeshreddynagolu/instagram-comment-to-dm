import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { billingProviderError } from "@/lib/billing/errors";
import { syncRazorpaySubscription } from "@/lib/billing/providers";
import { cancelRazorpaySubscription } from "@/lib/razorpay";
import {
  canManageBilling,
  getCurrentWorkspaceContext,
} from "@/lib/workspace-access";

// Razorpay has no hosted customer portal, so cancellation is ours to offer.
// The subscription stays active until the paid cycle ends.
export async function POST() {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!canManageBilling(context.role)) {
    return NextResponse.json(
      { success: false, error: "Only workspace owners can manage billing" },
      { status: 403 }
    );
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: context.workspaceId },
    select: { billingProvider: true, razorpaySubscriptionId: true },
  });

  if (
    workspace?.billingProvider !== "RAZORPAY" ||
    !workspace.razorpaySubscriptionId
  ) {
    return NextResponse.json(
      { success: false, error: "No Razorpay subscription to cancel" },
      { status: 400 }
    );
  }

  let subscription;
  try {
    subscription = await cancelRazorpaySubscription(
      workspace.razorpaySubscriptionId,
      { atCycleEnd: true }
    );
  } catch (error) {
    return billingProviderError("Razorpay", error);
  }
  await syncRazorpaySubscription(subscription);

  // Razorpay keeps the subscription "active" until the cycle ends and its
  // entity does not show the pending cancellation, so it is recorded here.
  await prisma.workspace.update({
    where: { id: context.workspaceId },
    data: { cancelAtPeriodEnd: true },
  });

  return NextResponse.json({
    success: true,
    accessUntil: subscription.current_end
      ? new Date(subscription.current_end * 1000).toISOString()
      : null,
  });
}
