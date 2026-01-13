export interface PullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  approvals: number;
  sha: string;
  createdAt: string;
}

interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  user: {
    login: string;
  };
  head: {
    sha: string;
  };
  created_at: string;
}

interface GitHubApproval {
  state: string;
  commit_id: string;
  submitted_at: string;
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

  // Fetch reactions for each PR
  const prsWithApprovals = await Promise.all(
    prs.map(async (pr) => {
      const approvals = await getPRApprovals(owner, repo, pr.number, pr.head.sha);
      return {
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        url: pr.html_url,
        approvals,
        sha: pr.head.sha,
        createdAt: pr.created_at,
      };
    }),
  );

  // Sort by approvals descending
  return prsWithApprovals.sort((a, b) => {
    // 1. Primary Sort: Code approvals (Highest Wins)
    if (b.approvals !== a.approvals) {
      return b.approvals - a.approvals;
    }

    // 2. Secondary Sort: Creation Date (Newest Wins)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

async function getPRApprovals(owner: string, repo: string, prNumber: number, sha: string): Promise<number> {
  let allApprovals: GitHubApproval[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews?per_page=100&page=${page}`,
      {
        headers: getHeaders("application/vnd.github.v3+json"),
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      break;
    }

    const approvals: GitHubApproval[] = await response.json();

    if (approvals.length === 0) {
      break;
    }

    allApprovals = allApprovals.concat(approvals.filter(a => a.commit_id === sha));

    if (approvals.length < 100) {
      break;
    }

    page++;
  }

  return allApprovals.filter((a) => a.state === "APPROVED").length
}
