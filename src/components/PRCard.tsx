import type { PullRequest } from "@/lib/github";

interface PRCardProps {
  pr: PullRequest;
  isMax: boolean;
  prsClosed: {[user:string]: PullRequest[]};
}

export function PRCard({ pr, isMax, prsClosed }: PRCardProps) {
  const prsClosedByUser = prsClosed[pr.author]?.length ?? 0;
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
            {isMax && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                LEADING
              </span>
            )}
          </div>
          <h3 className="mt-1 font-medium truncate">{pr.title}</h3>
          <span className={"mt-1 text-sm " + (prsClosedByUser > 0? "px-1.5 py-0.5 bg-amber-100 rounded text-zinc-500": "text-zinc-500")}>by @{pr.author}</span>
        </div>
        <div className="flex items-center gap-1.5 text-lg font-medium">
          <span>👍</span>
          <span>{pr.votes}</span>
          {prsClosedByUser > 0 && <>
              <span>🏅</span>
              <span>{prsClosedByUser}</span>
          </>}
        </div>
      </div>
      <div className="mt-3 text-sm text-zinc-500 flex items-center gap-1">
        View &amp; Vote on GitHub
        <span aria-hidden="true">→</span>
      </div>
    </a>
  );
}
