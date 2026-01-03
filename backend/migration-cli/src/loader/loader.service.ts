/**
 * Loader Service
 * 
 * Orchestrates loading in dependency order with FK constraint management.
 */

import { Pool, PoolClient } from 'pg';
import { TableMapping } from '../models/table-mapping.interface.js';
import { BatchLoaderService } from './batch-loader.service.js';
// import { TransformerService } from './transformer.service.js'; // Reserved for future transformations
import { getTablesInLoadOrder } from '../config/migration.config.js';
import { logger } from '../utils/logger.util.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Loader service for PostgreSQL
 */
export class LoaderService {
  private pool: Pool;
  private batchLoader: BatchLoaderService;
  // private transformer: TransformerService; // Reserved for future transformations

  constructor(pool: Pool) {
    this.pool = pool;
    this.batchLoader = new BatchLoaderService(pool);
    // this.transformer = new TransformerService();
  }

  /**
   * Load all tables in dependency order
   */
  async loadTables(
    tableMappings: TableMapping[],
    inputDir: string,
    mode: 'baseline' | 'incremental' = 'baseline'
  ): Promise<Map<string, number>> {
    const orderedTables = getTablesInLoadOrder(tableMappings);
    const results = new Map<string, number>();

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Disable foreign key constraints temporarily
      await this.disableForeignKeyConstraints(client);

      // Load each table in order
      for (const tableMapping of orderedTables) {
        const csvPath = path.join(inputDir, `${tableMapping.legacyTable}.csv`);
        
        if (!fs.existsSync(csvPath)) {
          logger.warn(`CSV file not found for ${tableMapping.legacyTable}, skipping`);
          continue;
        }

        const truncate = mode === 'baseline';
        const csvDir = path.dirname(csvPath);
        const rowCount = await this.batchLoader.loadWithCopy(
          client,
          tableMapping,
          csvPath,
          truncate,
          csvDir
        );

        results.set(tableMapping.targetTable, rowCount);
      }

      // Re-enable foreign key constraints
      await this.enableForeignKeyConstraints(client);

      await client.query('COMMIT');
      logger.info('All tables loaded successfully');

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to load tables, transaction rolled back:', error);
      throw error;
    } finally {
      client.release();
    }

    return results;
  }

  /**
   * Disable foreign key constraints
   */
  private async disableForeignKeyConstraints(client: PoolClient): Promise<void> {
    // PostgreSQL doesn't have a simple way to disable all FK constraints
    // This is a placeholder - in production, you might need to:
    // 1. Get list of constraints
    // 2. Disable them individually
    // Or use SET session_replication_role = 'replica' which disables triggers and FK checks
    logger.info('Disabling foreign key constraint checks');
    await client.query("SET session_replication_role = 'replica'");
  }

  /**
   * Enable foreign key constraints
   */
  private async enableForeignKeyConstraints(client: PoolClient): Promise<void> {
    logger.info('Re-enabling foreign key constraint checks');
    await client.query("SET session_replication_role = 'origin'");
  }

  /**
   * Get row count for a table
   */
  async getRowCount(tableName: string): Promise<number> {
    const result = await this.pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    return parseInt(result.rows[0].count, 10);
  }
}

