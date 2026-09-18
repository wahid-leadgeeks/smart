import { NextResponse } from 'next/server';
import { getSessionAccessToken } from '@/lib/auth/session';
import { fetchGoogleSheetMetadata } from '@/lib/sheets/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const spreadsheetUrl = process.env.GOOGLE_SHEETS_URL || (spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}` : undefined);

  if (!spreadsheetId) {
    return NextResponse.json(
      { success: false, error: 'GOOGLE_SHEETS_ID is not configured in .env.local' },
      { status: 400 }
    );
  }

  const accessToken = await getSessionAccessToken(request);

  if (!accessToken) {
    return NextResponse.json({
      success: true,
      authenticated: false,
      spreadsheetId,
      spreadsheetUrl,
      loginUrl: '/api/auth/login',
      message: 'Not connected to Google Sheets. Sign in with Google to sync live from the spreadsheet.',
    });
  }

  try {
    const metadata = await fetchGoogleSheetMetadata(spreadsheetId, accessToken);
    return NextResponse.json({
      success: true,
      authenticated: true,
      spreadsheetId,
      spreadsheetUrl,
      metadata,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch spreadsheet metadata';
    return NextResponse.json({
      success: false,
      authenticated: true,
      spreadsheetId,
      spreadsheetUrl,
      error: errorMessage,
    }, { status: 502 });
  }
}
