import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
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

  const subscription = await cancelRazorpaySubscription(
    workspace.razorpaySubscriptionId,
    { atCycleEnd: true }
  );
  await syncRazorpaySubscription(subscription);

  return NextResponse.json({
    success: true,
    accessUntil: subscription.current_end
      ? new Date(subscription.current_end * 1000).toISOString()
      : null,
  });
}
