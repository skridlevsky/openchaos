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
    <div className="hall-card">
      <div className="hall-card-inner">
        <div className="hall-card-number-section">
          <span className="hall-card-number-text">
            #{pr.number}
          </span>
          <div className="hall-card-merged-icon" title="Merged">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8-8a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM4.25 4a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
            </svg>
          </div>
        </div>
        <div className="hall-card-content-section">
          <div className="hall-card-title">
            {pr.title}
          </div>
          <div className="hall-card-meta">
            by{" "}
            <a
              href={`https://github.com/${pr.author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hall-card-author-link"
            >
              @{pr.author}
            </a>
            {" · "}
            <span className="hall-card-date">{mergedDate}</span>
          </div>
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hall-card-link"
          >
            View on GitHub →
          </a>
        </div>
        <div className="hall-card-trophy-section" title="Daily merge winner">
          <span className="hall-card-trophy-emoji">
            🏆
          </span>
        </div>
      </div>
    </div>
  );
}
