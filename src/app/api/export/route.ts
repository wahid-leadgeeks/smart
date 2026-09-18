import { NextRequest, NextResponse } from 'next/server';
import { exportGoalsToExcelBuffer } from '@/lib/excel-exporter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const buffer = await exportGoalsToExcelBuffer();
    const filename = `LeadGeeks-IT-SMART-Goals-2026-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export Excel file' },
      { status: 500 }
    );
  }
}
