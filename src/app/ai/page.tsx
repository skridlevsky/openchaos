import { AiChat } from "@/components/ai/AiChat";
import { fetchOrganizedPRs } from "@/lib/prData";

function buildPrContextMarkdown(): Promise<string> {
  return fetchOrganizedPRs().then((result) => {
    if (!result.ok) {
      return `PR snapshot currently unavailable: ${result.error}`;
    }

    const { topByVotes, rising, newest, totalVotes } = result.data;

    const lines: string[] = [];
    lines.push("## OpenChaos PR Snapshot");
    lines.push("");
    lines.push(`Total chaos votes across all PRs: ${totalVotes}`);
    lines.push("");

    if (topByVotes.length > 0) {
      lines.push("### Top by votes (merge candidates)");
      topByVotes.slice(0, 5).forEach((pr, index) => {
        lines.push(
          `${index + 1}. #${pr.number} — "${pr.title}" by @${pr.author} — ` +
            `${pr.votes} net votes (${pr.upvotes} 👍 / ${pr.downvotes} 👎) — ${pr.url}`,
        );
      });
      lines.push("");
    }

    if (rising.length > 0) {
      lines.push("### Rising (recent voting activity)");
      rising.slice(0, 3).forEach((pr) => {
        lines.push(
          `- #${pr.number} — "${pr.title}" by @${pr.author} — hotScore ${pr.hotScore} — ${pr.url}`,
        );
      });
      lines.push("");
    }

    if (newest.length > 0) {
      lines.push("### Newest PRs");
      newest.slice(0, 3).forEach((pr) => {
        lines.push(
          `- #${pr.number} — "${pr.title}" by @${pr.author} — created at ${pr.createdAt} — ${pr.url}`,
        );
      });
      lines.push("");
    }

    return lines.join("\n");
  });
}

export default async function AiHome() {
  const prContextMarkdown = await buildPrContextMarkdown();

  return (
    <div
      style={{
        maxWidth: "1120px",
        margin: "0 auto",
      }}
    >
      <AiChat prContextMarkdown={prContextMarkdown} />
    </div>
  );
}

