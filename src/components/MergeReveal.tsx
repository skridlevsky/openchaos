"use client";

import type { PullRequest } from "@/lib/github";

interface MergeRevealProps {
  pr: PullRequest | null;
  onDismiss: () => void;
}

export function MergeReveal({ pr, onDismiss }: MergeRevealProps) {
  if (!pr) {
    return (
      <div className="merge-reveal">
        <h2 className="merge-reveal-title">THE MERGE APPROACHES</h2>
        <div className="merge-reveal-pr">
          <p className="merge-reveal-pr-title">No PRs available</p>
          <p className="merge-reveal-pr-author">Submit a PR to be the first!</p>
        </div>
        <button type="button" className="merge-reveal-dismiss" onClick={onDismiss}>
          DISMISS
        </button>
      </div>
    );
  }

  return (
    <div className="merge-reveal">
      <h2 className="merge-reveal-title">THE MERGE HAS BEGUN</h2>
      <a
        href={pr.url}
        target="_blank"
        rel="noopener noreferrer"
        className="merge-reveal-pr"
        style={{ textDecoration: "none" }}
      >
        <p className="merge-reveal-pr-title">#{pr.number}: {pr.title}</p>
        <p className="merge-reveal-pr-author">by @{pr.author}</p>
        <p className="merge-reveal-pr-votes">{pr.votes} votes</p>
      </a>
      <button type="button" className="merge-reveal-dismiss" onClick={onDismiss}>
        DISMISS
      </button>
    </div>
  );
}
