/** How recent an email-link sign-in must be to change a password without the old one. */
export const LINK_REAUTH_MS = 15 * 60 * 1000;

/**
 * Whether the signed-in user may set a new password without typing the
 * current one: when there isn't one yet, or right after signing in with an
 * email link (the "Forgot password?" path). Anyone else at an open session
 * has to know the current password.
 */
export function mayChangeWithoutCurrentPassword(
  user: { passwordHash: string | null; lastLinkSignInAt: Date | null },
  now: Date = new Date()
): boolean {
  if (!user.passwordHash) return true;
  if (!user.lastLinkSignInAt) return false;
  return now.getTime() - user.lastLinkSignInAt.getTime() <= LINK_REAUTH_MS;
}
