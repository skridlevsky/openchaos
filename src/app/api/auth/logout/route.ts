import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  response.cookies.delete('github_token');
  response.cookies.delete('github_user');

  return response;
}
