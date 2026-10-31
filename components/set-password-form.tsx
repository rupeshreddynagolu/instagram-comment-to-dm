"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { emailResetLink, setPassword, type SetPasswordState } from "@/app/(dashboard)/account/password/actions";

const field =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

/** New password twice, with a show/hide toggle; the action does the checks. */
export default function SetPasswordForm({
  next,
  hasPassword,
  needsCurrent,
}: {
  next: string;
  hasPassword: boolean;
  /** Ask for the current password (no recent email-link sign-in). */
  needsCurrent: boolean;
}) {
  const [state, action, pending] = useActionState<SetPasswordState, FormData>(setPassword, {
    error: null,
  });
  const [shown, setShown] = useState(false);
  const type = shown ? "text" : "password";
  const confirmation = useRef<HTMLDivElement>(null);

  // Move focus to the confirmation so screen readers announce it.
  useEffect(() => {
    if (state.saved) confirmation.current?.focus();
  }, [state.saved]);

  if (state.saved) {
    return (
      <div ref={confirmation} tabIndex={-1} role="status" className="space-y-4 outline-none">
        <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 px-4 py-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-success" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.25 7.3a1 1 0 0 1-1.42 0L4.78 10.7a1 1 0 1 1 1.42-1.4l2.54 2.56 6.54-6.6a1 1 0 0 1 1.42.04Z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {hasPassword ? "Password changed" : "Password saved"}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {hasPassword
                ? "Use it next time you sign in. You've been signed out on your other devices."
                : "Next time, sign in with your email and this password. Email links keep working too."}
            </p>
          </div>
        </div>
        <Link
          href={next}
          className="flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-site-ink transition-colors hover:bg-accent-hover"
        >
          Continue
        </Link>
      </div>
    );
  }

  return (
    <>
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        {needsCurrent && (
          <div className="space-y-1.5">
            <label htmlFor="current" className="block text-sm font-medium text-foreground">
              Current password
            </label>
            <input id="current" name="current" type={type} required autoComplete="current-password" className={field} />
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            {hasPassword ? "New password" : "Password"}
          </label>
          <input
            id="password"
            name="password"
            type={type}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            aria-describedby="password-help"
            className={field}
          />
          <p id="password-help" className="text-xs text-muted">
            At least 8 characters. A short sentence you&apos;ll remember works well.
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirm" className="block text-sm font-medium text-foreground">
            Type it again
          </label>
          <input id="confirm" name="confirm" type={type} required autoComplete="new-password" className={field} />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={shown} onChange={(event) => setShown(event.target.checked)} />
          Show passwords
        </label>

        {state.error && (
          <p role="alert" className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-site-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Saving…" : hasPassword ? "Change password" : "Save password"}
        </button>

        {/* First time only: a password is optional, email links still work. */}
        {!hasPassword && (
          <p className="text-center text-sm">
            <Link href={next} className="text-muted underline-offset-4 hover:text-foreground hover:underline">
              Skip for now
            </Link>
          </p>
        )}
      </form>

      {/* Forgotten the current one: a fresh email link proves it's them instead. */}
      {needsCurrent && (
        <form action={emailResetLink} className="mt-5 border-t border-border pt-5 text-center text-sm text-muted">
          <input type="hidden" name="next" value={next} />
          Forgot your current password?{" "}
          <button type="submit" className="font-medium text-foreground underline-offset-4 hover:underline">
            Email me a sign-in link
          </button>
        </form>
      )}
    </>
  );
}
