import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getGoogleAuthUrl } from '@/lib/auth/google';
import { resolveRedirectUri } from '@/lib/auth/config';
import { SMART_STATE_COOKIE, STATE_COOKIE_OPTIONS } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const customRedirect = url.searchParams.get('redirect_uri') || undefined;
  const returnTo = url.searchParams.get('return_to') || url.searchParams.get('redirect') || '/';

  // Generate a random CSRF state token
  const state = crypto.randomBytes(24).toString('hex');

  const redirectUri = resolveRedirectUri(request, customRedirect);
  const authUrl = getGoogleAuthUrl(state, redirectUri);
  if (!authUrl) {
    return NextResponse.redirect(new URL('/login?error=oauth_unconfigured', request.url));
  }

  const response = NextResponse.redirect(authUrl);

  // Store state in an HTTP-only temporary cookie
  response.cookies.set(SMART_STATE_COOKIE, state, STATE_COOKIE_OPTIONS);

  // Store return destination in a temporary cookie if safe
  if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
    response.cookies.set('smart_return_to', returnTo, STATE_COOKIE_OPTIONS);
  }

  return response;
}
