#!/usr/bin/env node

/**
 * Validate Strict FK Ready Script
 * 
 * Validates that the database is ready for strict FK constraint enforcement.
 * 
 * Usage:
 *   tsx src/scripts/validate-strict-fk-ready.ts
 * 
 * Exit codes:
 *   0 - Database is ready for strict FK constraints
 *   1 - Database is not ready (orphaned records or unresolved issues)
 */

import { Pool } from 'pg';
import { logger } from '../utils/logger.util.js';
import { DataQualityTrackerService } from '../services/data-quality-tracker.service.js';
import chalk from 'chalk';

async function validateStrictFKReady(): Promise<boolean> {
  try {
    // Get database configuration
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

    logger.info('Connecting to database...');
    const pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    try {
      // Check for orphaned records
      logger.info('Checking for orphaned records...');
      const tracker = new DataQualityTrackerService();
      const orphanedRecords = await tracker.trackOrphanedRecords(pool, []);

      if (orphanedRecords.length === 0) {
        logger.info(chalk.green('✓ No orphaned records found'));
      } else {
        logger.warn(chalk.yellow(`⚠ Found ${orphanedRecords.length} orphaned record issues`));
      }

      // Check audit table for unresolved issues
      logger.info('Checking data quality audit table for unresolved issues...');
      const client = await pool.connect();
      let unresolvedIssues = 0;
      try {
        const auditResult = await client.query(`
          SELECT COUNT(*) as count
          FROM data_quality_audit
          WHERE status NOT IN ('resolved', 'approved_as_is')
        `);
        unresolvedIssues = parseInt(auditResult.rows[0].count, 10);

        if (unresolvedIssues > 0) {
          logger.warn(chalk.yellow(`⚠ Found ${unresolvedIssues} unresolved issues in audit table`));

          // Show breakdown by status
          const statusResult = await client.query(`
            SELECT status, COUNT(*) as count
            FROM data_quality_audit
            WHERE status NOT IN ('resolved', 'approved_as_is')
            GROUP BY status
            ORDER BY status
          `);

          for (const row of statusResult.rows) {
            logger.warn(`  - ${row.status}: ${row.count} issues`);
          }
        } else {
          logger.info(chalk.green('✓ All issues in audit table are resolved'));
        }
      } finally {
        client.release();
      }

      // Check if soft FK constraints exist
      logger.info('Checking for soft FK constraints...');
      const constraintResult = await client.query(`
        SELECT conname
        FROM pg_constraint
        WHERE conname LIKE '%_soft'
        ORDER BY conname
      `);

      if (constraintResult.rows.length > 0) {
        logger.info(chalk.blue(`Found ${constraintResult.rows.length} soft FK constraints:`));
        for (const row of constraintResult.rows) {
          logger.info(`  - ${row.conname}`);
        }
      }

      // Determine if ready
      const isReady = orphanedRecords.length === 0 && unresolvedIssues === 0;

      if (isReady) {
        console.log(chalk.green('\n✓ Database is ready for strict FK constraints\n'));
        return true;
      } else {
        console.log(chalk.red('\n✗ Database is NOT ready for strict FK constraints\n'));
        console.log(chalk.yellow('Issues to resolve:'));
        if (orphanedRecords.length > 0) {
          console.log(`  - ${orphanedRecords.length} orphaned record issues found`);
        }
        if (unresolvedIssues > 0) {
          console.log(`  - ${unresolvedIssues} unresolved issues in audit table`);
        }
        console.log();
        return false;
      }
    } finally {
      await pool.end();
    }
  } catch (error: any) {
    logger.error('Validation failed:', error);
    console.error(chalk.red(`\n✗ Error: ${error.message}\n`));
    return false;
  }
}

// Main execution
validateStrictFKReady().then((isReady) => {
  process.exit(isReady ? 0 : 1);
}).catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});

