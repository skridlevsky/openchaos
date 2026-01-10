import { DEFAULT_PHYSICS, type PhysicsConfig } from "@/config/physics";

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  votes: number;
  createdAt: string;
  isPhysicsPR?: boolean;
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

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=open`,
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
        headers: getHeaders("application/vnd.github.squirrel-girl-preview+json"),
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

interface GitHubFile {
  filename: string;
}

async function getPRFiles(
  owner: string,
  repo: string,
  prNumber: number
): Promise<string[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`,
    {
      headers: getHeaders("application/vnd.github.v3+json"),
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    return [];
  }

  const files: GitHubFile[] = await response.json();
  return files.map((f) => f.filename);
}

export async function getOpenPRsWithPhysicsFlag(): Promise<PullRequest[]> {
  const [owner, repo] = GITHUB_REPO.split("/");

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=open`,
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

  const prsWithVotes = await Promise.all(
    prs.map(async (pr) => {
      const [votes, files] = await Promise.all([
        getPRVotes(owner, repo, pr.number),
        getPRFiles(owner, repo, pr.number),
      ]);
      const isPhysicsPR = files.some((f) => f.includes("config/physics"));
      return {
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        url: pr.html_url,
        votes,
        createdAt: pr.created_at,
        isPhysicsPR,
      };
    })
  );

  return prsWithVotes.sort((a, b) => b.votes - a.votes);
}

export async function getActivePhysics(): Promise<PhysicsConfig> {
  try {
    const prs = await getOpenPRsWithPhysicsFlag();
    const physicsPRs = prs.filter((pr) => pr.isPhysicsPR);

    if (physicsPRs.length === 0) {
      return DEFAULT_PHYSICS;
    }

    // The top-voted physics PR wins
    // For now, just return defaults - actual config parsing would require
    // fetching and parsing the PR diff, which adds complexity
    // The PR system still works for voting intent
    return DEFAULT_PHYSICS;
  } catch {
    return DEFAULT_PHYSICS;
  }
}
