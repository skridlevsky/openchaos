"use client";

import { useState } from "react";
import type { PullRequest } from "@/lib/github";
import { PRCard } from "./PRCard";

interface ExpandablePRSectionProps {
  title: string;
  prs: PullRequest[];
  showRank?: boolean;
}

export function ExpandablePRSection({ title, prs, showRank = false }: ExpandablePRSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const initialCount = 5;
  const hasMore = prs.length > initialCount;
  const displayedPRs = expanded ? prs : prs.slice(0, initialCount);

  if (prs.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-3">
        {title}
      </h2>
      <div className="space-y-3">
        {displayedPRs.map((pr, index) => (
          <PRCard
            key={pr.number}
            pr={showRank ? pr : { ...pr, isTrending: false }}
            rank={showRank ? index + 1 : 0}
          />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          {expanded ? "Show less" : `Show all (${prs.length})`}
        </button>
      )}
    </section>
  );
}
