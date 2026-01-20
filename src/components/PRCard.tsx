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
            <span className="pr-card-votes-emoji">
              👍
            </span>
            <br />
            <span className={rank === 1 ? 'pr-card-votes-count-leading' : 'pr-card-votes-count-normal'}>
              <b>{pr.votes}</b>
            </span>
            <div style={{ marginTop: '8px', fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>
              {(!pr.isMergeable || !pr.checksPassed) && (
                <>
                  <span style={{ color: 'red', fontWeight: 'bold' }}>
                    {!pr.isMergeable && !pr.checksPassed
                      ? "Conflicts & Checks failed"
                      : !pr.isMergeable
                        ? "Merge conflicts"
                        : "Checks failed"}
                  </span>
                  <br />
                </>
              )}
              <div
                title={
                  pr.isMergeable && pr.checksPassed
                    ? "All checks passed & no conflicts"
                    : "Checks failed or has conflicts"
                }
                style={{
                  display: 'inline-block',
                  border: '1px solid #808080',
                  padding: '2px',
                  backgroundColor: 'white',
                  marginTop: '2px'
                }}
              >
                {pr.isMergeable && pr.checksPassed ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="green"
                    width="16"
                    height="16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="red"
                    width="16"
                    height="16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
