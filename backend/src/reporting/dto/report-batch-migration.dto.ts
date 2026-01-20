import { IsNotEmpty, IsOptional, IsArray, IsString, IsNumber } from 'class-validator';

/**
 * Report Batch Migration DTOs
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Batch migration of reports
 *   - Validation and performance checks
 *   - Progress tracking
 *
 * Reference: Phase 3 - Reporting Batch Migration
 */

export enum MigrationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  VALIDATED = 'validated',
}

export class MigrateReportBatchDto {
  @IsNotEmpty({ message: 'Report keys are required' })
  @IsArray()
  @IsString({ each: true })
  reportKeys: string[]; // Report keys to migrate in this batch

  @IsOptional()
  @IsString()
  batchId?: string; // Optional batch identifier

  @IsOptional()
  @IsString()
  priority?: 'high' | 'medium' | 'low'; // Migration priority
}

export class ReportMigrationStatusDto {
  reportKey: string;
  status: MigrationStatus;
  errorMessage?: string;
  performanceMetrics?: {
    queryExecutionTime: number;
    dataProcessingTime: number;
    totalExecutionTime: number;
    rowCount: number;
  };
  validationResults?: {
    sqlValid: boolean;
    parametersValid: boolean;
    dataConsistency: boolean;
    performanceAcceptable: boolean;
  };
  migratedAt?: Date;
  validatedAt?: Date;
}

export class BatchMigrationStatusDto {
  batchId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalReports: number;
  completedReports: number;
  failedReports: number;
  startTime?: Date;
  endTime?: Date;
  reports: ReportMigrationStatusDto[];
}

export class ReportValidationDto {
  @IsNotEmpty({ message: 'Report key is required' })
  @IsString()
  reportKey: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testParameters?: string[]; // Parameter combinations to test
}

export class ReportPerformanceTestDto {
  @IsNotEmpty({ message: 'Report key is required' })
  @IsString()
  reportKey: string;

  @IsOptional()
  @IsNumber()
  maxExecutionTime?: number; // Max acceptable execution time in ms

  @IsOptional()
  @IsNumber()
  maxRowCount?: number; // Max acceptable row count for testing
}

export class BatchMigrationProgressDto {
  batchId: string;
  totalBatches: number;
  completedBatches: number;
  totalReports: number;
  completedReports: number;
  failedReports: number;
  currentBatch?: {
    batchNumber: number;
    totalInBatch: number;
    completedInBatch: number;
    failedInBatch: number;
  };
  estimatedTimeRemaining?: number; // in seconds
  overallProgress: number; // percentage
}