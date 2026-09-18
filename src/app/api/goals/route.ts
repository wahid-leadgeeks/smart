import { NextRequest, NextResponse } from 'next/server';
import { getAllGoals } from '@/lib/db';
import { seedDatabaseFromExcel } from '@/lib/excel-parser';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fn = searchParams.get('function') || undefined;
    const status = searchParams.get('status') || undefined;
    const goalType = searchParams.get('goalType') || undefined;
    const search = searchParams.get('search') || undefined;

    let goals = await getAllGoals({ function: fn, status, goalType, search });

    // If database is empty, auto-seed from Excel
    if (goals.length === 0 && !search && !fn && !status && !goalType) {
      console.log('Auto-seeding database from Excel...');
      await seedDatabaseFromExcel();
      goals = await getAllGoals();
    }

    return NextResponse.json({ success: true, data: goals });
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}
