import rhymesWith from 'rhymes-with';

/**
 * Return true if the title contains at least two words that rhyme with each other.
 */
export function hasRhymingWords(title: string): boolean {
  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);

  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if (words[i] !== words[j] && rhymesWith(words[i], words[j])) return true;
    }
  }

  return false;
}

/**
 * Return true if the legacy commit status is not failing or pending.
 * 'pending' means CI is still running and the PR should not be merged yet.
 */
export function commitStatusPassed(state: string): boolean {
  return state !== 'pending' && state !== 'failure' && state !== 'error';
}

export interface PRVotes {
  total: number;
  upvotes: number;
  downvotes: number;
  recentPositive: number;
  recentNegative: number;
}

/**
 * Tally reactions into a PRVotes object.
 * @param reactions List of reactions with content and created_at fields
 * @param windowMs Time window in ms for "recent" reactions (default: 7 days)
 */
export function tallyReactions(
  reactions: { content: string; created_at: string }[],
  windowMs = 7 * 24 * 60 * 60 * 1000,
): PRVotes {
  const upvotes = reactions.filter((r) => r.content === "+1").length;
  const downvotes = reactions.filter((r) => r.content === "-1").length;

  const cutoff = Date.now() - windowMs;
  const recent = reactions.filter((r) => new Date(r.created_at).getTime() >= cutoff);

  return {
    total: upvotes - downvotes,
    upvotes,
    downvotes,
    recentPositive: recent.filter((r) => r.content === "+1").length,
    recentNegative: recent.filter((r) => r.content === "-1").length,
  };
}

/**
 * Calculate a "hot score" based on net votes from the recent window.
 * Simple and transparent: the PR with the most recent voting activity wins.
 */
export function calculateHotScore(votes: PRVotes): number {
  return votes.recentPositive - votes.recentNegative;
}

/**
 * Return true if all check runs have passed.
 * 'skipped' is treated as passing — it means the check was not applicable
 * to this PR (e.g. backend tests skipped on a frontend-only change).
 */
export function checksPassed(
  checkRuns: { status: string; conclusion: string | null }[],
): boolean {
  if (checkRuns.length === 0) return true;
  return checkRuns.every(
    (run) =>
      run.status === "completed" &&
      (run.conclusion === "success" || run.conclusion === "skipped"),
  );
}
