import { getDailyVoteEmojis } from "./chaos-emojis";

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  votes: number;
  upvotes: number;
  downvotes: number;
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
}

interface GitHubReaction {
  content: string;
}

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

  // Get today's chaos emojis
  const { upvoteContent, downvoteContent } = getDailyVoteEmojis();

  // Fetch reactions for each PR
  const prsWithVotes = await Promise.all(
    prs.map(async (pr) => {
      const voteData = await getPRVotes(owner, repo, pr.number, upvoteContent, downvoteContent);
      return {
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        url: pr.html_url,
        votes: voteData.votes,
        upvotes: voteData.upvotes,
        downvotes: voteData.downvotes,
        createdAt: pr.created_at,
      };
    }),
  );

  // Sort by votes descending
  return prsWithVotes.sort((a, b) => {
    // 1. Primary Sort: Net Score
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }

    // 2. Secondary Sort: Creation Date (Newest Wins)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

async function getPRVotes(
  owner: string,
  repo: string,
  prNumber: number,
  upvoteContent: string,
  downvoteContent: string
): Promise<{ votes: number; upvotes: number; downvotes: number }> {
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

  const upvotes = allReactions.filter((r) => r.content === upvoteContent).length;
  const downvotes = allReactions.filter((r) => r.content === downvoteContent).length;

  return {
    votes: upvotes - downvotes,
    upvotes,
    downvotes
  };
}
