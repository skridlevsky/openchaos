import { fetchOrganizedPRs } from "@/lib/prData";
import { FramesLayout } from "./FramesLayout";

export async function PRList() {
  const result = await fetchOrganizedPRs();

  if (!result.ok) {
    return (
      <table width="90%" border={1} cellPadding={10} className="page-error-table">
        <tbody>
          <tr>
            <td className="page-error-cell">
              <b>{result.error}</b>
              <br />
              <span>Try refreshing the page in a minute.</span>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  const { topByVotes, rising, newest, discussed, controversial, merged } = result.data;

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
      merged={merged}
    />
  );
}
