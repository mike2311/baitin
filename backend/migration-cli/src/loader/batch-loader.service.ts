/**
 * Batch Loader Service
 * 
 * Uses PostgreSQL COPY command for bulk loading with transaction support.
 */

import { Pool, PoolClient } from 'pg';
import { TableMapping } from '../models/table-mapping.interface.js';
import { TransformerService } from './transformer.service.js';
import { logger } from '../utils/logger.util.js';
import { getDbColumnName } from '../utils/field-name.util.js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

/**
 * Batch loader for PostgreSQL COPY command
 */
export class BatchLoaderService {
  private transformer: TransformerService;

  constructor(_pool: Pool) {
    // Pool is not currently used, but kept for future COPY FROM STDIN implementation
    this.transformer = new TransformerService();
  }

  /**
   * Load data using PostgreSQL COPY command
   */
  async loadWithCopy(
    client: PoolClient,
    tableMapping: TableMapping,
    csvPath: string,
    truncate: boolean = false,
    csvDir?: string
  ): Promise<number> {
    const targetTable = tableMapping.targetTable;
    
    logger.info(`Loading ${targetTable} from ${csvPath}`);

    // Derive csvDir from csvPath if not provided
    const csvDirPath = csvDir || path.dirname(csvPath);

    try {
      // Truncate if requested
      if (truncate) {
        await client.query(`TRUNCATE TABLE "${targetTable}" CASCADE`);
        logger.info(`Truncated table ${targetTable}`);
      }

      // Read CSV file
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length <= 1) {
        logger.warn(`CSV file ${csvPath} has no data rows`);
        return 0;
      }

      // Parse CSV to records (these will have legacy field names from CSV headers)
      const legacyRecords = this.parseCsvToRecords(csvPath);
      
      // Generate line_no for moe (order_enquiry_detail) records
      // line_no is not in the DBF file - it must be generated as sequential numbers per oe_no
      if (tableMapping.legacyTable === 'moe') {
        this.generateLineNoForMoe(legacyRecords);
      }
      
      // Enrich records with lookup data if needed
      // For moehd: lookup cust_no from order_enquiry_detail using oe_no
      // (moehd.dbf doesn't have cust_no field, but moe.dbf does)
      if (tableMapping.legacyTable === 'moehd') {
        await this.enrichMoehdWithCustNo(client, legacyRecords, csvDirPath);
      }
      
      // Transform records from legacy field names to target field names
      // Skip rows where required fields are missing
      const transformedRecords: Record<string, any>[] = [];
      for (const legacyRecord of legacyRecords) {
        try {
          const transformed = this.transformer.transformRecord(legacyRecord, tableMapping);
          transformedRecords.push(transformed);
        } catch (error: any) {
          // Log warning and skip rows with missing required fields
          if (error.message && error.message.includes('Required field')) {
            logger.warn(`Skipping row with missing required field: ${error.message}`);
            continue;
          }
          // Re-throw other errors
          throw error;
        }
      }
      
      // Use batched INSERT with smaller batch size to avoid parameter limits
      // Using 50 rows per batch to be safe with large text fields (memo fields)
      const loadedCount = await this.loadWithInsert(client, tableMapping, transformedRecords, 50);
      
      logger.info(`Loaded ${loadedCount} rows into ${targetTable}`);
      return loadedCount;

    } catch (error) {
      logger.error(`Failed to load ${targetTable}:`, error);
      throw error;
    }
  }

  /**
   * Generate line_no for moe (order_enquiry_detail) records
   * line_no is not stored in the DBF - it must be generated as sequential numbers (1, 2, 3...)
   * for each group of records with the same oe_no
   * 
   * Original Logic Reference:
   * - DBF Structure: moe.DBF does not have line_no field
   * - Composite Key: order_enquiry_detail uses (oe_no, line_no) as unique key
   * - Business Rule: line_no represents the line item sequence within each OE
   */
  private generateLineNoForMoe(legacyRecords: Record<string, any>[]): void {
    logger.info(`Generating line_no for ${legacyRecords.length} moe records`);
    
    // Group records by oe_no
    const recordsByOeNo = new Map<string, Record<string, any>[]>();
    
    for (const record of legacyRecords) {
      const oeNo = (record['OE_NO'] || record['oe_no'])?.toString()?.trim();
      if (oeNo) {
        if (!recordsByOeNo.has(oeNo)) {
          recordsByOeNo.set(oeNo, []);
        }
        recordsByOeNo.get(oeNo)!.push(record);
      }
    }
    
    // Assign sequential line_no (1, 2, 3...) to each group
    let totalGenerated = 0;
    for (const [oeNo, records] of recordsByOeNo.entries()) {
      records.forEach((record, index) => {
        record['line_no'] = (index + 1).toString(); // Convert to string to match CSV format
        totalGenerated++;
      });
    }
    
    logger.info(`Generated line_no for ${totalGenerated} records across ${recordsByOeNo.size} unique oe_no values`);
  }

  /**
   * Enrich moehd records with cust_no from order_enquiry_detail
   * moehd.dbf does not have cust_no field - it must be looked up from moe (detail table)
   * Uses DISTINCT to get one cust_no per oe_no (all detail records for same oe_no should have same cust_no)
   */
  private async enrichMoehdWithCustNo(
    client: PoolClient,
    legacyRecords: Record<string, any>[],
    csvDir: string
  ): Promise<void> {
    logger.info(`Enriching ${legacyRecords.length} moehd records with cust_no from order_enquiry_detail`);
    
    // Build lookup map: oe_no -> cust_no from order_enquiry_detail (detail table)
    // Since detail table is loaded first, we can query it for cust_no
    // But if it's not loaded yet, we need to read from CSV or skip enrichment
    
    // First, try to get cust_no from already-loaded order_enquiry_detail table
    const oeNoSet = new Set<string>();
    for (const record of legacyRecords) {
      const oeNo = record['OE_NO'] || record['oe_no'];
      if (oeNo && typeof oeNo === 'string' && oeNo.trim()) {
        oeNoSet.add(oeNo.trim());
      }
    }
    
    if (oeNoSet.size === 0) {
      logger.warn('No valid oe_no values found in moehd records for enrichment');
      return;
    }
    
    // Query order_enquiry_detail for cust_no values (use DISTINCT in case there are multiple detail records per header)
    const oeNoArray = Array.from(oeNoSet);
    
    // If table doesn't exist yet, try reading from CSV file
    let custNoMap = new Map<string, string>();
    
    try {
      // Try querying the database first
      const placeholders = oeNoArray.map((_, i) => `$${i + 1}`).join(', ');
      const query = `SELECT DISTINCT oe_no, cust_no FROM order_enquiry_detail WHERE oe_no IN (${placeholders}) AND cust_no IS NOT NULL AND cust_no != ''`;
      const result = await client.query(query, oeNoArray);
      
      for (const row of result.rows) {
        if (row.oe_no && row.cust_no) {
          custNoMap.set(row.oe_no.trim(), row.cust_no);
        }
      }
      
      logger.info(`Loaded ${custNoMap.size} cust_no mappings from order_enquiry_detail table`);
    } catch (error: any) {
      // Table might not exist yet - will try reading from CSV file
      logger.info('order_enquiry_detail table query failed, will try CSV file');
    }
    
    // If no mappings found from database, try reading from CSV file
    if (custNoMap.size === 0) {
      logger.info('No mappings from database, trying to read from moe.csv file');
      const moeCsvPath = path.join(csvDir, 'moe.csv');
      if (fs.existsSync(moeCsvPath)) {
        try {
          const csvRecords = this.parseCsvToRecords(moeCsvPath);
          const detailCustNoMap = new Map<string, string>();
          
          for (const record of csvRecords) {
            const oeNo = (record['OE_NO'] || record['oe_no'])?.toString()?.trim();
            const custNo = (record['CUST_NO'] || record['cust_no'])?.toString()?.trim();
            if (oeNo && custNo && oeNoSet.has(oeNo)) {
              // Use first cust_no found for each oe_no
              if (!detailCustNoMap.has(oeNo)) {
                detailCustNoMap.set(oeNo, custNo);
              }
            }
          }
          
          custNoMap = detailCustNoMap;
          logger.info(`Loaded ${custNoMap.size} cust_no mappings from moe.csv file`);
        } catch (csvError: any) {
          logger.warn(`Failed to read from CSV: ${csvError.message}`);
        }
      } else {
        logger.warn(`moe.csv file not found at ${moeCsvPath}`);
      }
    }
    
    // Enrich legacy records with cust_no
    let enrichedCount = 0;
    let notFoundCount = 0;
    const notFoundOeNos = new Set<string>();
    
    for (const record of legacyRecords) {
      const oeNo = (record['OE_NO'] || record['oe_no'])?.toString()?.trim();
      if (oeNo) {
        if (custNoMap.has(oeNo)) {
          // Add cust_no to record (use lowercase to match field mapping expectations)
          record['cust_no'] = custNoMap.get(oeNo);
          enrichedCount++;
        } else {
          notFoundCount++;
          if (notFoundOeNos.size < 10) {
            notFoundOeNos.add(oeNo);
          }
        }
      }
    }
    
    logger.info(`Enriched ${enrichedCount} moehd records with cust_no`);
    if (notFoundCount > 0) {
      logger.warn(`Could not find cust_no for ${notFoundCount} moehd records (oe_no not in order_enquiry_detail)`);
      if (notFoundOeNos.size > 0) {
        logger.warn(`Sample oe_no values not found: ${Array.from(notFoundOeNos).slice(0, 5).join(', ')}`);
      }
    }
  }

  /**
   * Parse CSV file to records using csv-parse library
   * Handles multi-line quoted values correctly (e.g., memo fields)
   */
  private parseCsvToRecords(csvPath: string): Record<string, any>[] {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Use csv-parse to handle multi-line quoted values correctly
    const records = parse(csvContent, {
      columns: true, // Use first line as column headers
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
      cast: false, // Keep as strings, we'll transform in the transformer service
    });
    
    // Convert empty strings to null for consistency
    return records.map((record: Record<string, any>) => {
      const normalized: Record<string, any> = {};
      for (const [key, value] of Object.entries(record)) {
        normalized[key] = value === '' ? null : value;
      }
      return normalized;
    });
  }

  /**
   * Load data using batched INSERT statements (fallback)
   */
  async loadWithInsert(
    client: PoolClient,
    tableMapping: TableMapping,
    records: Record<string, any>[],
    batchSize: number = 50
  ): Promise<number> {
    const targetTable = tableMapping.targetTable;
    
    // Build column list using target field names converted to database column format (snake_case)
    // Use the utility function to ensure consistent conversion (handles camelCase, numbers, etc.)
    const fieldMappings = Object.entries(tableMapping.fieldMappings);
    const columns = fieldMappings
      .map(([, mapping]) => `"${getDbColumnName(mapping.target)}"`)
      .join(', ');

    logger.info(`Loading ${records.length} rows into ${targetTable} using INSERT (batch size: ${batchSize})`);

    let loaded = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Build parameterized query with placeholders
      const placeholders: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

        for (const record of batch) {
          const rowPlaceholders: string[] = [];
          for (const [, mapping] of fieldMappings) {
            const value = record[mapping.target]; // Access by camelCase target name
            rowPlaceholders.push(`$${paramIndex}`);
            
            if (value === null || value === undefined || value === '') {
              values.push(null);
            } else if (value instanceof Date) {
              // Format date for PostgreSQL (YYYY-MM-DD)
              values.push(value.toISOString().split('T')[0]);
            } else if (typeof value === 'string') {
              // Remove null bytes (0x00) which PostgreSQL rejects in UTF-8 strings
              values.push(value.replace(/\0/g, ''));
            } else {
              values.push(value);
            }
            paramIndex++;
          }
          placeholders.push(`(${rowPlaceholders.join(', ')})`);
        }

      // Use parameterized query with ON CONFLICT DO NOTHING to handle duplicates
      // Use uniqueKeys if available (for composite keys), otherwise use primaryKey
      let conflictClause = '';
      if (tableMapping.uniqueKeys && tableMapping.uniqueKeys.length > 0) {
        const uniqueCols = tableMapping.uniqueKeys.map(col => `"${col}"`).join(', ');
        conflictClause = `ON CONFLICT (${uniqueCols}) DO NOTHING`;
      } else {
        const primaryKeyCol = tableMapping.primaryKey;
        conflictClause = `ON CONFLICT ("${primaryKeyCol}") DO NOTHING`;
      }
      const query = `INSERT INTO "${targetTable}" (${columns}) VALUES ${placeholders.join(', ')} ${conflictClause}`;
      
      await client.query(query, values);
      loaded += batch.length;

      logger.debug(`Loaded batch: ${loaded}/${records.length} rows`);
    }

    return loaded;
  }
}

