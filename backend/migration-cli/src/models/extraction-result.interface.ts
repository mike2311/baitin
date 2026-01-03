/**
 * Extraction Result Interface
 * 
 * Defines interfaces for extraction results and manifests.
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


