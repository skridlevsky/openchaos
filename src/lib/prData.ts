import { getOrganizedPRs } from "@/lib/github";
import type { OrganizedPRs, MergedPullRequest } from "@/lib/github";

export type { OrganizedPRs, MergedPullRequest };

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
