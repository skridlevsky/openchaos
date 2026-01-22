import type { PullRequest } from "@/lib/github";
import { TimeAgo } from "./TimeAgo";

interface PRCardProps {
  pr: PullRequest;
  rank: number;
}

export function PRCard({ pr, rank }: PRCardProps) {
  return (
    <div>
      {rank}. {rank === 1 && "[LEADING]"} {pr.title} (#{pr.number})
      <br />
      &nbsp;&nbsp;&nbsp;by @{pr.author} · <TimeAgo isoDate={pr.createdAt} />
      <br />
      &nbsp;&nbsp;&nbsp;<a href={pr.url} target="_blank" rel="noopener noreferrer">
        {pr.url}
      </a>
      <br />
      &nbsp;&nbsp;&nbsp;SCORE: {pr.votes}
      {(!pr.isMergeable || !pr.checksPassed) && (
        <>
          <br />
          &nbsp;&nbsp;&nbsp;
          {!pr.isMergeable && !pr.checksPassed
            ? "Conflicts & Checks failed"
            : !pr.isMergeable
              ? "Merge conflicts"
              : "Checks failed"}
        </>
      )}
      {pr.isMergeable && pr.checksPassed && (
        <>
          <br />
          [OK]
        </>
      )}
    </div>
  );
}
