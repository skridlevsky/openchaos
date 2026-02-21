import { getOrganizedPRs } from "@/lib/github";
import { FramesLayout } from "./FramesLayout";

export async function PRList() {
  let data;
  let error = null;

  try {
    data = await getOrganizedPRs();
  } catch (e) {
    console.error("Failed to fetch PRs:", e);
    error = e instanceof Error ? e.message : "Failed to fetch PRs";
  }

  if (error) {
    return (
      <div className="np-error">
        STOP THE PRESSES!
        <div className="np-error-sub">{error}. Try refreshing in a minute.</div>
      </div>
    );
  }

  const { topByVotes, rising, newest, discussed, controversial } = data!;

  if (topByVotes.length === 0 && rising.length === 0 && newest.length === 0) {
    return (
      <div className="np-empty">
        NO STORIES TODAY &mdash; Be the first to file a report!
      </div>
    );
  }

  return (
    <FramesLayout
      topByVotes={topByVotes}
      rising={rising}
      newest={newest}
      discussed={discussed}
      controversial={controversial}
    />
  );
}
