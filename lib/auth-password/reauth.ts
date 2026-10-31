/** How recent this session's email-link sign-in must be to skip the old password. */
export const LINK_REAUTH_MS = 15 * 60 * 1000;

/**
 * Whether the signed-in user may set a new password without typing the
 * current one: when there isn't one yet, or when this very session was
 * started by an email link in the last 15 minutes (the "Forgot password?"
 * path). The window belongs to the session, so a link opened on one device
 * never lets an older session elsewhere change the password.
 */
export function mayChangeWithoutCurrentPassword(
  user: { passwordHash: string | null },
  session: { createdAt: Date | null; viaPassword: boolean } | null,
  now: Date = new Date()
): boolean {
  if (!user.passwordHash) return true;
  if (!session?.createdAt || session.viaPassword) return false;
  return now.getTime() - session.createdAt.getTime() <= LINK_REAUTH_MS;
}
