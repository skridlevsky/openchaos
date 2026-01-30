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
 */
export async function getOpenPRs(): Promise<PullRequest[]> {
  try {
    const wasm = await loadWasm();
    return await wasm.get_open_prs();
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
    return await wasm.get_merged_prs(limit);
  } catch (error) {
    console.error('Failed to fetch merged PRs via WASM:', error);
    throw error;
  }
}
