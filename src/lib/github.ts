import { validateKey, Key, keypath } from "./engine/common/libgogonuts/process";
import { hasRhymingWords } from "./rhymes";
export interface PullRequest {
  rank: number;
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
