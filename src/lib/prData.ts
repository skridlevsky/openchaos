import { getOrganizedPRs, getMergedPRs, getPRsByAuthor } from "@/lib/github";
import type { OrganizedPRs, MergedPullRequest, PRsByAuthor } from "@/lib/github";

export type { OrganizedPRs, MergedPullRequest, PRsByAuthor };

export async function fetchOrganizedPRs(): Promise<
  { ok: true; data: OrganizedPRs } | { ok: false; error: string }
> {
  try {
    const data = await getOrganizedPRs();
    return { ok: true, data };
  } catch (e) {
    console.error("Failed to fetch PRs:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Failed to fetch PRs" };
  }
}

export async function fetchMergedPRs(): Promise<
  { ok: true; data: MergedPullRequest[] } | { ok: false; error: string }
> {
  try {
    const data = await getMergedPRs();
    return { ok: true, data };
  } catch (e) {
    console.error("Failed to fetch merged PRs:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Failed to fetch merged PRs" };
  }
}

export async function fetchPRsByAuthor(username: string): Promise<
  { ok: true; data: PRsByAuthor } | { ok: false; error: string }
> {
  try {
    const data = await getPRsByAuthor(username);
    return { ok: true, data };
  } catch (e) {
    console.error("Failed to fetch PRs by author:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Failed to fetch PRs" };
  }
}
