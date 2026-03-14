import type { MergedPullRequest } from "@/lib/github";

interface HallOfChaosCardProps {
  pr: MergedPullRequest;
}

export function HallOfChaosCard({ pr }: HallOfChaosCardProps) {
  const parsedDate = new Date(pr.mergedAt);
  const mergedDate = isNaN(parsedDate.getTime())
    ? "Date unknown"
    : parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <div className="vw-hall-card">
      <span className="vw-hall-num">#{pr.number}</span>
      <span className="vw-hall-title">
        <a href={pr.url} target="_blank" rel="noopener noreferrer">
          {pr.title}
        </a>
      </span>
      <span className="vw-hall-meta">
        @{pr.author} &middot; {mergedDate}
      </span>
    </div>
  );
}
