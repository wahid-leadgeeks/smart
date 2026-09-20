import fs from 'fs';
import path from 'path';

// Automatically load .env.local if present
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  if (typeof (process as any).loadEnvFile === 'function') {
    (process as any).loadEnvFile(envLocalPath);
  }
}

import { seedDatabaseFromExcel } from '../src/lib/excel-parser';

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const targetLabel = dbUrl ? 'remote PostgreSQL (Aiven)' : 'local PGlite';
  console.log(`🌱 Starting database seeding from Excel to ${targetLabel}...`);
  try {
    const result = await seedDatabaseFromExcel();
    console.log('✅ Seeding completed successfully!');
    console.log(`📊 Statistics:`);
    console.log(`   - Goals imported: ${result.goalsCount}`);
    console.log(`   - Monthly log entries: ${result.monthlyLogsCount}`);
    console.log(`   - The BIG Six strategic entries: ${result.bigSixCount}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
