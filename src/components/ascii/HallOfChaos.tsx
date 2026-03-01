import { fetchMergedPRs } from "@/lib/prData";
import { HallOfChaosCard } from "./HallOfChaosCard";

export async function HallOfChaos() {
  const result = await fetchMergedPRs();

  if (!result.ok) {
    return (
      <div>
        {result.error}
        <br />
        Try refreshing the page in a minute.
      </div>
    );
  }

  if (result.data.length === 0) {
    return (
      <div>
        No merged PRs yet.
        <br />
        The first winner will be immortalized here!
      </div>
    );
  }

  return (
    <div className="mt-4">
      {result.data.map((pr) => (
        <div key={pr.number} style={{ marginBottom: "20px" }}>
          <HallOfChaosCard pr={pr} />
        </div>
      ))}
    </div>
  );
}
