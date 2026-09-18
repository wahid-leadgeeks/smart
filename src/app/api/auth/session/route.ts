import { NextResponse } from 'next/server';
import {
  SMART_SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  resolveActiveSession,
  serializeSessionCookie,
  toSessionResponse,
} from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = new Map(
    cookieHeader.split(';').map((pair) => {
      const [k, ...v] = pair.trim().split('=');
      return [k, decodeURIComponent(v.join('='))] as const;
    })
  );

  const sessionCookie = cookies.get(SMART_SESSION_COOKIE);
  const { session, refreshed } = await resolveActiveSession(sessionCookie);

  const response = NextResponse.json(toSessionResponse(session), {
    headers: { 'Cache-Control': 'no-store' },
  });

  // If token was refreshed during resolution, update the session cookie
  if (refreshed && session) {
    response.cookies.set(
      SMART_SESSION_COOKIE,
      serializeSessionCookie(session),
      SESSION_COOKIE_OPTIONS
    );
  }

  return response;
}
