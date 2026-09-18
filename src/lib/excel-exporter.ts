import * as XLSX from 'xlsx';
import { getAllGoals, getBigSix } from './db';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function exportGoalsToExcelBuffer(): Buffer {
  const goals = getAllGoals();
  const bigSix = getBigSix();

  const wb = XLSX.utils.book_new();

  // 1. Build ITE Sheet
  const iteRows: any[][] = [];

  // Row 1: Headers
  const headerRow: string[] = [
    'Department Functions',
    'Department Goals',
    'Department Goals (Specific)',
    'Indicators (Measurable)',
    'Day Counter',
    'Status',
    'Accomplishment Status',
    'Goals Type',
    'Owner',
    'PIC',
    'Collaborators',
    'Collaboration',
    'Type',
    'Period',
    'Expectations (Complexity, Frequency, Execution)',
    'Strengths',
    'Weaknesses',
    'Opportunities',
    'Threats',
    'Resources Availability',
    'Plan for Unavailable Resources',
    'Company Goals Reference',
    'Start date',
    'End date',
    'Notes',
    'Half Adjustment',
  ];

  // Add monthly headers (Achievement, Result, Challenge, Homework)
  for (const m of MONTH_NAMES) {
    headerRow.push(`Status (${m})`);
    headerRow.push(`Result/Link (${m})`);
    headerRow.push(`Challenge (${m})`);
    headerRow.push(`Homework (${m})`);
  }

  iteRows.push(headerRow);

  // Add goal rows
  for (const g of goals) {
    const row: any[] = [
      g.function,
      g.title,
      g.specific_statement,
      `Action: ${g.action_plan}\nTarget: ${g.target}\nThe Way: ${g.the_way}`,
      g.day_counter || '',
      g.status,
      g.accomplishment_status,
      g.goal_type,
      g.owner,
      g.pic,
      g.collaborators,
      g.collaboration_flag,
      g.type,
      g.period,
      `Complexity: ${g.complexity} | Frequency: ${g.frequency} | Period: ${g.execution_period}`,
      g.strengths,
      g.weaknesses,
      g.opportunities,
      g.threats,
      `Budget: ${g.budget_available} | HR: ${g.hr_available} | Time: ${g.time_available} | Tech: ${g.tech_available}`,
      g.resource_plan,
      g.company_focus_ref,
      g.start_date,
      g.end_date,
      g.notes || '',
      g.half_adjustment || '',
    ];

    const logs = g.monthly_logs || [];
    for (let m = 1; m <= 12; m++) {
      const log = logs.find((l) => l.month_number === m);
      row.push(log?.achievement_status || 'Not started');
      row.push(log?.result_link || '');
      row.push(log?.challenge || '-');
      row.push(log?.homework || '-');
    }

    iteRows.push(row);
  }

  const iteSheet = XLSX.utils.aoa_to_sheet(iteRows);
  XLSX.utils.book_append_sheet(wb, iteSheet, 'ITE');

  // 2. Build The BIG Six Sheet
  const bigSixRows: any[][] = [
    ['No.', 'The BIG Six Objective', 'Status Quo', '2026 Strategic Objective', 'The Focus Area', 'PIC', 'Focus Category']
  ];
  for (const b of bigSix) {
    bigSixRows.push([
      b.objective_number,
      b.title,
      b.status_quo,
      b.strategic_objective,
      b.focus_area,
      b.pic,
      b.focus_category,
    ]);
  }
  const bigSixSheet = XLSX.utils.aoa_to_sheet(bigSixRows);
  XLSX.utils.book_append_sheet(wb, bigSixSheet, 'The BIG Six');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
