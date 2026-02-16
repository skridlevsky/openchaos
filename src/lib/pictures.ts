const GITHUB_ATTACHMENT_PATTERNS = [
  /https:\/\/github\.com\/user-attachments\/assets\//,
  /https:\/\/user-images\.githubusercontent\.com\//,
  /https:\/\/github\.com\/[^/]+\/[^/]+\/assets\//,
];

/**
 * Checks if a PR body contains at least one GitHub-uploaded image.
 * External image URLs don't count — you gotta actually upload something.
 */
export function hasPicture(body: string | null): boolean {
  if (!body) return false;
  return GITHUB_ATTACHMENT_PATTERNS.some((pattern) => pattern.test(body));
}
