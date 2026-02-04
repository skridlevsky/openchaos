import type { PullRequest } from "@/lib/github";
import { stripEmojis } from "@/lib/utils";
import { TimeAgo } from "./TimeAgo";

interface PRCardProps {
  pr: PullRequest;
  rank: number;
}

function chooseURL(url: string) {
  // 10% chance to Rickroll
  if (Math.random() <= 0.10) {
    // Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  } else {
    return url;
  }
}

export function PRCard({ pr, rank }: PRCardProps) {
  const url = chooseURL(pr.url);

  const isSixtySeven = pr.votes === 67 || pr.votes === -67;
  return (
    <div className={`${isSixtySeven ? "sixseven-shake" : ""}
  `}>
      {rank}. {rank === 1 && "[LEADING]"} {stripEmojis(pr.title)} (#{pr.number})
      <br />
      &nbsp;&nbsp;&nbsp;by @{pr.author} · <TimeAgo isoDate={pr.createdAt} />
      <br />
      &nbsp;&nbsp;&nbsp;<a href={url} target="_blank" rel="noopener noreferrer">
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
        </>
      )}
    </div>
  );
}
