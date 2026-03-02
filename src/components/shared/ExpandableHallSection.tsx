"use client";

import { useState, type ComponentType } from "react";
import type { MergedPullRequest } from "@/lib/github";

interface ExpandableHallSectionProps {
  prs: MergedPullRequest[];
  CardComponent: ComponentType<{ pr: MergedPullRequest }>;
  emptyMessage?: React.ReactNode;
  expandLabel?: (count: number) => string;
  collapseLabel?: string;
  className?: string;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
}

export function ExpandableHallSection({
  prs,
  CardComponent,
  emptyMessage,
  expandLabel = (count) => `Show All (${count})`,
  collapseLabel = "Show Less",
  className,
  buttonClassName,
  buttonStyle,
}: ExpandableHallSectionProps) {
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
        <CardComponent key={pr.number} pr={pr} />
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
