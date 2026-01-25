/**
 * Report Response DTOs
 *
 * Original Logic Reference:
 * - Legacy Reports: Various .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Report generation results
 *   - Preview data
 *   - Export file information
 *
 * Reference: Phase 3 - Reporting Module
 */

export class ReportDefinitionDto {
  reportKey: string;
  reportName: string;
  category?: string;
  description?: string;
  parameters?: any[];
  status: string;
  legacyReportFile?: string;
}

export class ReportPreviewResponseDto {
  reportKey: string;
  reportName: string;
  columns: Array<{
    name: string;
    label: string;
    type: string;
  }>;
  data: any[];
  totalRows: number;
  summary?: {
    totals?: Record<string, number>;
    counts?: Record<string, number>;
  };
}

export class ReportGenerationResponseDto {
  reportKey: string;
  reportName: string;
  fileName: string;
  fileUrl?: string; // URL to download generated report
  fileSize?: number;
  format: 'pdf' | 'excel' | 'html';
  generatedAt: Date;
  parameters?: Record<string, any>;
  fileBuffer?: Buffer; // File buffer for direct download (not serialized in JSON)
}
