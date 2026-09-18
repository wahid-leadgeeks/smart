import { NextRequest, NextResponse } from 'next/server';
import { seedDatabaseFromExcel } from '@/lib/excel-parser';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const stats = seedDatabaseFromExcel();
    return NextResponse.json({
      success: true,
      message: 'Database successfully re-seeded from source Excel file.',
      data: stats,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync from Excel' },
      { status: 500 }
    );
  }
}
