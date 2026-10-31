import Link from "next/link";
import SetPasswordForm from "@/components/set-password-form";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { safeCallbackPath } from "@/lib/auth-password/callback";
import { mayChangeWithoutCurrentPassword } from "@/lib/auth-password/reauth";
import { currentSession } from "@/lib/auth-password/session";

export const metadata = { title: "Password - ReplyNxt" };

/**
 * Set a password after verifying the email with a link (new accounts and
 * "forgot password"), or change it later from Settings.
 */
export default async function PasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const userId = await getCurrentUserId();
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { email: true, passwordHash: true } })
    : null;
  const hasPassword = Boolean(user?.passwordHash);
  const needsCurrent = user ? !mayChangeWithoutCurrentPassword(user, await currentSession()) : false;
  const destination = safeCallbackPath(next, "/dashboard");

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      <section className="glass rounded-2xl p-6 sm:p-8">
        {!needsCurrent && <p className="text-xs font-medium text-success">Email verified</p>}
        <h1 className="mt-2 text-xl font-semibold text-foreground">
          {hasPassword ? "Change your password" : "Set a password"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {hasPassword
            ? "Changing it signs you out everywhere else."
            : `Next time, sign in as ${user?.email ?? "you"} with this password. Email links keep working too.`}
        </p>
        <div className="mt-6">
          <SetPasswordForm next={destination} hasPassword={hasPassword} needsCurrent={needsCurrent} />
        </div>
        {!hasPassword && (
          <p className="mt-4 text-center text-sm">
            <Link href={destination} className="text-muted underline-offset-4 hover:text-foreground hover:underline">
              Skip for now
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
