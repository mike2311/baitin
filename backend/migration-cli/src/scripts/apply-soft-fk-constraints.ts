#!/usr/bin/env node

/**
 * Apply Soft FK Constraints Script
 * 
 * Executes migration 001 to add temporary soft FK constraints.
 * 
 * Usage:
 *   tsx src/scripts/apply-soft-fk-constraints.ts
 */

import * as path from 'path';
import * as url from 'url';
import { logger } from '../utils/logger.util.js';
import chalk from 'chalk';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the run-migration script logic
async function applySoftFKConstraints(): Promise<void> {
  try {
    logger.info('Applying soft FK constraints...');
    
    const migrationFile = path.join(__dirname, '../../migrations/001-add-soft-fk-constraints.sql');
    
    // Check for database connection environment variables
    const dbConfig = {
      host: process.env.DB_HOST || process.env.DATABASE_HOST,
      port: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5432', 10),
      database: process.env.DB_NAME || process.env.DATABASE_NAME,
      user: process.env.DB_USER || process.env.DATABASE_USER,
      password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD,
    };

    if (!dbConfig.host || !dbConfig.database || !dbConfig.user || !dbConfig.password) {
      throw new Error('Database connection environment variables are not set. Required: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD');
    }

    logger.info(`Executing migration against database: ${dbConfig.database}@${dbConfig.host}`);

    // Count orphaned records before applying constraints
    logger.info('Counting orphaned records before applying constraints...');
    
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    const client = await pool.connect();

    try {
      // Count orphaned records
      const beforeCounts = {
        itemOrigin: 0,
        oeControlCustomer: 0,
        oeHeaderCustomer: 0,
        oeDetailHeader: 0,
      };

      const itemOriginResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM item i
        WHERE i.origin IS NOT NULL AND i.origin != ''
        AND NOT EXISTS (SELECT 1 FROM zorigin z WHERE z.origin = i.origin)
      `);
      beforeCounts.itemOrigin = parseInt(itemOriginResult.rows[0].count, 10);

      const oeControlResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM order_enquiry_control oec
        WHERE oec.cust_no IS NOT NULL AND oec.cust_no != ''
        AND NOT EXISTS (SELECT 1 FROM customer c WHERE c.cust_no = oec.cust_no)
      `);
      beforeCounts.oeControlCustomer = parseInt(oeControlResult.rows[0].count, 10);

      const oeHeaderResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM order_enquiry_header oeh
        WHERE oeh.cust_no IS NOT NULL AND oeh.cust_no != ''
        AND NOT EXISTS (SELECT 1 FROM customer c WHERE c.cust_no = oeh.cust_no)
      `);
      beforeCounts.oeHeaderCustomer = parseInt(oeHeaderResult.rows[0].count, 10);

      const oeDetailResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM order_enquiry_detail oed
        WHERE oed.oe_no IS NOT NULL AND oed.oe_no != ''
        AND NOT EXISTS (SELECT 1 FROM order_enquiry_header oeh WHERE oeh.oe_no = oed.oe_no)
      `);
      beforeCounts.oeDetailHeader = parseInt(oeDetailResult.rows[0].count, 10);

      logger.info('Orphaned records before applying constraints:');
      logger.info(`  - item.origin: ${beforeCounts.itemOrigin}`);
      logger.info(`  - order_enquiry_control.cust_no: ${beforeCounts.oeControlCustomer}`);
      logger.info(`  - order_enquiry_header.cust_no: ${beforeCounts.oeHeaderCustomer}`);
      logger.info(`  - order_enquiry_detail.oe_no: ${beforeCounts.oeDetailHeader}`);

      // Execute migration
      const migrationSQL = await import('fs').then(fs => 
        fs.promises.readFile(migrationFile, 'utf-8')
      );

      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      await client.query('BEGIN');

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          logger.info(`Executing constraint ${i + 1}/${statements.length}`);
          
          try {
            await client.query(statement);
            logger.info(`✓ Constraint ${i + 1} applied successfully`);
          } catch (error: any) {
            if (error.message && (error.message.includes('already exists') || error.message.includes('duplicate key'))) {
              logger.warn(`⚠ Constraint ${i + 1} already exists, skipping`);
            } else {
              throw error;
            }
          }
        }
      }

      await client.query('COMMIT');

      // Verify constraints were created
      const constraintResult = await client.query(`
        SELECT conname, contype, condeferrable, condeferred 
        FROM pg_constraint 
        WHERE conname LIKE '%_soft'
        ORDER BY conname
      `);

      logger.info('\nApplied soft FK constraints:');
      for (const row of constraintResult.rows) {
        logger.info(`  - ${row.conname} (deferrable: ${row.condeferrable}, deferred: ${row.condeferred})`);
      }

      logger.info(chalk.green('\n✓ Soft FK constraints applied successfully'));
      logger.info(chalk.yellow('\n⚠ Note: These are temporary constraints. Plan to remove them after data cleanup.'));
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error: any) {
    logger.error('Failed to apply soft FK constraints:', error);
    console.error(chalk.red(`\n✗ Error: ${error.message}\n`));
    process.exit(1);
  }
}

applySoftFKConstraints().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});

