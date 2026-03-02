import { fetchMergedPRs } from "@/lib/prData";
import { HallOfChaosCard } from "./HallOfChaosCard";

export async function HallOfChaos() {
  const result = await fetchMergedPRs();

  if (!result.ok) {
    return (
      <table width="90%" border={1} cellPadding={10} className="hall-error-table">
        <tbody>
          <tr>
            <td className="hall-error-cell">
              <b>{result.error}</b>
              <br />
              <span>Try refreshing the page in a minute.</span>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  if (result.data.length === 0) {
    return (
      <table width="90%" border={1} cellPadding={10} className="hall-empty-table">
        <tbody>
          <tr>
            <td className="hall-empty-cell">
              <b>No merged PRs yet.</b>
              <br />
              <span>The first winner will be immortalized here!</span>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <div className="hall-container">
      {result.data.map((pr) => (
        <HallOfChaosCard key={pr.number} pr={pr} />
      ))}
    </div>
  );
}
