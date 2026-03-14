import { fetchMergedPRs } from "@/lib/prData";
import { HallOfChaosCard } from "./HallOfChaosCard";

export async function HallOfChaos() {
  const result = await fetchMergedPRs();

  if (!result.ok) {
    return (
      <div className="vw-message-box">
        <strong>{result.error}</strong>
        <br />
        Try refreshing the page in a minute.
      </div>
    );
  }

  if (result.data.length === 0) {
    return (
      <div className="vw-message-box">
        No merged PRs yet. The first winner will be immortalized here!
      </div>
    );
  }

  return (
    <div>
      {result.data.map((pr) => (
        <HallOfChaosCard key={pr.number} pr={pr} />
      ))}
    </div>
  );
}
