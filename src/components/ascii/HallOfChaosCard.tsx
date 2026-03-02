import type { MergedPullRequest } from "@/lib/github";
import { stripEmojis } from "@/lib/utils";

interface HallOfChaosCardProps {
  pr: MergedPullRequest;
  authorHref?: string;
}

export function HallOfChaosCard({ pr, authorHref }: HallOfChaosCardProps) {
  const mergedDate = new Date(pr.mergedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const link = authorHref ?? `https://github.com/${pr.author}`;

  return (
    <div>
      #{pr.number} [MERGED] {stripEmojis(pr.title)}
      <br />
      by <a href={link}>@{pr.author}</a> · {mergedDate}
      <br />
      <a href={pr.url} target="_blank" rel="noopener noreferrer">
        {pr.url}
      </a>
    </div>
  );
}
