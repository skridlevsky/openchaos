import type { PullRequest } from "@/lib/github";

interface PRCardProps {
  pr: PullRequest;
  rank: number;
}

export function PRCard({ pr, rank }: PRCardProps) {
  return (
    <table 
      width="100%" 
      border={2}
      cellPadding={8}
      cellSpacing={0}
      className={`pr-card ${rank === 1 ? 'pr-card-leading' : 'pr-card-normal'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-sm">#{pr.number}</span>
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
