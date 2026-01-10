import { getOrganizedPRs } from "@/lib/github";
import { PRCard } from "./PRCard";

export async function PRList() {
  let data;
  let error = null;

  try {
    data = await getOrganizedPRs();
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

  const { topByVotes, trending } = data!;

  if (topByVotes.length === 0 && trending.length === 0) {
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
    <div className="w-full max-w-xl space-y-8">
      {topByVotes.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-3">
            Top by Votes
          </h2>
          <div className="space-y-3">
            {topByVotes.map((pr, index) => (
              <PRCard key={pr.number} pr={pr} rank={index + 1} />
            ))}
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-3">
            Trending
          </h2>
          <div className="space-y-3">
            {trending.map((pr) => (
              <PRCard key={pr.number} pr={{ ...pr, isTrending: false }} rank={0} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
