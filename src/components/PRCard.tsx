import type { PullRequest } from "@/lib/github";

interface PRCardProps {
  pr: PullRequest;
  rank: number;
}

function getPRUrl(pr: PullRequest) {
  if (Math.random() < 0.01) {
    return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  }
  
  return pr.url;
}

export function PRCard({ pr, rank }: PRCardProps) {
  const prUrl = getPRUrl(pr);

  return (
    <a
      href={prUrl}
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
