"use client";

import { useActionState, useState } from "react";
import { setPassword, type SetPasswordState } from "@/app/(dashboard)/account/password/actions";

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

  return (
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
    </form>
  );
}
