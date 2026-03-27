import { NextRequest, NextResponse } from 'next/server';
import { reactionToVote, type UserVote } from '@/lib/votes';

interface ReactionWithUser {
  content: string;
  user: {
    login: string;
  } | null;
}

class GitHubApiError extends Error {
  constructor(public statusCode: number, public prNumber?: number) {
    super(prNumber != null
      ? `GitHub API error for PR #${prNumber}: ${statusCode}`
      : `GitHub API error: ${statusCode}`);
  }
}

const GITHUB_REACTIONS_URL = 'https://api.github.com/repos/skridlevsky/openchaos/issues';
const REACTIONS_PER_PAGE = 100;
const MAX_PRS = 50;
const MAX_PAGES = 10;

function parsePrNumbers(prsParam: string): number[] {
  return prsParam.split(',').map(Number).filter(n => !isNaN(n) && n > 0).slice(0, MAX_PRS);
}

async function fetchAuthenticatedUser(token: string): Promise<string> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new GitHubApiError(response.status);
  }

  let data: { login?: unknown };
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error(`Failed to parse /user response: ${parseError}`);
  }
  if (!data.login || typeof data.login !== 'string') {
    throw new Error('GitHub /user response missing login field');
  }
  return data.login;
}

async function fetchUserVoteForPR(
  prNumber: number,
  userLogin: string,
  token: string,
): Promise<[number, UserVote]> {
  let lastVote: UserVote = null;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await fetch(
      `${GITHUB_REACTIONS_URL}/${prNumber}/reactions?per_page=${REACTIONS_PER_PAGE}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new GitHubApiError(response.status, prNumber);
    }

    let reactions: ReactionWithUser[];
    try {
      reactions = await response.json();
    } catch (parseError) {
      throw new Error(`Failed to parse reactions for PR #${prNumber}: ${parseError}`);
    }

    if (reactions.length === 0) break;

    // findLast to get the most recent matching reaction on this page
    const userReaction = reactions.findLast(
      r => r.user?.login === userLogin && (r.content === '+1' || r.content === '-1')
    );

    if (userReaction) {
      lastVote = reactionToVote(userReaction.content as '+1' | '-1');
    }

    if (reactions.length < REACTIONS_PER_PAGE) break;
  }

  return [prNumber, lastVote];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.cookies.get('github_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let userLogin: string;
    try {
      userLogin = await fetchAuthenticatedUser(token);
    } catch (error) {
      console.error('Failed to authenticate user:', error);
      if (error instanceof GitHubApiError) {
        if (error.statusCode === 401) {
          return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }
        if (error.statusCode === 403) {
          return NextResponse.json({ error: 'GitHub rate limit exceeded' }, { status: 429 });
        }
        return NextResponse.json({ error: `GitHub API error (${error.statusCode})` }, { status: 502 });
      }
      return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 502 });
    }

    const prsParam = request.nextUrl.searchParams.get('prs');
    if (!prsParam) {
      return NextResponse.json({ error: 'Missing prs parameter' }, { status: 400 });
    }

    const prNumbers = parsePrNumbers(prsParam);
    if (prNumbers.length === 0) {
      return NextResponse.json({ votes: {} });
    }

    const results = await Promise.allSettled(
      prNumbers.map(prNumber => fetchUserVoteForPR(prNumber, userLogin, token))
    );

    const votes: Record<number, UserVote> = {};
    const failedPrs: number[] = [];
    let hasAuthError = false;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const [prNumber, vote] = result.value;
        votes[prNumber] = vote;
      } else {
        console.error('Failed to fetch vote for PR:', result.reason);
        if (result.reason instanceof GitHubApiError) {
          if (result.reason.statusCode === 401) {
            hasAuthError = true;
          } else if (result.reason.statusCode === 403) {
            console.warn('GitHub 403 (possible rate limit) for PR:', result.reason.prNumber);
          }
          if (result.reason.prNumber != null) {
            failedPrs.push(result.reason.prNumber);
          }
        }
      }
    }

    if (hasAuthError) {
      return NextResponse.json({ error: 'GitHub authentication failed' }, { status: 401 });
    }

    return NextResponse.json({ votes, ...(failedPrs.length > 0 && { failedPrs }) });
  } catch (error) {
    console.error('Vote status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
