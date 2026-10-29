/**
 * Whether the login page should show "Check your email".
 *
 * After sending a magic link, Auth.js redirects to the verify-request page
 * with its own query string appended (?provider=...&type=email). The page is
 * plain /login, so that redirect is recognised by type=email. ?checkEmail=1
 * is still accepted for links made before this.
 */
export function isCheckEmailRedirect(params: {
  checkEmail?: string;
  type?: string;
  [key: string]: string | undefined;
}): boolean {
  return params.type === "email" || params.checkEmail === "1";
}
