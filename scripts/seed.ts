import { seedDatabaseFromExcel } from '../src/lib/excel-parser';

async function main() {
  console.log('🌱 Starting PGlite database seeding from Excel...');
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
