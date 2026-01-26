import { getMergedPRs } from "@/lib/github";
import { HallOfChaosCard } from "./HallOfChaosCard";

export async function HallOfChaos() {
  let prs;
  let error = null;

  try {
    prs = await getMergedPRs();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch merged PRs";
  }

  if (error) {
    return (
      <table width="90%" border={1} cellPadding={10} className="hall-error-table">
        <tbody>
          <tr>
            <td className="hall-error-cell">
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
      {prs.map((pr) => (
        <HallOfChaosCard key={pr.number} pr={pr} />
      ))}
    </div>
  );
}
