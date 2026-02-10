import { getOrganizedPRs } from "@/lib/github";
import { ExpandablePRSection } from "./ExpandablePRSection";

export async function PRList() {
  let data;
  let error = null;

  try {
    data = await getOrganizedPRs();
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

  const { topByVotes, trending } = data!;

  if (topByVotes.length === 0 && trending.length === 0) {
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

  return (
    <>
      <ExpandablePRSection title="🏆 TOP 10 BY VOTES 🏆" prs={topByVotes} showRank />
      <ExpandablePRSection title="🔥 TRENDING THIS WEEK 🔥" prs={trending} />
    </>
  );
}
