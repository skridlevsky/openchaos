/**
 * Build the in-app user profile URL for a theme.
 * Use this so author links go to /THEME/users/USERNAME instead of github.com/USERNAME.
 */
export function getAuthorProfileHref(themePath: string, username: string): string {
  const base = themePath ? `/${themePath}` : "";
  return `${base}/users/${encodeURIComponent(username)}`;
}
