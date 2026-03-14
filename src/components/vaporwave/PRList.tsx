import { fetchOrganizedPRs } from "@/lib/prData";
import { FramesLayout } from "./FramesLayout";

export async function PRList() {
  const result = await fetchOrganizedPRs();

  if (!result.ok) {
    return (
      <div className="vw-message-box">
        <strong>{result.error}</strong>
        <br />
        <span>Try refreshing the page in a minute.</span>
      </div>
    );
  }

  const { topByVotes, rising, newest, discussed, controversial } = result.data;

  if (topByVotes.length === 0 && rising.length === 0 && newest.length === 0) {
    return (
      <div className="vw-message-box">
        <strong>No open PRs yet.</strong>
        <br />
        <span>Be the first to submit one!</span>
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
