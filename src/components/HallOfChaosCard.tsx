import type { MergedPullRequest } from "@/lib/github";

interface HallOfChaosCardProps {
  pr: MergedPullRequest;
}

export function HallOfChaosCard({ pr }: HallOfChaosCardProps) {
  const mergedDate = new Date(pr.mergedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <table
      width="100%"
      border={2}
      cellPadding={8}
      cellSpacing={0}
      className="hall-card"
    >
      <tbody>
        <tr>
          <td className="hall-card-number-cell">
            <span className="hall-card-number-text">
              <b>#{pr.number}</b>
            </span>
            <div className="hall-card-merged-badge">
              <span className="hall-card-merged-badge-text">
                <b>MERGED</b>
              </span>
            </div>
          </td>
          <td className="hall-card-content-cell">
            <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td>
                    <span className="hall-card-title">
                      <b>{pr.title}</b>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="hall-card-author-row">
                    <span className="hall-card-author-text">
                      by <a
                        href={`https://github.com/${pr.author}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hall-card-author-link"
                      >
                        <b>@{pr.author}</b>
                      </a>
                      {" · "}
                      <span className="hall-card-date">{mergedDate}</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="hall-card-link-row">
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hall-card-link"
                    >
                      <b>[View on GitHub →]</b>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          <td className="hall-card-trophy-cell">
            <span className="hall-card-trophy-emoji">
              🏆
            </span>
            <br />
            <span className="hall-card-winner-text">
              <b>WINNER</b>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
