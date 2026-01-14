import type { PullRequest } from "@/lib/github";

interface PRCardProps {
  pr: PullRequest;
  rank: number;
}

export function PRCard({ pr, rank }: PRCardProps) {
  return (
    <a
      href={pr.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full p-4 rounded-lg border border-zinc-200 hover:border-zinc-400 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-sm">#{pr.number}</span>
            {rank === 1 && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                LEADING
              </span>
            )}
            {rank === 1 && pr.votesNeeded <= 0 && (
              <span 
                className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded"
                title="This PR's vote score has surpassed the last merged PR! It can be merged instantly without waiting for the weekly countdown."
              >
                ⚡ OVERRIDE READY
              </span>
            )}
            {rank === 1 && pr.votesNeeded > 0 && (
              <span 
                className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded"
                title={`${pr.votesNeeded} more vote${pr.votesNeeded === 1 ? '' : 's'} needed to trigger instant override merge`}
              >
                ⚡ {pr.votesNeeded} to override
              </span>
            )}
          </div>
          <h3 className="mt-1 font-medium truncate">{pr.title}</h3>
          <p className="mt-1 text-sm text-zinc-500">by @{pr.author}</p>
        </div>
        <div className="flex items-center gap-1.5 text-lg font-medium">
          <span>👍</span>
          <span>{pr.votes}</span>
        </div>
      </div>
      <div className="mt-3 text-sm text-zinc-500 flex items-center gap-1">
        View &amp; Vote on GitHub
        <span aria-hidden="true">→</span>
      </div>
    </a>
  );
}
