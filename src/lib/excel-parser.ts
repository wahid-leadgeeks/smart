import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { getDb } from './db';
import { DepartmentFunction, GoalStatus, AccomplishmentStatus, GoalType } from './types';

export const DEFAULT_EXCEL_PATH = '/home/noah/Documents/sheets/[IT SMART Goals] - LeadGeeks Inc. 2026 Goals, Objectives and Plans.xlsx';

function excelDateToString(val: any): string {
  if (!val) return '';
  if (typeof val === 'number') {
    // Excel date epoch: 1899-12-30
    const date = new Date((val - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  const str = String(val).trim();
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return str;
}

function parseMeasurable(raw: string) {
  let action = '';
  let target = '';
  let theWay = '';

  if (!raw) return { action, target, theWay };

  const actionMatch = raw.match(/Action:\s*([\s\S]*?)(?=Target:|$)/i);
  const targetMatch = raw.match(/Target:\s*([\s\S]*?)(?=The Way:|$)/i);
  const theWayMatch = raw.match(/The Way:\s*([\s\S]*?)$/i);

  if (actionMatch) action = actionMatch[1].trim();
  if (targetMatch) target = targetMatch[1].trim();
  if (theWayMatch) theWay = theWayMatch[1].trim();

  if (!action && !target && !theWay) {
    target = raw.trim();
  }

  return { action, target, theWay };
}

function parseExpectations(raw: string) {
  let complexity = 'Mid';
  let frequency = 'Medium';
  let executionPeriod = 'Mid';

  if (!raw) return { complexity, frequency, executionPeriod };

  const cMatch = raw.match(/Complexity\s*\n*([A-Za-z]+)/i);
  const fMatch = raw.match(/Frequency\s*\n*([A-Za-z]+)/i);
  const eMatch = raw.match(/Execution Period\s*\n*([A-Za-z]+)/i);

  if (cMatch) complexity = cMatch[1].trim();
  if (fMatch) frequency = fMatch[1].trim();
  if (eMatch) executionPeriod = eMatch[1].trim();

  return { complexity, frequency, executionPeriod };
}

const MONTH_COLUMNS: {
  monthNumber: number;
  monthName: string;
  statusCol: string;
  linkCol: string;
  challengeCol: string;
  homeworkCol: string;
}[] = [
  { monthNumber: 1, monthName: 'January', statusCol: 'AP', linkCol: 'AQ', challengeCol: 'AR', homeworkCol: 'AS' },
  { monthNumber: 2, monthName: 'February', statusCol: 'AT', linkCol: 'AU', challengeCol: 'AV', homeworkCol: 'AW' },
  { monthNumber: 3, monthName: 'March', statusCol: 'AX', linkCol: 'AY', challengeCol: 'AZ', homeworkCol: 'BA' },
  { monthNumber: 4, monthName: 'April', statusCol: 'BB', linkCol: 'BC', challengeCol: 'BD', homeworkCol: 'BE' },
  { monthNumber: 5, monthName: 'May', statusCol: 'BF', linkCol: 'BG', challengeCol: 'BH', homeworkCol: 'BI' },
  { monthNumber: 6, monthName: 'June', statusCol: 'BJ', linkCol: 'BK', challengeCol: 'BL', homeworkCol: 'BM' },
  { monthNumber: 7, monthName: 'July', statusCol: 'BN', linkCol: 'BO', challengeCol: 'BP', homeworkCol: 'BQ' },
  { monthNumber: 8, monthName: 'August', statusCol: 'BR', linkCol: 'BS', challengeCol: 'BT', homeworkCol: 'BU' },
  { monthNumber: 9, monthName: 'September', statusCol: 'BV', linkCol: 'BW', challengeCol: 'BX', homeworkCol: 'BY' },
  { monthNumber: 10, monthName: 'October', statusCol: 'BZ', linkCol: 'CA', challengeCol: 'CB', homeworkCol: 'CC' },
  { monthNumber: 11, monthName: 'November', statusCol: 'CD', linkCol: 'CE', challengeCol: 'CF', homeworkCol: 'CG' },
  { monthNumber: 12, monthName: 'December', statusCol: 'CH', linkCol: 'CI', challengeCol: 'CJ', homeworkCol: 'CK' },
];

export function seedDatabaseFromExcel(filePath: string = DEFAULT_EXCEL_PATH) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel source file not found at: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const db = getDb();

  const iteSheet = workbook.Sheets['ITE'];
  if (!iteSheet) {
    throw new Error(`Sheet 'ITE' not found in workbook.`);
  }

  const bigSixSheet = workbook.Sheets['The BIG Six'];

  const runSeed = db.transaction(() => {
    // Clear existing
    db.prepare(`DELETE FROM monthly_logs`).run();
    db.prepare(`DELETE FROM goals`).run();
    db.prepare(`DELETE FROM big_six`).run();
    try {
      db.prepare(`DELETE FROM sqlite_sequence WHERE name IN ('goals', 'monthly_logs', 'big_six')`).run();
    } catch {}

    // 1. Seed The BIG Six if available
    if (bigSixSheet) {
      const insertBigSix = db.prepare(`
        INSERT INTO big_six (
          objective_number, title, status_quo, strategic_objective,
          focus_area, pic, focus_category, company_focus, company_priority
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      let currentObjectiveNumber = 1;
      let currentTitle = '';
      let currentStatusQuo = '';
      let currentStrategicObjective = '';

      for (let r = 2; r <= 36; r++) {
        const titleCell = bigSixSheet[`A${r}`]?.v ? String(bigSixSheet[`A${r}`].v).trim() : '';
        const statusQuoCell = bigSixSheet[`B${r}`]?.v ? String(bigSixSheet[`B${r}`].v).trim() : '';
        const stratCell = bigSixSheet[`C${r}`]?.v ? String(bigSixSheet[`C${r}`].v).trim() : '';
        const focusCell = bigSixSheet[`D${r}`]?.v ? String(bigSixSheet[`D${r}`].v).trim() : '';
        const picCell = bigSixSheet[`E${r}`]?.v ? String(bigSixSheet[`E${r}`].v).trim() : '';
        const companyFocusCell = bigSixSheet[`F${r}`]?.v ? String(bigSixSheet[`F${r}`].v).trim() : '';
        const priorityCell = bigSixSheet[`G${r}`]?.v ? String(bigSixSheet[`G${r}`].v).trim() : '';

        if (titleCell) {
          currentTitle = titleCell;
          const match = titleCell.match(/^(\d+)/);
          if (match) currentObjectiveNumber = parseInt(match[1], 10);
        }
        if (statusQuoCell) currentStatusQuo = statusQuoCell;
        if (stratCell) currentStrategicObjective = stratCell;

        if (focusCell) {
          insertBigSix.run(
            currentObjectiveNumber,
            currentTitle,
            currentStatusQuo,
            currentStrategicObjective,
            focusCell,
            picCell,
            priorityCell,
            companyFocusCell,
            priorityCell
          );
        }
      }
    }

    // 2. Seed Goals and Monthly Logs from ITE Sheet
    const insertGoal = db.prepare(`
      INSERT INTO goals (
        row_number, function, title, specific_statement, action_plan, target, the_way,
        goal_type, owner, pic, collaborators, collaboration_flag, type, period,
        complexity, frequency, execution_period, strengths, weaknesses, opportunities, threats,
        budget_available, hr_available, time_available, tech_available, resource_plan,
        company_focus_ref, start_date, end_date, day_counter, status, accomplishment_status,
        half_adjustment, notes
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?
      )
    `);

    const insertMonthly = db.prepare(`
      INSERT INTO monthly_logs (
        goal_id, month_number, month_name, achievement_status, result_link, result_url, challenge, homework
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // In ITE, goals start from row 3 up to row 21
    for (let r = 3; r <= 25; r++) {
      const title = iteSheet[`B${r}`]?.v ? String(iteSheet[`B${r}`].v).trim() : '';
      if (!title || title.includes('DO NOT CHANGE') || title.includes('ARRAYFORMULA')) {
        continue;
      }

      const fn = (iteSheet[`A${r}`]?.v ? String(iteSheet[`A${r}`].v).trim() : 'Others') as DepartmentFunction;
      const specific = iteSheet[`C${r}`]?.v ? String(iteSheet[`C${r}`].v).trim() : '';
      const measurableRaw = iteSheet[`D${r}`]?.v ? String(iteSheet[`D${r}`].v).trim() : '';
      const { action, target, theWay } = parseMeasurable(measurableRaw);

      const dayCounter = iteSheet[`E${r}`]?.v ? String(iteSheet[`E${r}`].v).trim() : '';
      const status = (iteSheet[`F${r}`]?.v ? String(iteSheet[`F${r}`].v).trim() : 'Not started') as GoalStatus;
      const accomplishmentStatus = (iteSheet[`H${r}`]?.v ? String(iteSheet[`H${r}`].v).trim() : 'Not Started') as AccomplishmentStatus;
      const goalType = (iteSheet[`I${r}`]?.v ? String(iteSheet[`I${r}`].v).trim() : 'Improvement') as GoalType;

      const owner = iteSheet[`J${r}`]?.v ? String(iteSheet[`J${r}`].v).trim() : 'ITE';
      const pic = iteSheet[`K${r}`]?.v ? String(iteSheet[`K${r}`].v).trim() : 'ITE';
      const collaborators = iteSheet[`L${r}`]?.v ? String(iteSheet[`L${r}`].v).trim() : '';
      const collaborationFlag = (iteSheet[`M${r}`]?.v ? String(iteSheet[`M${r}`].v).trim() : 'No') as 'Yes' | 'No';
      const type = iteSheet[`N${r}`]?.v ? String(iteSheet[`N${r}`].v).trim() : 'Program';
      const period = iteSheet[`O${r}`]?.v ? String(iteSheet[`O${r}`].v).trim() : 'Periodic';

      const expRaw = iteSheet[`P${r}`]?.v ? String(iteSheet[`P${r}`].v).trim() : '';
      const { complexity, frequency, executionPeriod } = parseExpectations(expRaw);

      const strengths = iteSheet[`Q${r}`]?.v ? String(iteSheet[`Q${r}`].v).trim() : '';
      const weaknesses = iteSheet[`R${r}`]?.v ? String(iteSheet[`R${r}`].v).trim() : '';
      const opportunities = iteSheet[`S${r}`]?.v ? String(iteSheet[`S${r}`].v).trim() : '';
      const threats = iteSheet[`T${r}`]?.v ? String(iteSheet[`T${r}`].v).trim() : '';

      const resourcesAvail = iteSheet[`U${r}`]?.v ? String(iteSheet[`U${r}`].v).trim() : '';
      const budgetAvail = resourcesAvail.includes('Budget:\n-YES') || resourcesAvail.includes('Budget: YES') ? 'YES' : 'NO';
      const hrAvail = resourcesAvail.includes('Human resource:\n-YES') || resourcesAvail.includes('Human resource: YES') ? 'YES' : 'NO';
      const timeAvail = resourcesAvail.includes('Time:\n-YES') || resourcesAvail.includes('Time: YES') ? 'YES' : 'NO';
      const techAvail = resourcesAvail.includes('Technology:\n-YES') || resourcesAvail.includes('Technology: YES') ? 'YES' : 'NO';

      const resourcePlan = iteSheet[`V${r}`]?.v ? String(iteSheet[`V${r}`].v).trim() : '';
      const companyFocusRef = iteSheet[`W${r}`]?.v ? String(iteSheet[`W${r}`].v).trim() : '';

      const startDate = excelDateToString(iteSheet[`X${r}`]?.v);
      const endDate = excelDateToString(iteSheet[`Y${r}`]?.v);
      const notes = iteSheet[`Z${r}`]?.v ? String(iteSheet[`Z${r}`].v).trim() : '';
      const halfAdjustment = iteSheet[`AA${r}`]?.v ? String(iteSheet[`AA${r}`].v).trim() : '';

      const info = insertGoal.run(
        r,
        fn,
        title,
        specific,
        action,
        target,
        theWay,
        goalType,
        owner,
        pic,
        collaborators,
        collaborationFlag,
        type,
        period,
        complexity,
        frequency,
        executionPeriod,
        strengths,
        weaknesses,
        opportunities,
        threats,
        budgetAvail,
        hrAvail,
        timeAvail,
        techAvail,
        resourcePlan,
        companyFocusRef,
        startDate,
        endDate,
        dayCounter,
        status,
        accomplishmentStatus,
        halfAdjustment,
        notes
      );

      const goalId = Number(info.lastInsertRowid);

      // Insert 12 monthly log records
      for (const m of MONTH_COLUMNS) {
        const cell = iteSheet[`${m.linkCol}${r}`];
        const mStatus = iteSheet[`${m.statusCol}${r}`]?.v ? String(iteSheet[`${m.statusCol}${r}`].v).trim() : 'Not started';
        const mLink = cell?.v ? String(cell.v).trim() : '';
        let mUrl = cell?.l?.Target ? String(cell.l.Target).trim() : '';
        if (!mUrl) {
          const match = mLink.match(/https?:\/\/[^\s\n\r]+/);
          if (match) mUrl = match[0];
        }
        const mChallenge = iteSheet[`${m.challengeCol}${r}`]?.v ? String(iteSheet[`${m.challengeCol}${r}`].v).trim() : '-';
        const mHomework = iteSheet[`${m.homeworkCol}${r}`]?.v ? String(iteSheet[`${m.homeworkCol}${r}`].v).trim() : '-';

        insertMonthly.run(
          goalId,
          m.monthNumber,
          m.monthName,
          mStatus,
          mLink,
          mUrl,
          mChallenge,
          mHomework
        );
      }
    }
  });

  runSeed();

  const count = (db.prepare(`SELECT COUNT(*) as c FROM goals`).get() as any).c;
  const monthCount = (db.prepare(`SELECT COUNT(*) as c FROM monthly_logs`).get() as any).c;
  const bigSixCount = (db.prepare(`SELECT COUNT(*) as c FROM big_six`).get() as any).c;

  return {
    goalsCount: count,
    monthlyLogsCount: monthCount,
    bigSixCount: bigSixCount,
  };
}
