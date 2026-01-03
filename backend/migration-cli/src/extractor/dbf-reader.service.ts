/**
 * DBF Reader Service
 * 
 * Reads Visual FoxPro DBF files with encoding conversion and streaming support.
 * 
 * Original Logic Reference:
 * - Legacy Format: Visual FoxPro DBF files
 * - Documentation: docs/modernization-strategy/04-data-migration-strategy/data-migration-strategy.md
 */

import { logger } from '../utils/logger.util.js';
import iconv from 'iconv-lite';
import { DBFFile } from 'dbffile';

/**
 * DBF field type mapping (for reference, not currently used)
 */
// const DBF_FIELD_TYPES: Record<string, string> = {
//   'C': 'string',    // Character
//   'N': 'number',    // Numeric
//   'D': 'date',      // Date
//   'L': 'boolean',   // Logical (.T./.F.)
//   'M': 'memo',      // Memo (stored in FPT)
//   'F': 'number',    // Float
//   'I': 'number',    // Integer
//   'T': 'timestamp', // DateTime
// };

/**
 * Read DBF file and return records
 */
export class DbfReaderService {
  /**
   * Read DBF file header and return metadata
   */
  async readHeader(dbfPath: string): Promise<{
    fieldCount: number;
    recordCount: number;
    recordLength: number;
    fields: Array<{
      name: string;
      type: string;
      length: number;
      decimals: number;
    }>;
  }> {
    logger.info(`Reading DBF header from ${dbfPath}`);
    
    try {
      const dbf = await DBFFile.open(dbfPath);
      
      // DBFFile API: fields, recordCount are public
      // FieldDescriptor has: name, type (length/decimals may not be in public API)
      return {
        fieldCount: dbf.fields.length,
        recordCount: dbf.recordCount,
        recordLength: 0, // Not available in public API
        fields: dbf.fields.map(f => ({
          name: f.name,
          type: f.type,
          length: 0, // DBFFile doesn't expose field length in public API
          decimals: 0, // DBFFile doesn't expose decimals in public API
        })),
      };
    } catch (error: any) {
      logger.error(`Failed to read DBF header from ${dbfPath}:`, error);
      throw new Error(`DBF header read failed: ${error.message}`);
    }
  }

  /**
   * Read DBF file records with streaming support
   */
  async *readRecords(
    dbfPath: string,
    sourceEncoding: string = 'windows-1252'
  ): AsyncGenerator<Record<string, any>> {
    logger.info(`Reading DBF records from ${dbfPath} with encoding ${sourceEncoding}`);
    
    try {
      const dbf = await DBFFile.open(dbfPath);
      
      for await (const record of dbf) {
        const decodedRecord: Record<string, any> = {};
        
        for (const [field, value] of Object.entries(record)) {
          if (value === null || value === undefined) {
            decodedRecord[field] = null;
          } else if (typeof value === 'string') {
            // Decode string values from source encoding
            try {
              decodedRecord[field] = this.decodeString(value, sourceEncoding);
            } catch (error) {
              logger.warn(`Failed to decode field ${field}, using original value`);
              decodedRecord[field] = value;
            }
          } else if (value instanceof Date) {
            // Dates are already converted by dbffile
            decodedRecord[field] = value;
          } else {
            decodedRecord[field] = value;
          }
        }
        
        yield decodedRecord;
      }
    } catch (error: any) {
      logger.error(`Failed to read DBF records from ${dbfPath}:`, error);
      throw new Error(`DBF record read failed: ${error.message}`);
    }
  }

  /**
   * Convert FoxPro date to JavaScript Date
   */
  convertFoxProDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    // FoxPro dates are stored as YYYYMMDD strings or numbers
    if (typeof dateValue === 'string' && dateValue.length === 8) {
      const year = parseInt(dateValue.substring(0, 4), 10);
      const month = parseInt(dateValue.substring(4, 6), 10) - 1; // JavaScript months are 0-indexed
      const day = parseInt(dateValue.substring(6, 8), 10);
      return new Date(year, month, day);
    }
    
    if (typeof dateValue === 'number' && dateValue > 0) {
      const dateStr = dateValue.toString().padStart(8, '0');
      return this.convertFoxProDate(dateStr);
    }
    
    return null;
  }

  /**
   * Convert FoxPro logical (.T./.F.) to boolean
   */
  convertFoxProLogical(value: any): boolean | null {
    if (value === null || value === undefined) return null;
    
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const upper = value.trim().toUpperCase();
      return upper === '.T.' || upper === 'T' || upper === 'TRUE';
    }
    
    return false;
  }

  /**
   * Decode string value from source encoding to UTF-8
   */
  decodeString(value: string, sourceEncoding: string = 'windows-1252'): string {
    if (!value) return value;
    
    try {
      return iconv.decode(Buffer.from(value, 'binary'), sourceEncoding);
    } catch (error) {
      logger.warn(`Failed to decode string, using original value: ${error}`);
      return value;
    }
  }
}

