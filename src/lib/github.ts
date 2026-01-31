export interface PullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  votes: number;
  createdAt: string;
}

export interface MergedPullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  mergedAt: string;
}

/**
 * Fetch open PRs with vote counts from API
 * (API calls Rust/WASM on the server)
 */
export async function getOpenPRs(): Promise<PullRequest[]> {
  const response = await fetch('/api/github/prs');

  if (!response.ok) {
    throw new Error(`Failed to fetch PRs: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch recently merged PRs from API
 * (API calls Rust/WASM on the server)
 */
export async function getMergedPRs(limit: number = 10): Promise<MergedPullRequest[]> {
  const response = await fetch(`/api/github/merged?limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch merged PRs: ${response.status}`);
  }

  return response.json();
}
