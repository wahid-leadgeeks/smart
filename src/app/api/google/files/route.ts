import { NextResponse } from 'next/server';
import { getSessionAccessToken } from '@/lib/auth/session';
import { listDriveSpreadsheets } from '@/lib/sheets/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const accessToken = await getSessionAccessToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: 'Google account not connected. Please connect your Google account first.',
          files: [],
        },
        { status: 401 }
      );
    }

    const files = await listDriveSpreadsheets(accessToken);

    return NextResponse.json({
      success: true,
      authenticated: true,
      files,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch Google Drive files';
    console.error('Google files API error:', err);
    return NextResponse.json(
      {
        success: false,
        authenticated: true,
        error: message,
        files: [],
      },
      { status: 500 }
    );
  }
}
