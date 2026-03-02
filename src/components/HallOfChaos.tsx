import { fetchMergedPRs } from "@/lib/prData";
import { HallOfChaosCard } from "./HallOfChaosCard";
import { getAuthorProfileHref } from "@/lib/userProfile";

interface HallOfChaosProps {
  themePath?: string;
}

export async function HallOfChaos({ themePath = "" }: HallOfChaosProps = {}) {
  const result = await fetchMergedPRs();

  if (!result.ok) {
    return (
      <div className="hall-error-container">
        <strong>{result.error}</strong>
        <br />
        <span>Try refreshing the page in a minute.</span>
      </div>
    );
  }

  if (result.data.length === 0) {
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
      {result.data.map((pr) => (
        <HallOfChaosCard
          key={pr.number}
          pr={pr}
          authorHref={themePath ? getAuthorProfileHref(themePath, pr.author) : undefined}
        />
      ))}
    </div>
  );
}
