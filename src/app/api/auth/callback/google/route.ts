import { NextResponse } from 'next/server';
import { exchangeCodeForTokens, fetchGoogleUserProfile } from '@/lib/auth/google';
import { DEFAULT_GOOGLE_REDIRECT_URI, resolveRedirectUri } from '@/lib/auth/config';
import {
  SMART_SESSION_COOKIE,
  SMART_STATE_COOKIE,
  SESSION_COOKIE_OPTIONS,
  serializeSessionCookie,
} from '@/lib/auth/session';
import type { AuthSession } from '@/lib/auth/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Extract cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = new Map(
    cookieHeader.split(';').map((pair) => {
      const [k, ...v] = pair.trim().split('=');
      return [k, decodeURIComponent(v.join('='))] as const;
    })
  );

  const rawReturnTo = cookies.get('smart_return_to');
  const safeReturnTo =
    rawReturnTo && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')
      ? rawReturnTo
      : '/';

  // If Google returned an error (e.g. user cancelled)
  if (error) {
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', error);
    const res = NextResponse.redirect(errorUrl);
    res.cookies.delete(SMART_STATE_COOKIE);
    res.cookies.delete('smart_return_to');
    return res;
  }

  // Code and state are required
  if (!code || !state) {
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'missing_code_or_state');
    return NextResponse.redirect(errorUrl);
  }

  // Validate state from cookie for CSRF protection
  const storedState = cookies.get(SMART_STATE_COOKIE);
  if (!storedState || storedState !== state) {
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'state_mismatch');
    return NextResponse.redirect(errorUrl);
  }

  // Exchange code for tokens
  const redirectUri = resolveRedirectUri(request);
  let tokens = await exchangeCodeForTokens(code, redirectUri);
  if (!tokens && redirectUri !== DEFAULT_GOOGLE_REDIRECT_URI) {
    tokens = await exchangeCodeForTokens(code, DEFAULT_GOOGLE_REDIRECT_URI);
  }
  if (!tokens) {
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'token_exchange_failed');
    return NextResponse.redirect(errorUrl);
  }

  // Fetch user profile
  const user = await fetchGoogleUserProfile(tokens.accessToken);
  if (!user) {
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'profile_fetch_failed');
    return NextResponse.redirect(errorUrl);
  }

  // Build authenticated session
  const session: AuthSession = {
    user,
    tokens,
    createdAt: new Date().toISOString(),
  };

  const encryptedSession = serializeSessionCookie(session);

  const redirectTarget = new URL(safeReturnTo, request.url);
  redirectTarget.searchParams.set('auth_status', 'connected');
  const response = NextResponse.redirect(redirectTarget);

  // Set secure HTTP-only session cookie
  response.cookies.set(SMART_SESSION_COOKIE, encryptedSession, SESSION_COOKIE_OPTIONS);

  // Clear temporary state and return cookies
  response.cookies.delete(SMART_STATE_COOKIE);
  response.cookies.delete('smart_return_to');

  return response;
}
