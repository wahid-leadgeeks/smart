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

  const redirectBase = new URL('/', request.url);

  // If Google returned an error (e.g. user cancelled)
  if (error) {
    redirectBase.searchParams.set('auth_error', error);
    return NextResponse.redirect(redirectBase);
  }

  // Code and state are required
  if (!code || !state) {
    redirectBase.searchParams.set('auth_error', 'missing_code_or_state');
    return NextResponse.redirect(redirectBase);
  }

  // Validate state from cookie for CSRF protection
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = new Map(
    cookieHeader.split(';').map((pair) => {
      const [k, ...v] = pair.trim().split('=');
      return [k, decodeURIComponent(v.join('='))] as const;
    })
  );

  const storedState = cookies.get(SMART_STATE_COOKIE);
  if (!storedState || storedState !== state) {
    redirectBase.searchParams.set('auth_error', 'state_mismatch');
    return NextResponse.redirect(redirectBase);
  }

  // Exchange code for tokens
  const redirectUri = resolveRedirectUri(request);
  let tokens = await exchangeCodeForTokens(code, redirectUri);
  if (!tokens && redirectUri !== DEFAULT_GOOGLE_REDIRECT_URI) {
    tokens = await exchangeCodeForTokens(code, DEFAULT_GOOGLE_REDIRECT_URI);
  }
  if (!tokens) {
    redirectBase.searchParams.set('auth_error', 'token_exchange_failed');
    return NextResponse.redirect(redirectBase);
  }

  // Fetch user profile
  const user = await fetchGoogleUserProfile(tokens.accessToken);
  if (!user) {
    redirectBase.searchParams.set('auth_error', 'profile_fetch_failed');
    return NextResponse.redirect(redirectBase);
  }

  // Build authenticated session
  const session: AuthSession = {
    user,
    tokens,
    createdAt: new Date().toISOString(),
  };

  const encryptedSession = serializeSessionCookie(session);

  redirectBase.searchParams.set('auth_status', 'connected');
  const response = NextResponse.redirect(redirectBase);

  // Set secure HTTP-only session cookie
  response.cookies.set(SMART_SESSION_COOKIE, encryptedSession, SESSION_COOKIE_OPTIONS);

  // Clear state cookie
  response.cookies.delete(SMART_STATE_COOKIE);

  return response;
}
