import { NextRequest, NextResponse } from 'next/server';

const GITHUB_REPO = "skridlevsky/openchaos";
const GITHUB_API = "https://api.github.com";
const GITHUB_GRAPHQL = "https://api.github.com/graphql";

interface GitHubPR {
  number: number;
  title: string;
  html_url: string;
  user: { login: string };
  created_at: string;
}

interface GitHubReaction {
  content: string;
}

export async function GET(request: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  const [owner, repo] = GITHUB_REPO.split("/");

  try {
    // Use GraphQL if token available, otherwise REST
    if (token) {
      return await fetchViaGraphQL(owner, repo, token);
    } else {
      return await fetchViaREST(owner, repo);
    }
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PRs from GitHub' },
      { status: 500 }
    );
  }
}

async function fetchViaGraphQL(owner: string, repo: string, token: string) {
  console.log('Fetching PRs via GraphQL');

  const query = `
    query($owner: String!, $repo: String!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        pullRequests(first: 100, states: OPEN, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            number
            title
            url
            createdAt
            author {
              login
            }
            reactions(first: 100, content: [THUMBS_UP, THUMBS_DOWN]) {
              nodes {
                content
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const allPRs = [];
  let cursor = null;

  // Paginate through PRs
  while (true) {
    const variables = cursor
      ? { owner, repo, cursor }
      : { owner, repo };

    const response = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v4+json',
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error('GraphQL query failed');
    }

    const nodes = data.data.repository.pullRequests.nodes;
    const pageInfo = data.data.repository.pullRequests.pageInfo;

    // Process PRs
    for (const node of nodes) {
      const reactions = node.reactions.nodes;
      const upvotes = reactions.filter((r: any) => r.content === 'THUMBS_UP').length;
      const downvotes = reactions.filter((r: any) => r.content === 'THUMBS_DOWN').length;

      allPRs.push({
        number: node.number,
        title: node.title,
        author: node.author?.login || 'ghost',
        url: node.url,
        votes: upvotes - downvotes,
        createdAt: node.createdAt,
      });
    }

    if (!pageInfo.hasNextPage) {
      break;
    }

    cursor = pageInfo.endCursor;
  }

  // Sort by votes DESC, then createdAt DESC
  allPRs.sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  console.log(`Fetched ${allPRs.length} PRs via GraphQL`);

  return NextResponse.json(allPRs);
}

async function fetchViaREST(owner: string, repo: string) {
  console.log('Fetching PRs via REST (no token)');

  // Fetch PRs
  const prsResponse = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/pulls?state=open&per_page=100&sort=created&direction=desc`,
    {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
      next: { revalidate: 300 },
    }
  );

  if (!prsResponse.ok) {
    throw new Error(`Failed to fetch PRs: ${prsResponse.status}`);
  }

  const prs: GitHubPR[] = await prsResponse.json();

  // Only fetch reactions for first 20 PRs to avoid rate limit
  const limit = Math.min(20, prs.length);
  const prsWithVotes = [];

  for (let i = 0; i < limit; i++) {
    const pr = prs[i];
    const reactionsResponse = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/issues/${pr.number}/reactions?per_page=100&page=1`,
      {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
        next: { revalidate: 300 },
      }
    );

    let votes = 0;
    if (reactionsResponse.ok) {
      const reactions: GitHubReaction[] = await reactionsResponse.json();
      const upvotes = reactions.filter(r => r.content === '+1').length;
      const downvotes = reactions.filter(r => r.content === '-1').length;
      votes = upvotes - downvotes;
    }

    prsWithVotes.push({
      number: pr.number,
      title: pr.title,
      author: pr.user.login,
      url: pr.html_url,
      votes,
      createdAt: pr.created_at,
    });
  }

  // Add remaining PRs with 0 votes
  for (let i = limit; i < prs.length; i++) {
    const pr = prs[i];
    prsWithVotes.push({
      number: pr.number,
      title: pr.title,
      author: pr.user.login,
      url: pr.html_url,
      votes: 0,
      createdAt: pr.created_at,
    });
  }

  // Sort by votes DESC, then createdAt DESC
  prsWithVotes.sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  console.log(`Fetched ${prsWithVotes.length} PRs via REST (reactions for top ${limit})`);

  return NextResponse.json(prsWithVotes);
}
