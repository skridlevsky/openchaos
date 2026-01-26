import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pickRandomVariant } from '@/lib/chaos-router';

export function middleware(request: NextRequest) {
  // Only intercept homepage
  if (request.nextUrl.pathname !== '/') {
    return NextResponse.next();
  }

  const variant = pickRandomVariant();
  const url = request.nextUrl.clone();
  url.pathname = `/${variant}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: '/',
};
