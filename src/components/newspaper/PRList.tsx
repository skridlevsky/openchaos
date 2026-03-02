import { fetchOrganizedPRs } from "@/lib/prData";
import { FramesLayout } from "./FramesLayout";

export async function PRList() {
  const result = await fetchOrganizedPRs();

  if (!result.ok) {
    return (
      <div className="np-error">
        STOP THE PRESSES!
        <div className="np-error-sub">{result.error}. Try refreshing in a minute.</div>
      </div>
    );
  }

  const { topByVotes, rising, newest, discussed, controversial, merged } = result.data;

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
      merged={merged}
    />
  );
}
