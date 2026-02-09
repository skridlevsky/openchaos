import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('github_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prNumber, reaction } = body;

    if (!prNumber || !reaction || (reaction !== '+1' && reaction !== '-1')) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.github.com/repos/skridlevsky/openchaos/issues/${prNumber}/reactions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.squirrel-girl-preview+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: reaction }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || 'Failed to add reaction' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
