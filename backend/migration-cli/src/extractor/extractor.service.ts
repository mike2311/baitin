/**
 * Extractor Service
 * 
 * Orchestrates DBF + FPT reading and outputs data to CSV/JSONL format.
 * 
 * Original Logic Reference:
 * - Documentation: docs/planning/poc_planning/01.5-phase-1-data-migration/task-01-02-legacy-extract.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { DbfReaderService } from './dbf-reader.service.js';
import { FptReaderService } from './fpt-reader.service.js';
import { TableMapping, FieldMapping } from '../models/table-mapping.interface.js';
import { ExtractionResult } from '../models/extraction-result.interface.js';
import { logger } from '../utils/logger.util.js';
import { createHash } from 'crypto';

/**
 * Extractor service for legacy DBF/FPT files
 */
export class ExtractorService {
  private dbfReader: DbfReaderService;
  private fptReader: FptReaderService;

  constructor() {
    this.dbfReader = new DbfReaderService();
    this.fptReader = new FptReaderService();
  }

  /**
   * Extract data from a single table
   */
  async extractTable(
    tableMapping: TableMapping,
    sourceDir: string,
    outputDir: string,
    encoding: string = 'windows-1252'
  ): Promise<ExtractionResult> {
    // Find DBF file (case-insensitive)
    const dbfFileName = this.findDbfFile(sourceDir, tableMapping.legacyTable);
    if (!dbfFileName) {
      throw new Error(`DBF file not found for table ${tableMapping.legacyTable} in ${sourceDir}`);
    }
    const dbfPath = path.join(sourceDir, dbfFileName);
    const fptPath = this.fptReader.getFptPath(dbfPath);
    const outputPath = path.join(outputDir, `${tableMapping.legacyTable}.csv`);
    const rejectionPath = path.join(outputDir, `${tableMapping.legacyTable}.rejected.csv`);

    logger.info(`Extracting table ${tableMapping.legacyTable} from ${dbfPath}`);

    // Get memo field names (for FPT file reading)
    const memoFields = Object.entries(tableMapping.fieldMappings)
      .filter(([_, mapping]) => mapping.source === 'fpt')
      .map(([field]) => field);

    // Read DBF records
    const records: Record<string, any>[] = [];
    const rejected: Record<string, any>[] = [];
    
    try {
      for await (const record of this.dbfReader.readRecords(dbfPath, encoding)) {
        try {
          const processedRecord: Record<string, any> = { ...record };
          
          // Map memo fields if FPT exists
          if (memoFields.length > 0 && fs.existsSync(fptPath)) {
            const header = this.fptReader.readHeader(fptPath);
            for (const memoField of memoFields) {
              const memoPointer = record[memoField];
              if (memoPointer && typeof memoPointer === 'number' && memoPointer > 0) {
                // Read memo content from FPT file
                const memoContent = this.fptReader.readMemoBlock(fptPath, memoPointer, header.blockSize, encoding);
                processedRecord[memoField] = memoContent;
              }
            }
          }
          
          records.push(processedRecord);
        } catch (error: any) {
          logger.warn(`Rejecting record due to error: ${error.message}`);
          rejected.push({ ...record, _error: String(error.message) });
        }
      }
    } catch (error: any) {
      logger.error(`Failed to extract table ${tableMapping.legacyTable}: ${error.message}`);
      throw error;
    }

    // Write to CSV
    const rowCount = records.length;
    if (rowCount > 0) {
      await this.writeCsv(outputPath, records, tableMapping.fieldMappings);
    }

    // Write rejected records
    const rejectedCount = rejected.length;
    if (rejectedCount > 0) {
      await this.writeCsv(rejectionPath, rejected);
      logger.warn(`Rejected ${rejectedCount} records for ${tableMapping.legacyTable}`);
    }

    // Calculate checksum
    const checksum = fs.existsSync(outputPath)
      ? this.calculateChecksum(outputPath)
      : undefined;

    return {
      table: tableMapping.legacyTable,
      rowCount,
      timestamp: new Date(),
      sourcePath: dbfPath,
      outputPath,
      checksum,
      rejectedCount,
      rejectionPath: rejectedCount > 0 ? rejectionPath : undefined,
    };
  }

  /**
   * Write records to CSV file
   */
  private async writeCsv(
    filePath: string,
    records: Record<string, any>[],
    fieldMappings?: Record<string, FieldMapping>
  ): Promise<void> {
    if (records.length === 0) return;

    const stream = createWriteStream(filePath, { encoding: 'utf-8' });
    
    // Write header - use mapping keys as CSV column names (these are the source DBF field names we expect)
    const firstRecord = records[0];
    const fieldNames = fieldMappings 
      ? Object.keys(fieldMappings).sort()
      : Object.keys(firstRecord).sort();
    
    stream.write(fieldNames.join(',') + '\n');

    // Create a case-insensitive field lookup map from actual record fields
    // This handles cases where DBF has uppercase field names but mapping uses lowercase
    const createFieldLookup = (record: Record<string, any>): Map<string, string> => {
      const lookup = new Map<string, string>();
      for (const actualField of Object.keys(record)) {
        // Store exact match
        lookup.set(actualField, actualField);
        // Store lowercase match for case-insensitive lookup
        lookup.set(actualField.toLowerCase(), actualField);
        // Store uppercase match
        lookup.set(actualField.toUpperCase(), actualField);
      }
      return lookup;
    };

    // Build lookup map from first record (all records should have same fields)
    const fieldLookup = createFieldLookup(firstRecord);

    // Write records
    for (const record of records) {
      const values = fieldNames.map(mappingFieldName => {
        // Try to find the actual field name in the DBF record
        // 1. Try exact match
        let actualField = record.hasOwnProperty(mappingFieldName) 
          ? mappingFieldName 
          : null;
        
        // 2. Try case-insensitive match via lookup
        if (!actualField) {
          actualField = fieldLookup.get(mappingFieldName.toLowerCase()) || 
                       fieldLookup.get(mappingFieldName.toUpperCase()) ||
                       null;
        }
        
        // 3. If still not found, try direct lookup (in case field names differ)
        if (!actualField && fieldMappings) {
          // Check if any actual field matches when case-insensitive
          for (const actualFieldName of Object.keys(record)) {
            if (actualFieldName.toLowerCase() === mappingFieldName.toLowerCase()) {
              actualField = actualFieldName;
              break;
            }
          }
        }
        
        // Get value from record using actual field name
        const value = actualField ? record[actualField] : undefined;
        
        if (value === null || value === undefined) return '';
        
        // Handle Date objects - export in appropriate format based on field mapping
        if (value instanceof Date && fieldMappings && fieldMappings[mappingFieldName]) {
          const mapping = fieldMappings[mappingFieldName];
          if (mapping.type === 'date') {
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, '0');
            const day = String(value.getDate()).padStart(2, '0');
            // Export as YYYYMMDD for FoxPro format, or YYYY-MM-DD for standard ISO
            if (mapping.format === 'foxpro') {
              return `${year}${month}${day}`;
            } else {
              return `${year}-${month}-${day}`;
            }
          }
        }
        
        if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          const escaped = value.replace(/"/g, '""');
          return value.includes(',') || value.includes('\n') || value.includes('"')
            ? `"${escaped}"`
            : escaped;
        }
        return String(value);
      });
      stream.write(values.join(',') + '\n');
    }

    stream.end();
    
    return new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  /**
   * Calculate file checksum
   */
  private calculateChecksum(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Find DBF file (case-insensitive)
   */
  private findDbfFile(sourceDir: string, tableName: string): string | null {
    const files = fs.readdirSync(sourceDir);
    const lowerTableName = tableName.toLowerCase();
    
    // Try exact match first
    const exactMatch = files.find(f => f.toLowerCase() === `${lowerTableName}.dbf`);
    if (exactMatch) return exactMatch;
    
    return null;
  }
}

