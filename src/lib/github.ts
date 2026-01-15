import { loadWasm } from "@/lib/wasm";
import { unstable_cache } from "next/cache";

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  votes: number;
  createdAt: string;
}

const GITHUB_REPO = "skridlevsky/openchaos";
const REVALIDATE_SECONDS = 300;

const getOpenPRsCached = unstable_cache(
  async () => {
    const wasm = await loadWasm();
    return (await wasm.get_open_prs(GITHUB_REPO)) as PullRequest[];
  },
  ["open-prs", GITHUB_REPO],
  { revalidate: REVALIDATE_SECONDS }
);

function getHeaders(accept: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: accept };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function getOpenPRs(): Promise<PullRequest[]> {
<<<<<<< HEAD
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

  // Fetch reactions for each PR
  const prsWithVotes = await Promise.all(
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
||||||| 4f9c9f1
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
  const prsWithVotes = await Promise.all(
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

  // Sort by votes descending
  return prsWithVotes.sort((a, b) => b.votes - a.votes);
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
=======
  return getOpenPRsCached();
>>>>>>> rewrite-it-in-rust
}
