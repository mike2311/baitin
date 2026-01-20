import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { ReportBatchMigrationService } from './report-batch-migration.service';
import { ReportBatchMigrationController } from './report-batch-migration.controller';
import { ReportSeederService } from './report-seeder.service';
import { ReportDefinition } from './entities/report-definition.entity';

/**
 * Reporting Module
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/03-application-modules/module-inventory.md
 * - Business Rules:
 *   - Complete reporting module
 *   - Report generation and export
 *   - Preview functionality
 *
 * Reference: Phase 3 - Reporting Module
 */
@Module({
  imports: [TypeOrmModule.forFeature([ReportDefinition])],
  controllers: [ReportingController, ReportBatchMigrationController],
  providers: [
    ReportingService,
    ReportBatchMigrationService,
    ReportSeederService,
  ],
  exports: [ReportingService], // Export for use in other modules
})
export class ReportingModule {}
