/**
 * Table Mapping Interfaces
 * 
 * Defines TypeScript interfaces for table and field mapping configurations
 * used by the migration CLI tool.
 */

/**
 * Load strategy for migration
 */
export type LoadStrategy = 'truncate' | 'upsert' | 'incremental';

/**
 * Load order category
 */
export enum LoadOrder {
  REFERENCE = 1,      // Reference/lookup tables (zstdcode, zorigin, etc.)
  MASTER = 2,         // Master data tables (item, customer, vendor)
  TRANSACTION = 3,    // Transaction tables (OE control, header, detail)
  SECURITY = 4,       // Users and roles
}

/**
 * Field mapping configuration
 */
export interface FieldMapping {
  /** Target field name in PostgreSQL */
  target: string;
  /** Data type: string, number, boolean, date, timestamp, text */
  type: 'string' | 'number' | 'boolean' | 'date' | 'timestamp' | 'text';
  /** Required field flag */
  required?: boolean;
  /** Source location: 'dbf' for DBF field, 'fpt' for memo field */
  source?: 'dbf' | 'fpt';
  /** Default value if source is null/empty */
  defaultValue?: string | number | boolean;
  /** Transformation rule (e.g., 'foxpro' for FoxPro date format) */
  format?: string;
  /** For boolean fields: value that represents true (e.g., '.T.') */
  trueValue?: string;
  /** For boolean fields: value that represents false (e.g., '.F.') */
  falseValue?: string;
  /** Field length/precision (for string/numeric types) */
  length?: number;
  /** Scale for decimal types */
  scale?: number;
  /** Custom transformation function name (if any) */
  transform?: string;
}

/**
 * Table mapping configuration
 */
export interface TableMapping {
  /** Legacy DBF table name */
  legacyTable: string;
  /** PostgreSQL target table name */
  targetTable: string;
  /** Load order (1=reference, 2=master, 3=transaction, 4=security) */
  loadOrder: LoadOrder;
  /** Load strategy: truncate, upsert, or incremental */
  loadStrategy: LoadStrategy;
  /** Primary key field name in target table */
  primaryKey: string;
  /** Unique key fields (if different from primary key) */
  uniqueKeys?: string[];
  /** Dependencies: other tables that must be loaded first */
  dependencies?: string[];
  /** Optional filter expression (SQL WHERE clause) */
  filter?: string;
  /** Field mappings for this table */
  fieldMappings: Record<string, FieldMapping>;
  /** Notes or special instructions */
  notes?: string;
}

/**
 * Migration configuration
 */
export interface MigrationConfig {
  /** Environment identifier (POC, PROD, etc.) */
  environment: string;
  /** Database connection configuration */
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password?: string; // Should be read from environment
  };
  /** Table mappings */
  tables: TableMapping[];
  /** Encoding settings */
  encoding: {
    source: string;  // Source encoding (e.g., 'windows-1252')
    target: string;  // Target encoding (always 'UTF-8')
  };
  /** Batch size for extraction and loading */
  batchSize: number;
}

/**
 * Extraction result metadata
 */
export interface ExtractionResult {
  /** Table name */
  table: string;
  /** Number of rows extracted */
  rowCount: number;
  /** Extraction timestamp */
  timestamp: Date;
  /** Source file path */
  sourcePath: string;
  /** Output file path */
  outputPath: string;
  /** File checksum (optional) */
  checksum?: string;
  /** Number of rejected rows */
  rejectedCount?: number;
  /** Rejection file path */
  rejectionPath?: string;
}

/**
 * Extraction manifest
 */
export interface ExtractionManifest {
  /** Manifest version */
  version: string;
  /** Extraction timestamp */
  timestamp: Date;
  /** Source directory */
  sourceDirectory: string;
  /** Output directory */
  outputDirectory: string;
  /** Extraction results per table */
  results: ExtractionResult[];
  /** Total tables extracted */
  totalTables: number;
  /** Total rows extracted */
  totalRows: number;
}


