"use server";

import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { safeCallbackPath } from "@/lib/auth-password/callback";
import { hashPassword, passwordProblem } from "@/lib/auth-password/hash";
import { endOtherSessions } from "@/lib/auth-password/session";

export interface SetPasswordState {
  error: string | null;
}

/**
 * Sets or changes the signed-in user's password. Only someone signed in can
 * reach this, and signing in means following an email link or knowing the
 * old password, so the email is already proven. Other sessions end, so a
 * changed password locks out anyone who had the old one.
 */
export async function setPassword(
  _previous: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  if (password !== confirm) return { error: "The two passwords don't match." };

  await prisma.user.update({
    where: { id: userId },
    // Signing in with the link already verified the email; record it in case
    // this account predates that.
    data: { passwordHash: await hashPassword(password), emailVerified: new Date() },
  });
  await endOtherSessions(userId);

  redirect(safeCallbackPath(String(formData.get("next") ?? ""), "/dashboard"));
}
