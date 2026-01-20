import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ReportSeederService } from './report-seeder.service';

/**
 * Report Seeder CLI Command
 *
 * Usage: npm run seed-reports
 *
 * This command seeds the report_definition table with all 116+ legacy reports
 * from the report inventory. Run this before starting batch migration.
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 *
 * Reference: Phase 3 - Reporting Batch Migration
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seederService = app.get(ReportSeederService);

  console.log('🚀 Starting report seeder...');

  try {
    // Seed report definitions
    await seederService.seedReportDefinitions();

    // Get final counts
    const counts = await seederService.getReportCount();
    console.log('✅ Report seeding completed successfully!');
    console.log(`📊 Total reports: ${counts.total}`);
    console.log(`📊 Active reports: ${counts.active}`);
    console.log(`📊 Migrated reports: ${counts.migrated}`);
  } catch (error) {
    console.error('❌ Report seeding failed:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

bootstrap();
