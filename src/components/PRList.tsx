import { getOpenPRs } from "@/lib/github";
import { PRCard } from "./PRCard";

export async function PRList() {
  let prs;
  let error = null;

  try {
    prs = await getOpenPRs();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch PRs";
  }

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
    <div className="w-full max-w-xl space-y-3 mb-4">
      {prs.map((pr, index) => (
        <PRCard key={pr.number} pr={pr} rank={index + 1} />
      ))}
    </div>
  );
}
