import { NextResponse } from 'next/server';
import { isGoogleAuthConfigured } from '@/lib/auth/config';
import { getSessionAccessToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID || null;
  const oauthConfigured = isGoogleAuthConfigured();
  const accessToken = await getSessionAccessToken(request);
  const authenticated = Boolean(accessToken);

  return NextResponse.json(
    {
      status: 'ok',
      mode: authenticated ? 'connected' : oauthConfigured ? 'configured' : 'local',
      spreadsheetId,
      spreadsheetUrl: process.env.GOOGLE_SHEETS_URL || (spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}` : undefined),
      integrations: {
        oauth: oauthConfigured,
        sheets: Boolean(spreadsheetId && oauthConfigured),
        authenticated,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
