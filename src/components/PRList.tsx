import { getOrganizedPRs } from "@/lib/github";
import { Web2FramesLayout } from "./Web2FramesLayout";

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
      <div className="web2-section">
        <div className="web2-section-header">
          <span className="web2-section-title">Open PRs</span>
        </div>
        <div className="web2-section-body" style={{ textAlign: 'center', padding: '24px' }}>
          <strong>{error}</strong>
          <br />
          <span>Try refreshing the page in a minute.</span>
        </div>
      </div>
    );
  }

  const { topByVotes, rising, newest, discussed, controversial } = data!;

  if (topByVotes.length === 0 && rising.length === 0 && newest.length === 0) {
    return (
      <div className="web2-section">
        <div className="web2-section-header">
          <span className="web2-section-title">Open PRs</span>
        </div>
        <div className="web2-section-body" style={{ textAlign: 'center', padding: '24px' }}>
          <strong>No open PRs yet.</strong>
          <br />
          <span>Be the first to submit one!</span>
        </div>
      </div>
    );
  }

  return (
    <Web2FramesLayout
      topByVotes={topByVotes}
      rising={rising}
      newest={newest}
      discussed={discussed}
      controversial={controversial}
    />
  );
}
