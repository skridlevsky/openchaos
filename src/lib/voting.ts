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

// ---------------------------------------------------------------------------
// GitHub Actions helpers — accept the Octokit client from actions/github-script
// ---------------------------------------------------------------------------

export interface RankedPR {
  number: number;
  title: string;
  author: string;
  createdAt: string;
  thumbsUp: number;
  thumbsDown: number;
  votes: number;
}

/**
 * Fetch all open PRs, tally votes, and return them sorted by votes descending
 * (newest first for ties).
 */
export async function getRankedPRs(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  github: any,
  owner: string,
  repo: string,
): Promise<RankedPR[]> {
  let allPRs: any[] = [];
  let page = 1;
  while (true) {
    const res = await github.rest.pulls.list({ owner, repo, state: 'open', per_page: 100, page });
    allPRs = allPRs.concat(res.data);
    if (res.data.length < 100) break;
    page++;
  }

  const results = await Promise.allSettled(
    allPRs.map(async (pr: any) => {
      let allReactions: any[] = [];
      let reactPage = 1;
      while (true) {
        const res = await github.rest.reactions.listForIssue({
          owner, repo, issue_number: pr.number, per_page: 100, page: reactPage,
        });
        allReactions = allReactions.concat(res.data);
        if (res.data.length < 100) break;
        reactPage++;
      }
      const tally = tallyReactions(allReactions);
      return {
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        createdAt: pr.created_at,
        thumbsUp: tally.upvotes,
        thumbsDown: tally.downvotes,
        votes: tally.total,
      };
    }),
  );

  const prs: RankedPR[] = [];
  for (const [i, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      prs.push(result.value);
    } else {
      console.log(`  WARNING: Failed to fetch reactions for PR #${allPRs[i].number}: ${(result as PromiseRejectedResult).reason.message}`);
    }
  }

  return prs.sort((a, b) => (b.votes - a.votes) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}

export type EvaluationResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Evaluate whether a PR is eligible to be merged.
 * Checks: no conflicts, rhyming title, commit status, CI check runs.
 */
export async function evaluatePR(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  github: any,
  owner: string,
  repo: string,
  pr: RankedPR,
): Promise<EvaluationResult> {
  // Mergeability (GitHub computes it lazily — retry up to 3 times)
  let detail = await github.rest.pulls.get({ owner, repo, pull_number: pr.number });
  let mergeable = detail.data.mergeable;
  for (let retry = 1; mergeable === null && retry <= 3; retry++) {
    const delay = retry * 3000;
    console.log(`  Mergeability not yet computed, retry ${retry}/3 in ${delay}ms...`);
    await new Promise((r) => setTimeout(r, delay));
    detail = await github.rest.pulls.get({ owner, repo, pull_number: pr.number });
    mergeable = detail.data.mergeable;
  }
  if (mergeable === null) return { ok: false, reason: 'mergeability unknown after retries' };
  if (mergeable === false) return { ok: false, reason: 'has merge conflicts' };

  if (!hasRhymingWords(pr.title)) return { ok: false, reason: "title doesn't contain rhyming words" };

  const sha: string = detail.data.head.sha;

  const statuses = await github.rest.repos.getCombinedStatusForRef({ owner, repo, ref: sha });
  if (!commitStatusPassed(statuses.data.state)) return { ok: false, reason: `commit status is ${statuses.data.state}` };

  const checkRuns = await github.rest.checks.listForRef({ owner, repo, ref: sha });
  if (!checksPassed(checkRuns.data.check_runs)) return { ok: false, reason: 'incomplete or failing CI checks' };

  return { ok: true };
}
