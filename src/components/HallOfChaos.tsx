import { getMergedPRs } from "@/lib/github";
import { HallOfChaosCard } from "./HallOfChaosCard";

export async function HallOfChaos() {
  let prs;
  let error = null;

  try {
    prs = await getMergedPRs();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch merged PRs";
  }

  if (error) {
    return (
      <div className="hall-error-container">
        <strong>{error}</strong>
        <br />
        <span>Try refreshing the page in a minute.</span>
      </div>
    );
  }

  if (!prs || prs.length === 0) {
    return (
      <div className="hall-empty-container">
        <strong>No merged PRs yet.</strong>
        <br />
        <span>The first winner will be immortalized here!</span>
      </div>
    );
  }

  return (
    <div className="hall-container">
      {prs.map((pr) => (
        <HallOfChaosCard key={pr.number} pr={pr} />
      ))}
    </div>
  );
}
