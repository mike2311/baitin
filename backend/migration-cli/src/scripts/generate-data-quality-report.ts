#!/usr/bin/env node

/**
 * Generate Data Quality Report Script
 * 
 * Generates comprehensive data quality reports for orphaned records.
 * 
 * Usage:
 *   tsx src/scripts/generate-data-quality-report.ts [--output <path>]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { Pool } from 'pg';
import { logger } from '../utils/logger.util.js';
import { DataQualityTrackerService } from '../services/data-quality-tracker.service.js';
import chalk from 'chalk';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateDataQualityReport(): Promise<void> {
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
      // Test connection
      await pool.query('SELECT 1');

      // Track orphaned records
      logger.info('Tracking orphaned records...');
      const tracker = new DataQualityTrackerService();
      const orphanedRecords = await tracker.trackOrphanedRecords(pool, []);

      // Generate report
      logger.info('Generating data quality report...');
      const report = await tracker.generateReport(orphanedRecords);

      // Save to audit table
      logger.info('Saving to audit table...');
      const client = await pool.connect();
      try {
        await tracker.saveToAuditTable(client, orphanedRecords);
      } finally {
        client.release();
      }

      // Save report to file
      const reportsDir = path.join(__dirname, '../../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const reportPath = path.join(reportsDir, `data-quality-${timestamp}.json`);

      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

      // Print summary
      console.log(chalk.green('\n✓ Data Quality Report Generated\n'));
      console.log(chalk.bold('Summary:'));
      console.log(`  Total Orphaned Records: ${report.summary.totalOrphanedRecords}`);
      console.log(`  Unique Orphaned Values: ${report.summary.totalOrphanedValues}`);
      console.log(`  Tables Affected: ${report.summary.tablesAffected}`);
      console.log(`\n  Report saved to: ${reportPath}\n`);

      // Print recommendations
      if (report.recommendations.length > 0) {
        console.log(chalk.yellow('Recommendations:'));
        report.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec}`);
        });
        console.log();
      }

      // Print issue breakdown by table
      console.log(chalk.bold('Issue Breakdown by Table:'));
      const byTable = new Map<string, { count: number; records: number }>();
      for (const issue of report.issues) {
        const key = `${issue.sourceTable}.${issue.fkField}`;
        if (!byTable.has(key)) {
          byTable.set(key, { count: 0, records: 0 });
        }
        const entry = byTable.get(key)!;
        entry.count += 1;
        entry.records += issue.recordCount;
      }

      for (const [key, stats] of byTable.entries()) {
        console.log(`  ${key}: ${stats.records} records across ${stats.count} unique values`);
      }
      console.log();

    } finally {
      await pool.end();
    }
  } catch (error: any) {
    logger.error('Failed to generate data quality report:', error);
    console.error(chalk.red(`\n✗ Error: ${error.message}\n`));
    if (error.stack) {
      logger.debug('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

generateDataQualityReport().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});

