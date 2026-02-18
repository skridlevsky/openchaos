import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pickRandomVariant } from '@/lib/chaos-router';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const variant = pickRandomVariant();
    return NextResponse.rewrite(new URL(`/${variant}`, request.url));
  }
}
