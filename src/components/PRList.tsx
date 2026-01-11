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
        <p className="text-white/60">{error}</p>
        <p className="mt-2 text-sm text-white/40">
          Try refreshing the page in a minute.
        </p>
      </div>
    );
  }

  if (!prs || prs.length === 0) {
    return (
      <div className="w-full max-w-xl text-center py-8">
        <p className="text-white/60">No open PRs yet.</p>
        <p className="mt-2 text-sm text-white/40">
          Be the first to submit one!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {prs.map((pr, index) => (
        <PRCard key={pr.number} pr={pr} rank={index + 1} />
      ))}
    </div>
  );
}
