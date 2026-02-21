"use client";

import { useState } from "react";
import type { PullRequest } from "@/lib/github";
import { PRCard } from "./PRCard";

interface ExpandablePRSectionProps {
  prs: PullRequest[];
  allowDistinguish?: boolean;
}

export function ExpandablePRSection({ prs, allowDistinguish = false }: ExpandablePRSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const initialCount = 10;
  const hasMore = prs.length > initialCount;
  const displayedPRs = expanded ? prs : prs.slice(0, initialCount);

  if (prs.length === 0) {
    return (
      <div className="np-section-empty">
        No stories filed in this section.
      </div>
    );
  }

  return (
    <div>
      {displayedPRs.map((pr) => (
        <PRCard
          key={pr.number}
          pr={allowDistinguish ? pr : { ...pr, isTrending: false }}
          distinguishLeading={allowDistinguish}
        />
      ))}
      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "8px", marginBottom: "16px" }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="np-expand-btn"
          >
            {expanded
              ? "Return to Front Page"
              : `Continue Reading (${prs.length} articles)`}
          </button>
        </div>
      )}
    </div>
  );
}
