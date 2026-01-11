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
      className="block w-full p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs font-mono">#{pr.number}</span>
            {rank === 1 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                <span>👑</span> LEADING
              </span>
            )}
          </div>
          <h3 className="mt-0.5 font-medium truncate text-white/90 text-sm group-hover:text-white transition-colors">{pr.title}</h3>
          <p className="mt-0.5 text-xs text-white/50">by @{pr.author}</p>
        </div>
        <div className="flex flex-col items-center justify-center min-w-[2.5rem] px-1.5 py-1 rounded bg-white/5 border border-white/5">
          <span className="text-base">👍</span>
          <span className="text-white text-sm font-bold">{pr.votes}</span>
        </div>
      </div>
      <div className="h-0 group-hover:h-auto group-hover:mt-2 overflow-hidden transition-all duration-300">
        <div className="text-[10px] text-white/40 flex items-center gap-1">
          Vote on GitHub
          <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>
    </a>
  );
}
