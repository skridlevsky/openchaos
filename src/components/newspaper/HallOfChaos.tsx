import { getMergedPRs } from "@/lib/github";
import { HallOfChaosCard } from "./HallOfChaosCard";

export async function HallOfChaos() {
  let prs;
  let error = null;

  try {
    prs = await getMergedPRs();
  } catch (e) {
    console.error("Failed to fetch merged PRs:", e);
    error = e instanceof Error ? e.message : "Failed to fetch merged PRs";
  }

  if (error) {
    return (
      <div className="np-error">
        STOP THE PRESSES!
        <div className="np-error-sub">{error}. Try refreshing in a minute.</div>
      </div>
    );
  }

  if (!prs || prs.length === 0) {
    return (
      <div className="np-empty">
        No stories have gone to press yet. The first edition awaits!
      </div>
    );
  }

  return (
    <div>
      {prs.map((pr) => (
        <HallOfChaosCard key={pr.number} pr={pr} />
      ))}
    </div>
  );
}
