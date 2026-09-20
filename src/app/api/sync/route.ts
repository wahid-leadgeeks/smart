import { NextRequest, NextResponse } from 'next/server';
import { seedDatabaseFromExcel } from '@/lib/excel-parser';
import { getSessionAccessToken } from '@/lib/auth/session';
import { downloadSpreadsheetBufferFromGoogle, extractGoogleFileId } from '@/lib/sheets/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      source?: 'google' | 'local' | 'auto';
      spreadsheetId?: string;
      fileId?: string;
    };
    const requestedSource = body.source || 'auto';
    const targetFileOrSheetId = extractGoogleFileId(body.spreadsheetId || body.fileId || process.env.GOOGLE_SHEETS_ID || '');
    const accessToken = await getSessionAccessToken(request);

    // 1. If Google sync is requested or available with access token
    if (requestedSource !== 'local' && targetFileOrSheetId && accessToken) {
      try {
        const downloadResult = await downloadSpreadsheetBufferFromGoogle(targetFileOrSheetId, accessToken);
        const stats = await seedDatabaseFromExcel(downloadResult.buffer);
        return NextResponse.json({
          success: true,
          source: 'google_sheets',
          spreadsheetId: targetFileOrSheetId,
          fileName: downloadResult.fileName,
          message: `Database successfully synced from Google (${downloadResult.fileName}).`,
          data: stats,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google Sheets sync failed';
        console.warn('Google Sheets live sync failed, checking fallback:', message);

        // If user explicitly asked for Google, fail with error
        if (requestedSource === 'google' || body.spreadsheetId || body.fileId) {
          return NextResponse.json(
            { success: false, error: message },
            { status: 502 }
          );
        }
        // Otherwise fall through to local fallback
      }
    } else if (requestedSource === 'google' && !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated with Google. Please sign in first.' },
        { status: 401 }
      );
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
