export interface PullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  votes: number;
  createdAt: string;
  votesNeeded: number;
}

export interface LastMergedInfo {
  prNumber: number;
  score: number;
  mergedAt: string;
  title: string;
}

interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  user: {
    login: string;
  };
  created_at: string;
}

interface GitHubSearchResult {
  items: Array<{
    number: number;
    title: string;
    pull_request: {
      merged_at: string | null;
    };
  }>;
}

interface GitHubReaction {
  content: string;
}

const GITHUB_REPO = "skridlevsky/openchaos";
const MINIMUM_OVERRIDE_SCORE = 5;

function getHeaders(accept: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: accept };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}



function getVotesNeeded(prScore: number, lastMergedScore: number): number {
  return Math.max(lastMergedScore + 1, MINIMUM_OVERRIDE_SCORE) - prScore;
}

/**
 * Fetches the last merged PR info using GitHub Search API with is:merged filter
 */
export async function getLastMergedInfo(): Promise<LastMergedInfo | null> {
  try {
    const [owner, repo] = GITHUB_REPO.split("/");

    // Use Search API to get only merged PRs directly, excluding maintenance PRs
    const response = await fetch(
      `https://api.github.com/search/issues?q=repo:${owner}/${repo}+is:pr+is:merged+-label:maintenance&sort=updated&order=desc&per_page=1`,
      {
        headers: getHeaders("application/vnd.github.v3+json"),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch merged PRs: ${response.status}`);
      return null;
    }

    const result: GitHubSearchResult = await response.json();

    if (result.items.length === 0) {
      return {
        prNumber: 0,
        score: 0,
        mergedAt: new Date().toISOString(),
        title: "Initial",
      };
    }

    const lastMerged = result.items[0];
    const score = await getPRVotes(owner, repo, lastMerged.number);
    console.log("Score:", score);
    
    return {
      prNumber: lastMerged.number,
      score,
      mergedAt: lastMerged.pull_request.merged_at!,
      title: lastMerged.title,
    };
  } catch (error) {
    console.error("Error fetching last merged info:", error);
    return null;
  }
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
        next: { revalidate: 300 },
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

  // Fetch last merged info for override calculation
  const lastMerged = await getLastMergedInfo();
  const lastMergedScore = lastMerged?.score ?? 0;

  // Fetch reactions for each PR
  const prsWithVotes = await Promise.all(
    allPRs.map(async (pr) => {
      const votes = await getPRVotes(owner, repo, pr.number);
      return {
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        url: pr.html_url,
        votes,
        createdAt: pr.created_at,
        votesNeeded: 0, // Will be calculated for first PR only
      };
    }),
  );

  // Sort by votes descending
  const sortedPRs = prsWithVotes.sort((a, b) => {
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Calculate votesNeeded only for the leading PR
  if (sortedPRs.length > 0) {
    sortedPRs[0].votesNeeded = getVotesNeeded(sortedPRs[0].votes, lastMergedScore);
  }

  return sortedPRs;
}

async function getPRVotes(owner: string, repo: string, prNumber: number): Promise<number> {
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

  return allReactions.filter((r) => r.content === "+1").length - allReactions.filter((r) => r.content === "-1").length;
}
