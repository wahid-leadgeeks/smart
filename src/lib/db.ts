import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Goal, MonthlyLog, BigSixObjective } from './types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'smart_goals.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      row_number INTEGER,
      function TEXT NOT NULL,
      title TEXT NOT NULL,
      specific_statement TEXT,
      action_plan TEXT,
      target TEXT,
      the_way TEXT,
      goal_type TEXT,
      owner TEXT,
      pic TEXT,
      collaborators TEXT,
      collaboration_flag TEXT,
      type TEXT,
      period TEXT,
      complexity TEXT,
      frequency TEXT,
      execution_period TEXT,
      strengths TEXT,
      weaknesses TEXT,
      opportunities TEXT,
      threats TEXT,
      budget_available TEXT,
      hr_available TEXT,
      time_available TEXT,
      tech_available TEXT,
      resource_plan TEXT,
      company_focus_ref TEXT,
      start_date TEXT,
      end_date TEXT,
      day_counter TEXT,
      status TEXT NOT NULL,
      accomplishment_status TEXT,
      half_adjustment TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS monthly_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      month_number INTEGER NOT NULL,
      month_name TEXT NOT NULL,
      achievement_status TEXT DEFAULT 'Not started',
      result_link TEXT DEFAULT '',
      result_url TEXT DEFAULT '',
      challenge TEXT DEFAULT '',
      homework TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS big_six (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      objective_number INTEGER,
      title TEXT NOT NULL,
      status_quo TEXT,
      strategic_objective TEXT,
      focus_area TEXT,
      pic TEXT,
      focus_category TEXT,
      company_focus TEXT,
      company_priority TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_monthly_logs_goal ON monthly_logs (goal_id);
    CREATE INDEX IF NOT EXISTS idx_monthly_logs_month ON monthly_logs (month_number);
    CREATE INDEX IF NOT EXISTS idx_goals_function ON goals (function);
    CREATE INDEX IF NOT EXISTS idx_goals_status ON goals (status);
  `);

  try {
    db.prepare(`ALTER TABLE monthly_logs ADD COLUMN result_url TEXT`).run();
  } catch {}
  try {
    db.prepare(`ALTER TABLE big_six ADD COLUMN company_focus TEXT`).run();
  } catch {}
  try {
    db.prepare(`ALTER TABLE big_six ADD COLUMN company_priority TEXT`).run();
  } catch {}

  dbInstance = db;
  return dbInstance;
}

export function getAllGoals(filters?: {
  function?: string;
  status?: string;
  goalType?: string;
  search?: string;
}): Goal[] {
  const db = getDb();
  let query = `SELECT * FROM goals WHERE 1=1`;
  const params: any[] = [];

  if (filters?.function && filters.function !== 'All') {
    query += ` AND function = ?`;
    params.push(filters.function);
  }

  if (filters?.status && filters.status !== 'All') {
    query += ` AND status = ?`;
    params.push(filters.status);
  }

  if (filters?.goalType && filters.goalType !== 'All') {
    query += ` AND goal_type = ?`;
    params.push(filters.goalType);
  }

  if (filters?.search && filters.search.trim() !== '') {
    query += ` AND (title LIKE ? OR specific_statement LIKE ? OR target LIKE ? OR action_plan LIKE ?)`;
    const s = `%${filters.search.trim()}%`;
    params.push(s, s, s, s);
  }

  query += ` ORDER BY id ASC`;

  const rows = db.prepare(query).all(...params) as Goal[];

  // Also attach monthly logs summary to each goal
  const logsStmt = db.prepare(`SELECT * FROM monthly_logs WHERE goal_id = ? ORDER BY month_number ASC`);
  return rows.map((goal) => ({
    ...goal,
    monthly_logs: logsStmt.all(goal.id) as MonthlyLog[],
  }));
}

export function getGoalById(id: number): Goal | null {
  const db = getDb();
  let goal = db.prepare(`SELECT * FROM goals WHERE id = ?`).get(id) as Goal | undefined;
  if (!goal) {
    goal = db.prepare(`SELECT * FROM goals WHERE row_number = ? OR row_number = ?`).get(id, id + 2) as Goal | undefined;
  }
  if (!goal) return null;

  const logs = db.prepare(`SELECT * FROM monthly_logs WHERE goal_id = ? ORDER BY month_number ASC`).all(goal.id) as MonthlyLog[];
  return {
    ...goal,
    monthly_logs: logs,
  };
}

export function updateGoal(id: number, data: Partial<Goal>): Goal | null {
  const db = getDb();
  const allowedFields = [
    'title', 'function', 'specific_statement', 'action_plan', 'target', 'the_way',
    'goal_type', 'owner', 'pic', 'collaborators', 'collaboration_flag', 'type',
    'period', 'complexity', 'frequency', 'execution_period', 'strengths',
    'weaknesses', 'opportunities', 'threats', 'budget_available', 'hr_available',
    'time_available', 'tech_available', 'resource_plan', 'company_focus_ref',
    'start_date', 'end_date', 'day_counter', 'status', 'accomplishment_status',
    'half_adjustment', 'notes'
  ];

  const updates: string[] = [];
  const params: any[] = [];

  for (const field of allowedFields) {
    if (field in data) {
      updates.push(`${field} = ?`);
      params.push((data as any)[field]);
    }
  }

  if (updates.length > 0) {
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const sql = `UPDATE goals SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...params);
  }

  return getGoalById(id);
}

export function updateMonthlyLog(id: number, data: Partial<MonthlyLog>): MonthlyLog | null {
  const db = getDb();
  const updates: string[] = [];
  const params: any[] = [];

  const allowedFields = ['achievement_status', 'result_link', 'result_url', 'challenge', 'homework'];
  for (const field of allowedFields) {
    if (field in data) {
      updates.push(`${field} = ?`);
      params.push((data as any)[field]);
    }
  }

  if (updates.length > 0) {
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const sql = `UPDATE monthly_logs SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...params);
  }

  return db.prepare(`SELECT * FROM monthly_logs WHERE id = ?`).get(id) as MonthlyLog | null;
}

export function getMonthlyGrid(monthNumber: number) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT 
      g.id as goal_id,
      g.title as goal_title,
      g.function as goal_function,
      g.status as goal_status,
      g.pic as goal_pic,
      g.start_date,
      g.end_date,
      m.id as log_id,
      m.month_number,
      m.month_name,
      m.achievement_status,
      m.result_link,
      m.result_url,
      m.challenge,
      m.homework,
      m.updated_at
    FROM goals g
    LEFT JOIN monthly_logs m ON g.id = m.goal_id AND m.month_number = ?
    ORDER BY g.id ASC
  `).all(monthNumber);

  return rows;
}

export function getBigSix(): BigSixObjective[] {
  const db = getDb();
  return db.prepare(`SELECT * FROM big_six ORDER BY objective_number ASC`).all() as BigSixObjective[];
}
