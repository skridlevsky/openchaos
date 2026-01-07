export interface PullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  votes: number;
  createdAt: string;
}

interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  user: {
    login: string;
  };
  created_at: string;
  merged: boolean;
}

interface GitHubReaction {
  content: string;
}

const GITHUB_REPO = "skridlevsky/openchaos";

async function getVotesForPRList(prs: GitHubPR[], owner: string, repo: string) {
  return await Promise.all(
    prs.map(async (pr) => {
      const votes = await getPRVotes(owner, repo, pr.number);
      return {
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        url: pr.html_url,
        votes,
        createdAt: pr.created_at,
      };
    })
  );
}

export async function getOpenPRs(): Promise<PullRequest[]> {
  const [owner, repo] = GITHUB_REPO.split("/");

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=open`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
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

  // Fetch reactions for each PR
  return await getVotesForPRList(prs, owner, repo);
}

export async function getMergedPRsByUser(): Promise<{[k: string]: PullRequest[]}> {
  const [owner, repo] = GITHUB_REPO.split("/");

  const closedPagingURL = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&page=`;
  let prsMerged: GitHubPR[] = [];
  let page = 1;
  while (true) {
    const response = await fetch(
      closedPagingURL + page,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: {revalidate: 300}, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Rate limited by GitHub API");
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const prs: GitHubPR[] = await response.json();
    page += 1;
    if (prs.length === 0) break;
    prsMerged = prsMerged.concat(prs.filter(p => p.merged))
  }
  const prsByUser: {[user: string]: GitHubPR[]} = {};
  for(const pr of prsMerged) {
    if (!(pr.user.login in prsByUser)) {
      prsByUser[pr.user.login] = [];
    }
    prsByUser[pr.user.login].push(pr);
  }
  const prWithVotesByUser: {[user: string]: PullRequest[]} = {};
  for(const user in prWithVotesByUser) {
    prWithVotesByUser[user] = await getVotesForPRList(prsByUser[user], owner, repo);
  }
  return prWithVotesByUser;
}

async function getPRVotes(
  owner: string,
  repo: string,
  prNumber: number
): Promise<number> {
  let allReactions: GitHubReaction[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/reactions?per_page=100&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github.squirrel-girl-preview+json",
        },
        next: { revalidate: 300 },
      }
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

  return allReactions.filter((r) => r.content === "+1").length;
}