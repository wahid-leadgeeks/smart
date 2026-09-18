import { seedDatabaseFromExcel } from '../src/lib/excel-parser';

console.log('🌱 Starting database seeding from Excel...');
try {
  const result = seedDatabaseFromExcel();
  console.log('✅ Seeding completed successfully!');
  console.log(`📊 Statistics:`);
  console.log(`   - Goals imported: ${result.goalsCount}`);
  console.log(`   - Monthly log entries: ${result.monthlyLogsCount}`);
  console.log(`   - The BIG Six strategic entries: ${result.bigSixCount}`);
} catch (error) {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
}
