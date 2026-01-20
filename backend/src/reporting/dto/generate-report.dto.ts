import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

/**
 * Generate Report DTO
 *
 * Original Logic Reference:
 * - Legacy Reports: Various .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Report key identifies which report to generate
 *   - Parameters vary by report type
 *   - Output format selection
 *
 * Reference: Phase 3 - Reporting Module
 */
export class GenerateReportDto {
  @IsNotEmpty({ message: 'Report key is required' })
  @IsString()
  reportKey: string; // Report identifier

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>; // Report-specific parameters

  @IsOptional()
  @IsString()
  outputFormat?: 'pdf' | 'excel' | 'html'; // Output format

  @IsOptional()
  @IsString()
  fileName?: string; // Custom file name
}

/**
 * Report Parameter Definition
 *
 * Defines available parameters for a report
 */
export class ReportParameterDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: Array<{ value: any; label: string }>; // For select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}
