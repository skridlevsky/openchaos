import type { PullRequest } from "@/lib/github";
import { getDailyVoteEmojis } from "@/lib/chaos-emojis";

interface PRCardProps {
  pr: PullRequest;
  rank: number;
}

export function PRCard({ pr, rank }: PRCardProps) {
  const { upvote, downvote } = getDailyVoteEmojis();
  return (
    <table 
      width="100%" 
      border={2}
      cellPadding={8}
      cellSpacing={0}
      className={`pr-card ${rank === 1 ? 'pr-card-leading' : 'pr-card-normal'}`}
    >
      <tbody>
        <tr>
          <td className={rank === 1 ? 'pr-card-number-cell-leading' : 'pr-card-number-cell-normal'}>
            <span className={rank === 1 ? 'pr-card-number-text-leading' : 'pr-card-number-text-normal'}>
              <b>#{pr.number}</b>
            </span>
            {rank === 1 && (
              <div className="pr-card-leading-badge">
                <span className="pr-card-leading-badge-text">
                  <b>LEADING</b>
                </span>
              </div>
            )}
          </td>
          <td className={rank === 1 ? 'pr-card-content-cell-leading' : 'pr-card-content-cell-normal'}>
            <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td>
                    <span className="pr-card-title">
                      <b>{pr.title}</b>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="pr-card-author-row">
                    <span className="pr-card-author-text">
                      by <a
                        href={`https://github.com/${pr.author}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pr-card-author-link"
                      >
                        <b>@{pr.author}</b>
                      </a>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="pr-card-link-row">
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pr-card-link"
                    >
                      <b>[View &amp; Vote on GitHub →]</b>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          <td className={rank === 1 ? 'pr-card-votes-cell-leading' : 'pr-card-votes-cell-normal'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="pr-card-votes-emoji">{upvote}</span>
                <span className={rank === 1 ? 'pr-card-votes-count-leading' : 'pr-card-votes-count-normal'}>
                  <b>{pr.upvotes}</b>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="pr-card-votes-emoji">{downvote}</span>
                <span className={rank === 1 ? 'pr-card-votes-count-leading' : 'pr-card-votes-count-normal'}>
                  <b>{pr.downvotes}</b>
                </span>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
