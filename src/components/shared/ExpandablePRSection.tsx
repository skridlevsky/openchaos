"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import type { PullRequest } from "@/lib/github";

interface ExpandablePRSectionProps {
  prs: PullRequest[];
  PRCardComponent: ComponentType<{ pr: PullRequest; distinguishLeading?: boolean; scoreLabel?: string }>;
  allowDistinguish?: boolean;
  scoreLabel?: string;
  emptyMessage?: ReactNode;
  expandLabel?: (count: number) => string;
  collapseLabel?: string;
  className?: string;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
}

export function ExpandablePRSection({
  prs,
  PRCardComponent,
  allowDistinguish = false,
  scoreLabel,
  emptyMessage,
  expandLabel = (count) => `Show All (${count})`,
  collapseLabel = "Show Less",
  className,
  buttonClassName,
  buttonStyle,
}: ExpandablePRSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const initialCount = 10;
  const hasMore = prs.length > initialCount;
  const displayedPRs = expanded ? prs : prs.slice(0, initialCount);

  if (prs.length === 0) {
    return emptyMessage ? <>{emptyMessage}</> : null;
  }

  return (
    <div className={className}>
      {displayedPRs.map((pr) => (
        <PRCardComponent
          key={pr.number}
          pr={allowDistinguish ? pr : { ...pr, isTrending: false }}
          distinguishLeading={allowDistinguish}
          scoreLabel={scoreLabel}
        />
      ))}
      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "8px", marginBottom: "16px" }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className={buttonClassName}
            style={buttonStyle}
          >
            {expanded ? collapseLabel : expandLabel(prs.length)}
          </button>
        </div>
      )}
    </div>
  );
}
