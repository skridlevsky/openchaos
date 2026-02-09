import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const storedState = request.cookies.get('oauth_state')?.value;
  const redirectPath = request.cookies.get('oauth_redirect')?.value || '/';
  const origin = request.cookies.get('oauth_origin')?.value || request.nextUrl.origin;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/?error=oauth_failed', origin));
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/?error=config_missing', origin));
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL('/?error=token_failed', origin));
  }

  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const userData = await userResponse.json();

  const response = NextResponse.redirect(new URL(redirectPath, origin));

  response.cookies.set('github_token', tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 2592000,
    path: '/',
  });

  response.cookies.set('github_user', JSON.stringify({
    login: userData.login,
    avatar_url: userData.avatar_url,
  }), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 2592000,
    path: '/',
  });

  response.cookies.delete('oauth_state');
  response.cookies.delete('oauth_redirect');
  response.cookies.delete('oauth_origin');

  return response;
}
