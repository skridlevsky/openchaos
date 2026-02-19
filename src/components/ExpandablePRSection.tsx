"use client";

import { useState } from "react";
import type { PullRequest } from "@/lib/github";
import { PRCard } from "./PRCard";

interface ExpandablePRSectionProps {
  prs: PullRequest[];
  showRank?: boolean;
}

export function ExpandablePRSection({ prs, showRank = false }: ExpandablePRSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const initialCount = 10;
  const hasMore = prs.length > initialCount;
  const displayedPRs = expanded ? prs : prs.slice(0, initialCount);

  if (prs.length === 0) {
    return null;
  }

  return (
    <div className="pr-list-section">
      <div className="pr-list-container">
        {displayedPRs.map((pr, index) => (
          <PRCard
            key={pr.number}
            pr={showRank ? pr : { ...pr, isTrending: false }}
            rank={showRank ? index + 1 : 0}
          />
        ))}
      </div>
      {hasMore && (
        <div className="pr-list-expand-wrapper">
          <button
            onClick={() => setExpanded(!expanded)}
            className="pr-list-expand-button"
          >
            {expanded ? "Show Less" : `Show All (${prs.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
