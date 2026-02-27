import type { MergedPullRequest } from "@/lib/github";
import { stripEmojis } from "@/lib/utils";

interface HallOfChaosCardProps {
  pr: MergedPullRequest;
}

export function HallOfChaosCard({ pr }: HallOfChaosCardProps) {
  const parsedDate = new Date(pr.mergedAt);
  const mergedDate = isNaN(parsedDate.getTime())
    ? "Date unknown"
    : parsedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  return (
    <div className="np-archive-card">
      <div className="np-archive-inner">
        <div>
          <span className="np-badge np-badge-published">PUBLISHED</span>
          <span className="np-archive-number">#{pr.number}</span>
        </div>
        <div className="np-archive-content">
          <div className="np-archive-headline">
            {stripEmojis(pr.title)}
          </div>
          <div className="np-archive-meta">
            by{" "}
            <a
              href={`https://github.com/${pr.author}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{pr.author}
            </a>
            {" \u00B7 "}
            {mergedDate}
          </div>
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="np-archive-link"
          >
            View in Archives &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
