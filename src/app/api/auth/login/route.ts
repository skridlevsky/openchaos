import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: 'GITHUB_CLIENT_ID not configured' }, { status: 500 });
  }

  const state = crypto.randomUUID();
  const referer = request.headers.get('referer');

  let returnUrl = '/';
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      returnUrl = refererUrl.pathname + refererUrl.search;
    } catch {
      returnUrl = '/';
    }
  }

  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || 'localhost:3000';
  const origin = `${protocol}://${host}`;

  const callbackUrl = `${origin}/api/auth/callback`;
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=public_repo&state=${state}&redirect_uri=${encodeURIComponent(callbackUrl)}`;

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  });

  response.cookies.set('oauth_redirect', returnUrl, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  });

  response.cookies.set('oauth_origin', origin, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  });

  return response;
}
