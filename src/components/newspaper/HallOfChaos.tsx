import { fetchMergedPRs } from "@/lib/prData";
import { HallOfChaosCard } from "./HallOfChaosCard";

export async function HallOfChaos() {
  const result = await fetchMergedPRs();

  if (!result.ok) {
    return (
      <div className="np-error">
        STOP THE PRESSES!
        <div className="np-error-sub">{result.error}. Try refreshing in a minute.</div>
      </div>
    );
  }

  if (result.data.length === 0) {
    return (
      <div className="np-empty">
        No stories have gone to press yet. The first edition awaits!
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
