import { NextResponse } from 'next/server';
import { get_open_prs } from '@/wasm/pkg/openchaos_wasm';

// In-memory cache (5 min TTL)
let cachedData: any = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    // Return cached data if still valid
    const now = Date.now();
    if (cachedData && (now - cacheTime) < CACHE_TTL) {
      console.log('Returning cached PRs');
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'HIT',
        },
      });
    }

    const token = process.env.GITHUB_TOKEN || undefined;

    // Call Rust WASM function
    const result = await get_open_prs(token);

    // Parse JSON string returned from Rust
    const prs = JSON.parse(result);

    // Update cache
    cachedData = prs;
    cacheTime = now;

    return NextResponse.json(prs, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('WASM error fetching PRs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PRs' },
      { status: 500 }
    );
  }
}
