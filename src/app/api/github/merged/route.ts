import { NextRequest, NextResponse } from 'next/server';
import { get_merged_prs } from '@/wasm/pkg/openchaos_wasm';

export async function GET(request: NextRequest) {
  try {
    const token = process.env.GITHUB_TOKEN || undefined;

    // Get limit from query params (default 10)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Call Rust WASM function
    const result = await get_merged_prs(limit, token);

    // Parse JSON string returned from Rust
    const prs = JSON.parse(result);

    return NextResponse.json(prs, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('WASM error fetching merged PRs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch merged PRs' },
      { status: 500 }
    );
  }
}
