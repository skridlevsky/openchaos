import { cachedFetch } from '../cache';
import { GITHUB_REPO, getHeaders } from '@/lib/github';

export async function getRepoStatsTool() {
  try {
    const [owner, repo] = GITHUB_REPO.split("/");

    // Fetch repository details (with caching)
    const repoData = await cachedFetch<any>(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: getHeaders("application/vnd.github.v3+json"),
      }
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            name: repoData.name,
            fullName: repoData.full_name,
            description: repoData.description,
            url: repoData.html_url,
            stars: repoData.stargazers_count,
            watchers: repoData.watchers_count,
            forks: repoData.forks_count,
            openIssues: repoData.open_issues_count,
            language: repoData.language,
            createdAt: repoData.created_at,
            updatedAt: repoData.updated_at,
            pushedAt: repoData.pushed_at,
            size: repoData.size,
            defaultBranch: repoData.default_branch,
            topics: repoData.topics || [],
            license: repoData.license?.name || null,
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
            error: `Failed to fetch repository stats: ${errorMessage}`,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}
