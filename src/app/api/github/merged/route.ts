import { NextRequest, NextResponse } from 'next/server';

const GITHUB_REPO = "skridlevsky/openchaos";
const GITHUB_API = "https://api.github.com";

interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  user: { login: string };
  merged_at: string | null;
}

export async function GET(request: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  const [owner, repo] = GITHUB_REPO.split("/");

  // Get limit from query params (default 10)
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const allMergedPRs = [];
    let page = 1;

    while (allMergedPRs.length < limit) {
      const response = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/pulls?state=closed&per_page=100&page=${page}&sort=updated&direction=desc`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch PRs: ${response.status}`);
      }

      const prs: GitHubPR[] = await response.json();

      if (prs.length === 0) {
        break;
      }

      // Filter to only merged PRs (not just closed) and exclude repo owner
      const merged = prs.filter(
        pr => pr.merged_at && pr.user.login !== owner
      );

      allMergedPRs.push(...merged);

      if (prs.length < 100) {
        break;
      }

      page++;
    }

    // Take first N results
    const result = allMergedPRs.slice(0, limit).map(pr => ({
      number: pr.number,
      title: pr.title,
      author: pr.user.login,
      url: pr.html_url,
      mergedAt: pr.merged_at,
    }));

    console.log(`Fetched ${result.length} merged PRs`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch merged PRs from GitHub' },
      { status: 500 }
    );
  }
}
