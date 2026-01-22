import type { MergedPullRequest } from "@/lib/github";

interface HallOfChaosCardProps {
  pr: MergedPullRequest;
}

export function HallOfChaosCard({ pr }: HallOfChaosCardProps) {
  const mergedDate = new Date(pr.mergedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      #{pr.number} [MERGED] {pr.title}
      <br />
      by @{pr.author} · {mergedDate}
      <br />
      <a href={pr.url} target="_blank" rel="noopener noreferrer">
        {pr.url}
      </a>
      <br />
      WINNER
    </div>
  );
}
