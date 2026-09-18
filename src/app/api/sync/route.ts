import { NextRequest, NextResponse } from 'next/server';
import { seedDatabaseFromExcel } from '@/lib/excel-parser';
import { getSessionAccessToken } from '@/lib/auth/session';
import { fetchGoogleSpreadsheetBuffer } from '@/lib/sheets/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { source?: 'google' | 'local' | 'auto' };
    const requestedSource = body.source || 'auto';
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const accessToken = await getSessionAccessToken(request);

    // 1. If Google sync is available and not forced to local
    if (requestedSource !== 'local' && spreadsheetId && accessToken) {
      try {
        const buffer = await fetchGoogleSpreadsheetBuffer(spreadsheetId, accessToken);
        const stats = await seedDatabaseFromExcel(buffer);
        return NextResponse.json({
          success: true,
          source: 'google_sheets',
          spreadsheetId,
          message: 'Database successfully synced from live Google Spreadsheet.',
          data: stats,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google Sheets sync failed';
        console.warn('Google Sheets live sync failed, checking fallback:', message);

        // If user explicitly asked for Google, fail with error
        if (requestedSource === 'google') {
          return NextResponse.json(
            { success: false, error: message },
            { status: 502 }
          );
        }
        // Otherwise fall through to local fallback
      }
    }

    // 2. Fallback to local master Excel file
    const stats = await seedDatabaseFromExcel();
    return NextResponse.json({
      success: true,
      source: 'local_file',
      message: 'Database successfully synced from local master spreadsheet.',
      data: stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to sync data';
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
