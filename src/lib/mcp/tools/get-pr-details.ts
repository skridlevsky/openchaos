import { GetPRDetailsInput } from '../types';
import { cachedFetch } from '../cache';

const GITHUB_REPO = "skridlevsky/openchaos";

function getHeaders(accept: string): Record<string, string> {
  const headers: Record<string, string> = { Accept: accept };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function getPRDetailsTool(args: GetPRDetailsInput) {
  try {
    const [owner, repo] = GITHUB_REPO.split("/");
    const { prNumber } = args;

    // Fetch PR details (with caching)
    const pr = await cachedFetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      {
        headers: getHeaders("application/vnd.github.v3+json"),
      }
    );

    // Fetch reactions (with caching)
    let reactions = { upvotes: 0, downvotes: 0 };
    try {
      const reactionsData = await cachedFetch<any[]>(
        `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/reactions`,
        {
          headers: getHeaders("application/vnd.github.squirrel-girl-preview+json"),
        }
      );
      reactions = {
        upvotes: reactionsData.filter((r: any) => r.content === "+1").length,
        downvotes: reactionsData.filter((r: any) => r.content === "-1").length,
      };
    } catch {
      // Keep default values on error
    }

    // Fetch commit status (with caching)
    let checkStatus = "unknown";
    try {
      const statusData = await cachedFetch<any>(
        `https://api.github.com/repos/${owner}/${repo}/commits/${pr.head.sha}/status`,
        {
          headers: getHeaders("application/vnd.github.v3+json"),
        }
      );
      checkStatus = statusData.state;
    } catch {
      // Keep default value on error
    }

    // Fetch files changed (with caching)
    let files = [];
    try {
      const filesData = await cachedFetch<any[]>(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`,
        {
          headers: getHeaders("application/vnd.github.v3+json"),
        }
      );
      files = filesData.map((file: any) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
      }));
    } catch {
      // Keep empty array on error
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            number: pr.number,
            title: pr.title,
            author: pr.user.login,
            state: pr.state,
            url: pr.html_url,
            body: pr.body,
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
            mergedAt: pr.merged_at,
            mergeable: pr.mergeable,
            votes: reactions.upvotes - reactions.downvotes,
            reactions,
            checkStatus,
            commits: pr.commits,
            additions: pr.additions,
            deletions: pr.deletions,
            changedFiles: pr.changed_files,
            files,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('Rate limited')) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: 'GitHub API rate limit exceeded. Please try again later or configure a GITHUB_TOKEN.',
            }, null, 2),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: `Failed to fetch PR details: ${errorMessage}`,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}
