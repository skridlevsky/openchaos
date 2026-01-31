import { loadWasm } from './wasm';

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
 * Fetch open PRs with vote counts (via Rust/WASM)
 *
 * Note: No GitHub token required, but may hit rate limits.
 * Rate limit: 60 requests/hour without token, 5000/hour with token.
 */
export async function getOpenPRs(): Promise<PullRequest[]> {
  try {
    const wasm = await loadWasm();
    // Token is optional - works without it, just hits rate limits faster
    return await wasm.get_open_prs(undefined);
  } catch (error) {
    console.error('Failed to fetch open PRs via WASM:', error);
    throw error;
  }
}

/**
 * Fetch recently merged PRs (via Rust/WASM)
 */
export async function getMergedPRs(limit: number = 10): Promise<MergedPullRequest[]> {
  try {
    const wasm = await loadWasm();
    return await wasm.get_merged_prs(limit, undefined);
  } catch (error) {
    console.error('Failed to fetch merged PRs via WASM:', error);
    throw error;
  }
}
