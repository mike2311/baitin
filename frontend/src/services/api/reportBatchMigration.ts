import apiClient from './client';

/**
 * Report Batch Migration API Service
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Batch migration management
 *   - Progress tracking
 *   - Validation and performance testing
 *
 * Reference: Phase 3 - Reporting Batch Migration
 */

export interface MigrationProgress {
  batchId: string;
  totalBatches: number;
  completedBatches: number;
  totalReports: number;
  completedReports: number;
  failedReports: number;
  overallProgress: number;
}

export interface BatchMigrationStatus {
  batchId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalReports: number;
  completedReports: number;
  failedReports: number;
  startTime?: Date;
  endTime?: Date;
  reports: Array<{
    reportKey: string;
    status: string;
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
  }>;
}

export interface MigrateReportBatchDto {
  reportKeys: string[];
  batchId?: string;
  priority?: 'high' | 'medium' | 'low';
}

class ReportBatchMigrationApiService {
  /**
   * Get overall migration progress
   */
  static async getMigrationProgress(): Promise<MigrationProgress> {
    const response = await apiClient.get<MigrationProgress>('/reports/batch-migration/progress');
    return response.data;
  }

  /**
   * Migrate a batch of reports
   */
  static async migrateReportBatch(data: MigrateReportBatchDto): Promise<BatchMigrationStatus> {
    const response = await apiClient.post<BatchMigrationStatus>('/reports/batch-migration/migrate', data);
    return response.data;
  }

  /**
   * Create the next batch of reports to migrate
   */
  static async createNextBatch(priority: 'high' | 'medium' | 'low' = 'medium'): Promise<MigrateReportBatchDto> {
    const response = await apiClient.post<MigrateReportBatchDto>(`/reports/batch-migration/next-batch?priority=${priority}`);
    return response.data;
  }

  /**
   * Get list of pending reports
   */
  static async getPendingReports(limit: number = 50): Promise<string[]> {
    const response = await apiClient.get<string[]>(`/reports/batch-migration/pending-reports?limit=${limit}`);
    return response.data;
  }

  /**
   * Validate a single report
   */
  static async validateReport(reportKey: string): Promise<{
    reportKey: string;
    sqlValid: boolean;
    parametersValid: boolean;
    dataConsistency: boolean;
    performanceAcceptable: boolean;
    errors: string[];
  }> {
    const response = await apiClient.post(`/reports/batch-migration/validate/${reportKey}`);
    return response.data;
  }

  /**
   * Run performance test on a single report
   */
  static async runPerformanceTest(reportKey: string): Promise<{
    reportKey: string;
    queryExecutionTime: number;
    dataProcessingTime: number;
    totalExecutionTime: number;
    rowCount: number;
    acceptable: boolean;
  }> {
    const response = await apiClient.post(`/reports/batch-migration/performance-test/${reportKey}`);
    return response.data;
  }
}

export default ReportBatchMigrationApiService;