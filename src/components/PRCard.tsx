import type { PullRequest } from "@/lib/github";
import { EMOJI_MAP_EXPORTED } from "@/lib/github";

interface PRCardProps {
  pr: PullRequest;
  rank: number;
}

export function PRCard({ pr, rank }: PRCardProps) {
  // Separate emojis into positive and negative
  const positiveEmojis = Object.entries(pr.emojiCounts)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      emoji: EMOJI_MAP_EXPORTED[key]?.emoji || "",
      score: EMOJI_MAP_EXPORTED[key]?.score || 0,
      count,
    }))
    .filter(({ score }) => score > 0);

  const negativeEmojis = Object.entries(pr.emojiCounts)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      emoji: EMOJI_MAP_EXPORTED[key]?.emoji || "",
      score: EMOJI_MAP_EXPORTED[key]?.score || 0,
      count,
    }))
    .filter(({ score }) => score < 0);

  const neutralEmojis = Object.entries(pr.emojiCounts)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      emoji: EMOJI_MAP_EXPORTED[key]?.emoji || "",
      score: EMOJI_MAP_EXPORTED[key]?.score || 0,
      count,
    }))
    .filter(({ score }) => score === 0);

  const hasAnyEmojis = positiveEmojis.length > 0 || negativeEmojis.length > 0 || neutralEmojis.length > 0;

  return (
    <a
      href={pr.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full p-4 rounded-lg border border-zinc-200 hover:border-zinc-400 transition-colors"
    >
      <div className="flex items-stretch justify-between gap-4">
        <div className="flex-1 min-w-0 flex flex-col">
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
        <div className="flex flex-col items-end justify-end gap-1">
          {hasAnyEmojis && (
            <>
              {positiveEmojis.length > 0 && (
                <div className="flex items-center gap-1.5 text-lg font-medium">
                  {positiveEmojis.map(({ emoji, count, key }) => (
                    <div key={key} className="flex items-center gap-1">
                      <span>{emoji}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              )}
              {negativeEmojis.length > 0 && (
                <div className="flex items-center gap-1.5 text-lg font-medium">
                  {negativeEmojis.map(({ emoji, count, key }) => (
                    <div key={key} className="flex items-center gap-1">
                      <span>{emoji}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              )}
              {neutralEmojis.length > 0 && (
                <div className="flex items-center gap-1.5 text-lg font-medium">
                  {neutralEmojis.map(({ emoji, count, key }) => (
                    <div key={key} className="flex items-center gap-1">
                      <span>{emoji}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-zinc-700 text-sm">=</span>
                <span className={`text-lg font-medium ${pr.totalScore >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {pr.totalScore > 0 ? "+" : ""}
                  {Math.round(pr.totalScore)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 text-sm text-zinc-500 flex items-center gap-1">
        View &amp; Vote on GitHub
        <span aria-hidden="true">→</span>
      </div>
    </a>
  );
}
