import { NextResponse } from 'next/server';
import { SMART_SESSION_COOKIE } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
  response.cookies.delete(SMART_SESSION_COOKIE);
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirect') || '/?auth_status=logged_out';

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.delete(SMART_SESSION_COOKIE);
  return response;
}
