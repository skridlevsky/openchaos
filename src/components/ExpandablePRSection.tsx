"use client";

import { useState } from "react";
import type { PullRequest } from "@/lib/github";
import { PRCard } from "./PRCard";

interface ExpandablePRSectionProps {
  title: string;
  prs: PullRequest[];
  allowDistinguish?: boolean;
}

export function ExpandablePRSection({ title, prs, allowDistinguish = false }: ExpandablePRSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const initialCount = 10;
  const hasMore = prs.length > initialCount;
  const displayedPRs = expanded ? prs : prs.slice(0, initialCount);

  if (prs.length === 0) {
    return null;
  }

  return (
    <div className="pr-list-section">
      <table width="100%" border={2} cellPadding={8} cellSpacing={0} className="pr-list-section-header">
        <tbody>
          <tr>
            <td className="pr-list-section-header-cell">
              {title}<br/>{"-".repeat(title.length)}<br/>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="pr-list-container">
        {displayedPRs.map((pr) => (
          <PRCard
            key={pr.number}
            pr={allowDistinguish ? pr : { ...pr, isTrending: false }}
            distinguishLeading={allowDistinguish}
          />
        ))}
      </div>
      {hasMore && (
        <div style={{ textAlign: 'left', marginTop: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              color: 'inherit',
              textDecoration: 'underline',
            }}
          >
            {expanded ? "Show Less" : `Show All (${prs.length}) >`}
          </button>
        </div>
      )}
    </div>
  );
}
