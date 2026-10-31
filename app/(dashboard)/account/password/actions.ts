"use server";

import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { verifyCurrentPassword } from "@/lib/auth-password/authenticate";
import { hashPassword, passwordProblem } from "@/lib/auth-password/hash";
import { mayChangeWithoutCurrentPassword } from "@/lib/auth-password/reauth";
import { currentSession, endOtherSessions } from "@/lib/auth-password/session";

export interface SetPasswordState {
  error: string | null;
  /** Set once the password is saved; the form shows a confirmation. */
  saved?: boolean;
}

/**
 * Sets or changes the signed-in user's password. Only someone signed in can
 * reach this, and signing in means following an email link or knowing the
 * old password, so the email is already proven. Replacing an existing
 * password also needs the current one, unless this session was started by an
 * email link in the last 15 minutes. Other sessions end, so a changed password locks out anyone who had
 * the old one.
 */
export async function setPassword(
  _previous: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) redirect("/login");
  const session = await currentSession(userId);

  // An open session isn't enough to replace an existing password: the old
  // password, or a fresh email-link sign-in, has to back it up.
  if (!mayChangeWithoutCurrentPassword(user, session)) {
    const current = String(formData.get("current") ?? "");
    const check = await verifyCurrentPassword(userId, user.passwordHash, current);
    if (check === "locked") {
      return { error: "Too many tries. Wait 15 minutes, or sign out and use \"Forgot password?\"." };
    }
    if (check === "invalid") {
      return { error: "Your current password isn't right. Forgot it? Sign out and use \"Forgot password?\"." };
    }
  }

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
  // The link's window is used up: a later change needs the new password.
  if (session) await prisma.session.update({ where: { id: session.id }, data: { createdAt: null } });

  // Confirm in place rather than redirecting: a redirect lands somewhere that
  // says nothing about the change, after the form has already gone blank.
  return { error: null, saved: true };
}
