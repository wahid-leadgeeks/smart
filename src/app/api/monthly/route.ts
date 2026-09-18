import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyGrid } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '1', 10);
    const validMonth = Math.min(12, Math.max(1, month));

    const grid = await getMonthlyGrid(validMonth);
    return NextResponse.json({ success: true, data: grid });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
