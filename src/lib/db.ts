import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';
import { Goal, MonthlyLog, BigSixObjective } from './types';

export interface DatabaseClient {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[] }>;
  exec(sql: string): Promise<void>;
  transaction<T>(
    fn: (tx: {
      query<R = any>(sql: string, params?: any[]): Promise<{ rows: R[] }>;
      exec(sql: string): Promise<void>;
    }) => Promise<T>
  ): Promise<T>;
}

class PostgresDbClient implements DatabaseClient {
  constructor(private pool: Pool) {}

  async query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[] }> {
    const res = await this.pool.query(sql, params);
    return { rows: res.rows };
  }

  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }

  async transaction<T>(
    fn: (tx: {
      query<R = any>(sql: string, params?: any[]): Promise<{ rows: R[] }>;
      exec(sql: string): Promise<void>;
    }) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const tx = {
        query: async <R = any>(sql: string, params?: any[]) => {
          const res = await client.query(sql, params);
          return { rows: res.rows };
        },
        exec: async (sql: string) => {
          await client.query(sql);
        },
      };
      const result = await fn(tx);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

class PGliteDbClient implements DatabaseClient {
  constructor(private db: PGlite) {}

  async query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[] }> {
    const res = await this.db.query<T>(sql, params);
    return { rows: res.rows };
  }

  async exec(sql: string): Promise<void> {
    await this.db.exec(sql);
  }

  async transaction<T>(
    fn: (tx: {
      query<R = any>(sql: string, params?: any[]): Promise<{ rows: R[] }>;
      exec(sql: string): Promise<void>;
    }) => Promise<T>
  ): Promise<T> {
    return this.db.transaction(fn as any);
  }
}

// Check if running in a serverless cloud environment (Vercel, AWS Lambda) where process.cwd() is read-only
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.VERCEL_ENV
);

// In Vercel serverless environment, /var/task is read-only.
// /tmp is the writable storage directory allocated for the serverless function.
const DB_DIR = isServerless
  ? path.join('/tmp', 'smart_leadgeeks_data')
  : path.join(process.cwd(), 'data');
const PG_DATA_DIR = path.join(DB_DIR, 'pgdata');

// Preserve singleton across Next.js dev server hot-reloads
const globalForDb = globalThis as unknown as {
  dbClient: DatabaseClient | undefined;
  dbPromise: Promise<DatabaseClient> | undefined;
};

async function initSchema(db: DatabaseClient): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS monthly_logs (
      id SERIAL PRIMARY KEY,
      goal_id INTEGER NOT NULL REFERENCES goals (id) ON DELETE CASCADE,
      month_number INTEGER NOT NULL,
      month_name TEXT NOT NULL,
      achievement_status TEXT DEFAULT 'Not started',
      result_link TEXT DEFAULT '',
      result_url TEXT DEFAULT '',
      challenge TEXT DEFAULT '',
      homework TEXT DEFAULT '',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS big_six (
      id SERIAL PRIMARY KEY,
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
}

export async function getDb(): Promise<DatabaseClient> {
  if (globalForDb.dbClient) {
    return globalForDb.dbClient;
  }

  if (!globalForDb.dbPromise) {
    globalForDb.dbPromise = (async () => {
      const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

      let client: DatabaseClient;

      if (rawDbUrl?.trim()) {
        // Use Remote PostgreSQL (Aiven / Neon / Supabase / Vercel Postgres)
        const cleanDbUrl = rawDbUrl.trim().replace(/[?&]sslmode=[^&]+/, '');
        const pool = new Pool({
          connectionString: cleanDbUrl,
          ssl: {
            rejectUnauthorized: false,
          },
          max: 10,
          idleTimeoutMillis: 30000,
        });
        client = new PostgresDbClient(pool);
      } else {
        // Fallback to local / serverless PGlite
        if (!fs.existsSync(DB_DIR)) {
          fs.mkdirSync(DB_DIR, { recursive: true });
        }
        const pglite = new PGlite(PG_DATA_DIR);
        await pglite.waitReady;
        client = new PGliteDbClient(pglite);
      }

      await initSchema(client);
      globalForDb.dbClient = client;
      return client;
    })();
  }

  return globalForDb.dbPromise;
}

let isSeeding = false;
export async function ensureSeeded(): Promise<void> {
  if (isSeeding) return;
  const db = await getDb();
  try {
    const countRes = await db.query('SELECT COUNT(*) as count FROM goals');
    const count = Number(countRes.rows[0]?.count || 0);
    if (count === 0) {
      isSeeding = true;
      const { seedDatabaseFromExcel } = await import('./excel-parser');
      await seedDatabaseFromExcel();
    }
  } catch (err) {
    console.warn('Auto-seed check warning:', err);
  } finally {
    isSeeding = false;
  }
}

export async function getAllGoals(filters?: {
  function?: string;
  status?: string;
  goalType?: string;
  search?: string;
}): Promise<Goal[]> {
  await ensureSeeded();
  const db = await getDb();
  let query = `SELECT * FROM goals WHERE 1=1`;
  const params: any[] = [];

  if (filters?.function && filters.function !== 'All') {
    params.push(filters.function);
    query += ` AND function = $${params.length}`;
  }

  if (filters?.status && filters.status !== 'All') {
    params.push(filters.status);
    query += ` AND status = $${params.length}`;
  }

  if (filters?.goalType && filters.goalType !== 'All') {
    params.push(filters.goalType);
    query += ` AND goal_type = $${params.length}`;
  }

  if (filters?.search && filters.search.trim() !== '') {
    const s = `%${filters.search.trim()}%`;
    params.push(s);
    const pIndex = params.length;
    query += ` AND (title ILIKE $${pIndex} OR specific_statement ILIKE $${pIndex} OR target ILIKE $${pIndex} OR action_plan ILIKE $${pIndex})`;
  }

  query += ` ORDER BY id ASC`;

  const goalsRes = await db.query<Goal>(query, params);
  const rows = goalsRes.rows;

  if (rows.length === 0) return [];

  // Fetch all monthly logs in a single query
  const goalIds = rows.map((g) => g.id);
  const logsRes = await db.query<MonthlyLog>(
    `SELECT * FROM monthly_logs WHERE goal_id = ANY($1) ORDER BY month_number ASC`,
    [goalIds]
  );

  const logsByGoalId = new Map<number, MonthlyLog[]>();
  for (const log of logsRes.rows) {
    const list = logsByGoalId.get(log.goal_id) || [];
    list.push(log);
    logsByGoalId.set(log.goal_id, list);
  }

  return rows.map((goal) => ({
    ...goal,
    created_at: goal.created_at ? new Date(goal.created_at).toISOString() : undefined,
    updated_at: goal.updated_at ? new Date(goal.updated_at).toISOString() : undefined,
    monthly_logs: (logsByGoalId.get(goal.id) || []).map((l) => ({
      ...l,
      updated_at: l.updated_at ? new Date(l.updated_at).toISOString() : undefined,
    })),
  }));
}

export async function getGoalById(id: number): Promise<Goal | null> {
  const db = await getDb();
  let res = await db.query<Goal>(`SELECT * FROM goals WHERE id = $1`, [id]);
  let goal = res.rows[0];

  if (!goal) {
    res = await db.query<Goal>(
      `SELECT * FROM goals WHERE row_number = $1 OR row_number = $2`,
      [id, id + 2]
    );
    goal = res.rows[0];
  }
  if (!goal) return null;

  const logsRes = await db.query<MonthlyLog>(
    `SELECT * FROM monthly_logs WHERE goal_id = $1 ORDER BY month_number ASC`,
    [goal.id]
  );

  return {
    ...goal,
    created_at: goal.created_at ? new Date(goal.created_at).toISOString() : undefined,
    updated_at: goal.updated_at ? new Date(goal.updated_at).toISOString() : undefined,
    monthly_logs: logsRes.rows.map((l) => ({
      ...l,
      updated_at: l.updated_at ? new Date(l.updated_at).toISOString() : undefined,
    })),
  };
}

export async function updateGoal(id: number, data: Partial<Goal>): Promise<Goal | null> {
  const db = await getDb();
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
      params.push((data as any)[field]);
      updates.push(`${field} = $${params.length}`);
    }
  }

  if (updates.length > 0) {
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const sql = `UPDATE goals SET ${updates.join(', ')} WHERE id = $${params.length}`;
    await db.query(sql, params);
  }

  return getGoalById(id);
}

export async function updateMonthlyLog(id: number, data: Partial<MonthlyLog>): Promise<MonthlyLog | null> {
  const db = await getDb();
  const updates: string[] = [];
  const params: any[] = [];

  const allowedFields = ['achievement_status', 'result_link', 'result_url', 'challenge', 'homework'];
  for (const field of allowedFields) {
    if (field in data) {
      params.push((data as any)[field]);
      updates.push(`${field} = $${params.length}`);
    }
  }

  if (updates.length > 0) {
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const sql = `UPDATE monthly_logs SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`;
    const res = await db.query<MonthlyLog>(sql, params);
    const log = res.rows[0];
    if (!log) return null;
    return {
      ...log,
      updated_at: log.updated_at ? new Date(log.updated_at).toISOString() : undefined,
    };
  }

  const res = await db.query<MonthlyLog>(`SELECT * FROM monthly_logs WHERE id = $1`, [id]);
  const log = res.rows[0];
  if (!log) return null;
  return {
    ...log,
    updated_at: log.updated_at ? new Date(log.updated_at).toISOString() : undefined,
  };
}

export async function getMonthlyGrid(monthNumber: number) {
  const db = await getDb();
  const res = await db.query(`
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
    LEFT JOIN monthly_logs m ON g.id = m.goal_id AND m.month_number = $1
    ORDER BY g.id ASC
  `, [monthNumber]);

  return res.rows.map((r: any) => ({
    ...r,
    updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  }));
}

export async function getBigSix(): Promise<BigSixObjective[]> {
  const db = await getDb();
  const res = await db.query<BigSixObjective>(`SELECT * FROM big_six ORDER BY objective_number ASC`);
  return res.rows;
}
