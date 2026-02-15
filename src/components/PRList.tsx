import { getOrganizedPRs } from "@/lib/github";
import { FramesLayout } from "./FramesLayout";

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

  const { topByVotes, rising, newest, discussed, controversial } = data!;

  if (topByVotes.length === 0 && rising.length === 0 && newest.length === 0) {
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
    <FramesLayout
      topByVotes={topByVotes}
      rising={rising}
      newest={newest}
      discussed={discussed}
      controversial={controversial}
    />
  );
}
