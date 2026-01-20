import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReportDefinition } from './entities/report-definition.entity';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportDefinitionDto, ReportPreviewResponseDto, ReportGenerationResponseDto } from './dto/report-response.dto';
// Note: ExcelJS and PDFKit will be added as dependencies
// For now, using basic implementations
// import * as ExcelJS from 'exceljs';
// import * as PDFDocument from 'pdfkit';

/**
 * Reporting Service
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Generate reports from SQL queries
 *   - Support PDF and Excel export
 *   - Parameterized report generation
 *   - Preview functionality
 *
 * Reference: Phase 3 - Reporting Module
 */
@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(ReportDefinition)
    private readonly reportDefinitionRepository: Repository<ReportDefinition>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get all report definitions
   */
  async getAllReports(): Promise<ReportDefinitionDto[]> {
    const reports = await this.reportDefinitionRepository.find({
      where: { status: 'Active' },
      order: { category: 'ASC', reportName: 'ASC' },
    });

    return reports.map(report => ({
      reportKey: report.reportKey,
      reportName: report.reportName,
      category: report.category,
      description: report.description,
      parameters: report.parameters,
      status: report.status,
      legacyReportFile: report.legacyReportFile,
    }));
  }

  /**
   * Get report definition by key
   */
  async getReportDefinition(reportKey: string): Promise<ReportDefinition> {
    const report = await this.reportDefinitionRepository.findOne({
      where: { reportKey },
    });

    if (!report) {
      throw new NotFoundException(`Report ${reportKey} not found`);
    }

    return report;
  }

  /**
   * Preview report data
   *
   * Returns preview data without generating file
   */
  async previewReport(generateDto: GenerateReportDto): Promise<ReportPreviewResponseDto> {
    const report = await this.getReportDefinition(generateDto.reportKey);

    // Execute SQL query with parameters
    const query = this.buildQuery(report.sqlQuery, generateDto.parameters || {});
    const results = await this.dataSource.query(query.query, query.parameters);

    // Extract column information from first row
    const columns = results.length > 0
      ? Object.keys(results[0]).map(key => ({
          name: key,
          label: this.formatColumnLabel(key),
          type: this.inferColumnType(results[0][key]),
        }))
      : [];

    // Limit preview to 100 rows
    const previewData = results.slice(0, 100);

    return {
      reportKey: report.reportKey,
      reportName: report.reportName,
      columns,
      data: previewData,
      totalRows: results.length,
    };
  }

  /**
   * Generate report file
   *
   * Original Logic Reference:
   * - Legacy Reports: REPORT FORM ... TO FILE/PRINTER
   * - Business Rules:
   *   - Generate PDF or Excel file
   *   - Apply formatting from report definition
   */
  async generateReport(generateDto: GenerateReportDto): Promise<ReportGenerationResponseDto> {
    const report = await this.getReportDefinition(generateDto.reportKey);
    const format = generateDto.outputFormat || 'pdf';

    // Execute SQL query
    const query = this.buildQuery(report.sqlQuery, generateDto.parameters || {});
    const results = await this.dataSource.query(query.query, query.parameters);

    if (results.length === 0) {
      throw new BadRequestException('No data found for report generation');
    }

    // Generate file based on format
    let fileName: string;
    let fileBuffer: Buffer;

    if (format === 'excel') {
      const excelData = await this.generateExcel(report, results);
      fileName = generateDto.fileName || `${report.reportKey}_${new Date().toISOString().split('T')[0]}.xlsx`;
      fileBuffer = excelData;
    } else if (format === 'pdf') {
      const pdfData = await this.generatePdf(report, results);
      fileName = generateDto.fileName || `${report.reportKey}_${new Date().toISOString().split('T')[0]}.pdf`;
      fileBuffer = pdfData;
    } else {
      throw new BadRequestException(`Unsupported output format: ${format}`);
    }

    // TODO: Save file to storage and return URL
    // For now, return file info (actual file saving will be implemented with storage service)

    return {
      reportKey: report.reportKey,
      reportName: report.reportName,
      fileName,
      fileSize: fileBuffer.length,
      format: format as 'pdf' | 'excel' | 'html',
      generatedAt: new Date(),
      parameters: generateDto.parameters,
    };
  }

  /**
   * Generate Excel file
   *
   * Original Logic Reference:
   * - Legacy Reports: Excel export functionality
   * - Business Rules:
   *   - Format columns appropriately
   *   - Apply styling
   *   - Include headers
   * 
   * Note: Using xlsx library (already in dependencies) for Excel generation
   */
  private async generateExcel(report: ReportDefinition, data: any[]): Promise<Buffer> {
    // Using xlsx library (already in package.json)
    const XLSX = require('xlsx');
    
    if (data.length === 0) {
      const workbook = XLSX.utils.book_new();
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    // Prepare worksheet data
    const headers = Object.keys(data[0]);
    const worksheetData = [
      headers.map(h => this.formatColumnLabel(h)), // Header row
      ...data.map(row => headers.map(header => row[header] || '')), // Data rows
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, report.reportName);

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Generate PDF file
   *
   * Original Logic Reference:
   * - Legacy Reports: REPORT FORM ... TO FILE
   * - Business Rules:
   *   - Format for printing
   *   - Include headers and data
   * 
   * Note: PDF generation will use a PDF library when added
   * For now, returning a simple text-based representation
   */
  private async generatePdf(report: ReportDefinition, data: any[]): Promise<Buffer> {
    // TODO: Implement proper PDF generation with pdfkit or similar library
    // For now, return a simple text representation
    let pdfContent = `Report: ${report.reportName}\n`;
    pdfContent += `Generated: ${new Date().toISOString()}\n\n`;

    if (data.length === 0) {
      pdfContent += 'No data available\n';
      return Buffer.from(pdfContent);
    }

    // Add headers
    const headers = Object.keys(data[0]);
    pdfContent += headers.map(h => this.formatColumnLabel(h)).join(' | ') + '\n';
    pdfContent += '-'.repeat(80) + '\n';

    // Add data rows (limit to prevent huge PDFs)
    const maxRows = 1000;
    const rowsToShow = data.slice(0, maxRows);
    
    rowsToShow.forEach(row => {
      const rowText = headers.map(h => {
        const value = row[h];
        return value !== null && value !== undefined ? String(value) : '';
      }).join(' | ');
      pdfContent += rowText + '\n';
    });

    if (data.length > maxRows) {
      pdfContent += `\n(Showing first ${maxRows} of ${data.length} rows)\n`;
    }

    return Buffer.from(pdfContent);
  }

  /**
   * Build SQL query with parameters
   */
  private buildQuery(sqlTemplate: string, parameters: Record<string, any>): { query: string; parameters: any[] } {
    let query = sqlTemplate;
    const paramArray: any[] = [];
    let paramIndex = 1;

    // Replace parameter placeholders
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `:${key}`;
      if (query.includes(placeholder)) {
        query = query.replace(new RegExp(`:${key}`, 'g'), `$${paramIndex++}`);
        paramArray.push(value);
      }
    }

    return { query, parameters: paramArray };
  }

  /**
   * Format column label
   */
  private formatColumnLabel(columnName: string): string {
    return columnName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Infer column type from value
   */
  private inferColumnType(value: any): string {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'integer' : 'decimal';
    }
    if (value instanceof Date) return 'date';
    if (typeof value === 'boolean') return 'boolean';
    return 'string';
  }
}