import { getOpenPRs, PullRequest } from "@/lib/github";
import { PRCard } from "./PRCard";

const TOP_VOTED_LIMIT = 5;
const NEWEST_LIMIT = 5;

export async function PRList() {
  let prs: PullRequest[] | undefined;
  let error = null;

  try {
    prs = await getOpenPRs();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch PRs";
  }

  if (error) {
    return (
      <table width="90%" border={1} cellPadding={10} className="page-error-table">
        <tbody>
          <tr>
            <td className="page-error-cell">
              <b>{error}</b>
              <br />
              <span>Try refreshing the page in a minute.</span>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  if (!prs || prs.length === 0) {
    return (
      <table width="90%" border={1} cellPadding={10} className="page-empty-table">
        <tbody>
          <tr>
            <td className="page-empty-cell">
              <b>No open PRs yet.</b>
              <br />
              <span>Be the first to submit one!</span>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  // Top PRs by votes (already sorted by votes from getOpenPRs)
  const topVoted = prs.slice(0, TOP_VOTED_LIMIT);
  const topVotedNumbers = new Set(topVoted.map((pr) => pr.number));

  // Newest PRs not already in top voted
  const newestPRs = [...prs]
    .filter((pr) => !topVotedNumbers.has(pr.number))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, NEWEST_LIMIT);

  return (
    <>
      <table width="100%" border={2} cellPadding={8} cellSpacing={0} className="pr-list-section-header">
        <tbody>
          <tr>
            <td className="pr-list-section-header-cell">
              <b>🏆 TOP BY VOTES 🏆</b>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="pr-list-container">
        {topVoted.map((pr, index) => (
          <PRCard key={pr.number} pr={pr} rank={index + 1} />
        ))}
      </div>

      {newestPRs.length > 0 && (
        <div className="pr-list-newest-section">
          <table width="100%" border={2} cellPadding={8} cellSpacing={0} className="pr-list-section-header">
            <tbody>
              <tr>
                <td className="pr-list-section-header-cell">
                  <b>🆕 NEWEST PRS 🆕</b>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="pr-list-container">
            {newestPRs.map((pr) => (
              <PRCard key={pr.number} pr={pr} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
