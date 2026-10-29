import { prisma } from "@/lib/db/client";
import { getEffectivePlan, PLAN_LIMITS } from "@/lib/billing/plans";

/**
 * Checks whether a workspace may create `adding` more campaigns on its plan.
 * Returns the message to show when it may not, or null when it may.
 */
export async function campaignLimitError(
  workspaceId: string,
  adding: number
): Promise<string | null> {
  const [workspace, campaignCount] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { plan: true, subscriptionStatus: true },
    }),
    prisma.automation.count({ where: { workspaceId } }),
  ]);
  if (!workspace) return "Workspace not found";

  const plan = getEffectivePlan(workspace.plan, workspace.subscriptionStatus);
  const { maxAutomations } = PLAN_LIMITS[plan];
  if (campaignCount + adding <= maxAutomations) return null;

  return `Plan limit reached. Your ${plan} plan allows up to ${maxAutomations} campaign(s).`;
}
