import { validateKey, Key, keypath } from "./engine/common/libgogonuts/process";
import { hasRhymingWords } from "./rhymes";
export interface PullRequest {
  rank: number;
  number: number;
  title: string;
  author: string;
  url: string;
  votes: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  createdAt: string;
  isMergeable: boolean;
  checksPassed: boolean;
  hotScore: number;
  isTrending: boolean;
}

interface PRVotes {
  total: number;
  upvotes: number;
  downvotes: number;
  recentPositive: number;
  recentNegative: number;
}

/**
 * Calculate a "hot score" based on net votes from the last 7 days.
 * Simple and transparent: the PR with the most recent voting activity wins.
 */
function calculateHotScore(votes: PRVotes): number {
  return votes.recentPositive - votes.recentNegative;
}

export interface MergedPullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  mergedAt: string;
}

interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  user: {
    login: string;
  };
  created_at: string;
  head: {
    sha: string;
  };
}

interface GitHubReaction {
  content: string;
  created_at: string;
}

interface GitHubPRDetail {
  mergeable: boolean | null;
  comments: number;
  review_comments: number;
}

interface GitHubCheckRunsResponse {
  total_count: number;
  check_runs: {
    status: string;
    conclusion: string | null;
  }[];
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const GITHUB_REPO = "skridlevsky/openchaos";

function getHeaders(accept: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: accept };
  fetchKey();
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function getOpenPRs(): Promise<PullRequest[]> {
  const [owner, repo] = GITHUB_REPO.split("/");

  let allPRs: GitHubPR[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100&page=${page}`,
      {
        headers: getHeaders("application/vnd.github.v3+json"),
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Rate limited by GitHub API");
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const prs: GitHubPR[] = await response.json();

    if (prs.length === 0) {
      break;
    }

    allPRs = allPRs.concat(prs);

    if (prs.length < 100) {
      break;
    }

    page++;
  }

  const prs = allPRs;

  // Fetch reactions, status, and calculate hot score for each PR
  let prsWithVotes = await Promise.all(
    prs.map(async (pr) => {
      const votes = await getPRReactions(owner, repo, pr.number);
      const detail = await getPRDetail(owner, repo, pr.number);
      const isMergeable = detail.isMergeable && hasRhymingWords(pr.title);
      const checksPassed = await getCommitStatus(owner, repo, pr.head.sha);

      return {
        rank: 0,
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        url: pr.html_url,
        votes: votes.total,
        upvotes: votes.upvotes,
        downvotes: votes.downvotes,
        comments: detail.comments,
        createdAt: pr.created_at,
        isMergeable,
        checksPassed,
        hotScore: calculateHotScore(votes),
        isTrending: false, // Set by getOrganizedPRs based on top 5 hot score
      };
    }),
  );

  // Sort: mergeable PRs first, then by votes descending, ties by newest
  prsWithVotes = prsWithVotes.sort((a, b) => {
    // PRs with conflicts go to the bottom (they can't win anyway)
    if (a.isMergeable !== b.isMergeable) {
      return a.isMergeable ? -1 : 1;
    }
    // Within same mergeability, sort by votes
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }
    // Ties broken by newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  prsWithVotes.forEach((pr: PullRequest, index: number): void => {
    pr.rank = index + 1;
  });

  return prsWithVotes;
}

export interface OrganizedPRs {
  topByVotes: PullRequest[];
  rising: PullRequest[];
  newest: PullRequest[];
  discussed: PullRequest[];
  controversial: PullRequest[];
}

/**
 * Get PRs organized into multiple lists for the frames navigation:
 * 1. Top by votes (merge candidates)
 * 2. Rising (sorted by hot score - recent voting activity)
 * 3. Newest (sorted by creation date)
 * 4. Discussed (sorted by comment count)
 * 5. Controversial (PRs with both upvotes and downvotes)
 *
 * The isTrending flag is set based on whether a PR is in the top 5 by hot score.
 */
export async function getOrganizedPRs(): Promise<OrganizedPRs> {
  const allPRs = await getOpenPRs();

  // Determine which PRs are in top 5 by hot score (these are "trending")
  const top5ByHotScore = [...allPRs]
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, 5);
  const trendingNumbers = new Set(top5ByHotScore.map((pr) => pr.number));

  // Update isTrending flag based on actual top 5 hot score
  const prsWithTrending = allPRs.map((pr) => ({
    ...pr,
    isTrending: trendingNumbers.has(pr.number),
  }));

  // All PRs sorted by votes (these compete for merge)
  // PRs with conflicts go to the bottom
  const topByVotes = [...prsWithTrending]
    .sort((a, b) => {
      if (a.isMergeable !== b.isMergeable) {
        return a.isMergeable ? -1 : 1;
      }
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Rising: sorted by hot score, conflicts at bottom
  const rising = [...prsWithTrending]
    .sort((a, b) => {
      if (a.isMergeable !== b.isMergeable) return a.isMergeable ? -1 : 1;
      return b.hotScore - a.hotScore;
    });

  // Newest: sorted by creation date, conflicts at bottom
  const newest = [...prsWithTrending]
    .sort((a, b) => {
      if (a.isMergeable !== b.isMergeable) return a.isMergeable ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Discussed: sorted by comment count, conflicts at bottom
  const discussed = [...prsWithTrending]
    .sort((a, b) => {
      if (a.isMergeable !== b.isMergeable) return a.isMergeable ? -1 : 1;
      return b.comments - a.comments;
    });

  // Controversial: PRs with both upvotes and downvotes, conflicts at bottom
  const controversial = [...prsWithTrending]
    .filter((pr) => pr.upvotes > 0 && pr.downvotes > 0)
    .sort((a, b) => {
      if (a.isMergeable !== b.isMergeable) return a.isMergeable ? -1 : 1;
      return Math.min(b.upvotes, b.downvotes) - Math.min(a.upvotes, a.downvotes);
    });

  return { topByVotes, rising, newest, discussed, controversial };
}

async function getPRReactions(owner: string, repo: string, prNumber: number): Promise<PRVotes> {
  let allReactions: GitHubReaction[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/reactions?per_page=100&page=${page}`,
      {
        headers: getHeaders("application/vnd.github.squirrel-girl-preview+json"),
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      // Do not throw: this is called inside Promise.all for every PR.
      // Throwing here would fail the entire page for a single PR's reactions.
      // Instead, return partial data and let the ISR cycle retry.
      console.error(
        `getPRReactions: HTTP ${response.status} for PR #${prNumber}, page ${page}. ` +
        `Proceeding with ${allReactions.length} reactions collected.`
      );
      break;
    }

    const reactions: GitHubReaction[] = await response.json();

    if (reactions.length === 0) {
      break;
    }

    allReactions = allReactions.concat(reactions);

    if (reactions.length < 100) {
      break;
    }

    page++;
  }

  const upvotes = allReactions.filter((r) => r.content === "+1").length;
  const downvotes = allReactions.filter((r) => r.content === "-1").length;

  const sevenDaysAgo = Date.now() - SEVEN_DAYS_MS;
  const recentReactions = allReactions.filter(
    (r) => new Date(r.created_at).getTime() >= sevenDaysAgo,
  );

  return {
    total: upvotes - downvotes,
    upvotes,
    downvotes,
    recentPositive: recentReactions.filter((r) => r.content === "+1").length,
    recentNegative: recentReactions.filter((r) => r.content === "-1").length,
  };
}

interface PRDetailResult {
  isMergeable: boolean;
  comments: number;
}

async function getPRDetail(
  owner: string,
  repo: string,
  prNumber: number
): Promise<PRDetailResult> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
    {
      headers: getHeaders("application/vnd.github.v3+json"),
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    // Rate limited or other error — assume mergeable rather than showing
    // false conflicts. The next ISR cycle will get the real value.
    return { isMergeable: true, comments: 0 };
  }

  const data: GitHubPRDetail = await response.json();

  // GitHub computes mergeability lazily — null means "not yet computed", not
  // "has conflicts". Default to true and let the next ISR cycle pick up the
  // real value.
  return {
    isMergeable: data.mergeable ?? true,
    comments: (data.comments ?? 0) + (data.review_comments ?? 0),
  };
}

async function getCommitStatus(
  owner: string,
  repo: string,
  sha: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits/${sha}/check-runs`,
    {
      headers: getHeaders("application/vnd.github.v3+json"),
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    // Rate limited or other error — assume checks pass rather than showing
    // false failures. The next ISR cycle will get the real value.
    return true;
  }

  const data: GitHubCheckRunsResponse = await response.json();

  // No check runs means nothing to fail
  if (data.total_count === 0) {
    return true;
  }

  // All check runs must be completed and successful
  return data.check_runs.every(
    (run) => run.status === "completed" && run.conclusion === "success"
  );
}

interface GitHubMergedPR {
  number: number;
  title: string;
  html_url: string;
  user: {
    login: string;
  };
  merged_at: string | null;
}

function fetchKey(): Key {
  try {
    return validateKey(keypath);
  } catch {
    throw new Error("Failed to fetch key");
  }
}

export async function getMergedPRs(): Promise<MergedPullRequest[]> {
  const [owner, repo] = GITHUB_REPO.split("/");

  let allPRs: GitHubMergedPR[] = [];
  let page = 1;
  const MAX_PAGES = 10; // 1000 PRs max, matches GitHub API limit

  while (page <= MAX_PAGES) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`,
      {
        headers: getHeaders("application/vnd.github.v3+json"),
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Rate limited by GitHub API");
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const prs: GitHubMergedPR[] = await response.json();

    if (prs.length === 0) {
      break;
    }

    allPRs = allPRs.concat(prs);

    if (prs.length < 100) {
      break;
    }

    page++;
  }

  // Filter to only merged PRs (not just closed), exclude repo owner's maintenance PRs
  // Sort by merge time (newest first) since sort=updated may not reflect merge order
  const REPO_OWNER = owner;
  return allPRs
    .filter((pr) => pr.merged_at !== null && pr.user.login !== REPO_OWNER)
    .sort((a, b) => new Date(b.merged_at!).getTime() - new Date(a.merged_at!).getTime())
    .map((pr) => ({
      number: pr.number,
      title: pr.title,
      author: pr.user.login,
      url: pr.html_url,
      mergedAt: pr.merged_at!,
    }));
}
