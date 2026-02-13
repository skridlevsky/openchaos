import type { MergedPullRequest } from "@/lib/github";
import { stripEmojis } from "@/lib/utils";

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
      #{pr.number} [MERGED] {stripEmojis(pr.title)}
      <br />
      by @{pr.author} · {mergedDate}
      <br />
      <a href={pr.url} target="_blank" rel="noopener noreferrer">
        {pr.url}
      </a>
    </div>
  );
}
