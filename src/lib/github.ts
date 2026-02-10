export interface PullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  votes: number;
  createdAt: string;
  isMergeable: boolean;
  checksPassed: boolean;
  hotScore: number;
  isTrending: boolean;
}

interface PRVotes {
  total: number;
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
  const prsWithVotes = await Promise.all(
    prs.map(async (pr) => {
      const votes = await getPRReactions(owner, repo, pr.number);
      const isMergeable = await getPRMergeStatus(owner, repo, pr.number);
      const checksPassed = await getCommitStatus(owner, repo, pr.head.sha);

      return {
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        url: pr.html_url,
        votes: votes.total,
        createdAt: pr.created_at,
        isMergeable,
        checksPassed,
        hotScore: calculateHotScore(votes),
        isTrending: false, // Set by getOrganizedPRs based on top 5 hot score
      };
    }),
  );

  // Sort: mergeable PRs first, then by votes descending, ties by newest
  return prsWithVotes.sort((a, b) => {
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
}

/**
 * Get PRs organized into two lists:
 * 1. All PRs sorted by votes (merge candidates)
 * 2. All PRs sorted by hot score (trending), excluding those in top 5 by votes
 *
 * The isTrending flag is set based on whether a PR is in the top 5 by hot score.
 */
export async function getOrganizedPRs(): Promise<{
  topByVotes: PullRequest[];
  trending: PullRequest[];
}> {
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

  const top10ByVotesNumbers = new Set(topByVotes.slice(0, 10).map((pr) => pr.number));

  // Trending section: sorted by hot score (7-day votes), excluding those in top 5 by votes
  // PRs with conflicts go to the bottom
  const trending = [...prsWithTrending]
    .filter((pr) => !top10ByVotesNumbers.has(pr.number))
    .sort((a, b) => {
      if (a.isMergeable !== b.isMergeable) {
        return a.isMergeable ? -1 : 1;
      }
      if (b.hotScore !== a.hotScore) {
        return b.hotScore - a.hotScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return { topByVotes, trending };
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
      // console.error(`Failed to fetch reactions for PR #${prNumber}: ${response.status} with message ${await response.text()}`);
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

  const sevenDaysAgo = Date.now() - SEVEN_DAYS_MS;
  const recentReactions = allReactions.filter(
    (r) => new Date(r.created_at).getTime() >= sevenDaysAgo,
  );

  return {
    total: allReactions.filter((r) => r.content === "+1").length - allReactions.filter((r) => r.content === "-1").length,
    recentPositive: recentReactions.filter((r) => r.content === "+1").length,
    recentNegative: recentReactions.filter((r) => r.content === "-1").length,
  };
}

async function getPRMergeStatus(
  owner: string,
  repo: string,
  prNumber: number
): Promise<boolean> {
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
    return true;
  }

  const data: GitHubPRDetail = await response.json();

  // GitHub computes mergeability lazily — null means "not yet computed", not
  // "has conflicts". Default to true and let the next ISR cycle pick up the
  // real value.
  return data.mergeable ?? true;
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

export async function getMergedPRs(): Promise<MergedPullRequest[]> {
  const [owner, repo] = GITHUB_REPO.split("/");

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=20`,
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

  // Filter to only merged PRs (not just closed), exclude repo owner's maintenance PRs
  // Sort by merge time (newest first) since sort=updated may not reflect merge order
  const REPO_OWNER = owner;
  return prs
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
