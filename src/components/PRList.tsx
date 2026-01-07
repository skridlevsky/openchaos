import {getMergedPRsByUser, getOpenPRs, PullRequest} from "@/lib/github";
import {PRCard} from "./PRCard";
import {PRRankingSystem} from "@/lib/ranking-system";

export async function PRList() {
  let prs: PullRequest[] = [];
  let prsClosedByUser: {[user: string]: PullRequest[]} = {};
  let error = null;

  try {
    prsClosedByUser = await getMergedPRsByUser();
    prs = await getOpenPRs();
    // Proprietary ranking system ensuring experience is rewarded.
    prs = new PRRankingSystem(prs, prsClosedByUser).rerankPRs();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch PRs";
  }

  const maxVotes = Math.max(...prs.map(p => p.votes), 0);

  if (error) {
    return (
      <div className="w-full max-w-xl text-center py-8">
        <p className="text-zinc-500">{error}</p>
        <p className="mt-2 text-sm text-zinc-600">
          Try refreshing the page in a minute.
        </p>
      </div>
    );
  }

  if (!prs || prs.length === 0) {
    return (
      <div className="w-full max-w-xl text-center py-8">
        <p className="text-zinc-400">No open PRs yet.</p>
        <p className="mt-2 text-sm text-zinc-500">
          Be the first to submit one!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl space-y-3">
      {prs.map((pr) => (
        <PRCard key={pr.number} prsClosed={prsClosedByUser} pr={pr} isMax={pr.votes === maxVotes} />
      ))}
    </div>
  );
}
