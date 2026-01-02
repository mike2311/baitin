#!/usr/bin/env node

/**
 * Review and Create Master Data Script
 * 
 * Interactive CLI script for business users to review and create missing master data.
 * 
 * Usage:
 *   tsx src/scripts/review-and-create-master-data.ts
 */

import * as readline from 'readline';
import { Pool } from 'pg';
import { logger } from '../utils/logger.util.js';
import { DataQualityTrackerService } from '../services/data-quality-tracker.service.js';
import chalk from 'chalk';

interface ReviewResult {
  action: 'create' | 'skip' | 'defer' | 'invalid';
  notes?: string;
}

class MasterDataReviewer {
  private rl: readline.Interface;
  private pool: Pool;
  private tracker: DataQualityTrackerService;

  constructor(pool: Pool) {
    this.pool = pool;
    this.tracker = new DataQualityTrackerService();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  close() {
    this.rl.close();
  }

  async reviewAndCreate(): Promise<void> {
    try {
      logger.info('Loading data quality issues...');
      const orphanedRecords = await this.tracker.trackOrphanedRecords(this.pool, []);

      if (orphanedRecords.length === 0) {
        console.log(chalk.green('\n✓ No orphaned records found. Database is clean!\n'));
        return;
      }

      console.log(chalk.blue(`\nFound ${orphanedRecords.length} orphaned record issues to review\n`));

      // Group by type
      const byType = new Map<string, typeof orphanedRecords>();
      for (const record of orphanedRecords) {
        const key = `${record.sourceTable}.${record.fkField} → ${record.targetTable}`;
        if (!byType.has(key)) {
          byType.set(key, []);
        }
        byType.get(key)!.push(record);
      }

      for (const [type, records] of byType.entries()) {
        console.log(chalk.bold(`\n${type}:`));
        console.log(`  ${records.length} unique values affecting ${records.reduce((sum, r) => sum + r.recordCount, 0)} records\n`);

        for (const record of records) {
          const result = await this.reviewRecord(record);
          
          if (result.action === 'create') {
            await this.createMasterData(record, result.notes);
          } else if (result.action === 'invalid') {
            await this.markAsInvalid(record, result.notes);
          } else if (result.action === 'defer') {
            logger.info(`Deferred: ${record.fkValue}`);
          } else {
            logger.info(`Skipped: ${record.fkValue}`);
          }
        }
      }

      console.log(chalk.green('\n✓ Review completed\n'));
    } catch (error: any) {
      logger.error('Review failed:', error);
      throw error;
    }
  }

  private async reviewRecord(record: any): Promise<ReviewResult> {
    console.log(chalk.yellow(`\n  Value: ${record.fkValue}`));
    console.log(`  Affects: ${record.recordCount} records`);
    console.log(`  Severity: ${record.severity}`);

    const answer = await this.question(
      '  Action: [c]reate, [s]kip, [d]efer, [i]nvalid: '
    );

    const normalized = answer.trim().toLowerCase();
    let action: ReviewResult['action'] = 'skip';

    if (normalized === 'c' || normalized === 'create') {
      action = 'create';
    } else if (normalized === 'i' || normalized === 'invalid') {
      action = 'invalid';
    } else if (normalized === 'd' || normalized === 'defer') {
      action = 'defer';
    }

    let notes: string | undefined;
    if (action === 'create' || action === 'invalid') {
      const notesAnswer = await this.question('  Notes (optional): ');
      notes = notesAnswer.trim() || undefined;
    }

    return { action, notes };
  }

  private async createMasterData(record: any, notes?: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      if (record.targetTable === 'zorigin') {
        // Create origin code
        const description = notes || `Created during data quality review`;
        
        await client.query(
          `INSERT INTO zorigin (origin, description) VALUES ($1, $2) 
           ON CONFLICT (origin) DO NOTHING`,
          [record.fkValue, description]
        );

        logger.info(`✓ Created origin code: ${record.fkValue}`);
      } else if (record.targetTable === 'customer') {
        // Customer creation requires more fields - just log for now
        console.log(chalk.yellow(`  ⚠ Customer creation requires more fields. Please use the API or admin panel.`));
        console.log(chalk.yellow(`     Customer code: ${record.fkValue}`));
        logger.warn(`Customer creation deferred: ${record.fkValue} (requires API/admin panel)`);
      } else {
        logger.warn(`Unknown target table: ${record.targetTable}`);
      }

      // Update audit table
      await this.tracker.markIssueResolved(
        client,
        -1, // Will need to look up actual ID
        process.env.USER || 'system',
        notes || 'Created via review script'
      );
    } catch (error: any) {
      logger.error(`Failed to create master data for ${record.fkValue}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  private async markAsInvalid(record: any, notes?: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Update audit table to mark as invalid
      await client.query(
        `
        UPDATE data_quality_audit
        SET status = 'approved_as_is',
            resolution_notes = $1,
            resolved_by = $2,
            resolved_at = CURRENT_TIMESTAMP
        WHERE source_table = $3
          AND target_table = $4
          AND fk_field = $5
          AND fk_value = $6
        `,
        [
          notes || 'Marked as invalid during review',
          process.env.USER || 'system',
          record.sourceTable,
          record.targetTable,
          record.fkField,
          record.fkValue,
        ]
      );

      logger.info(`✓ Marked as invalid: ${record.fkValue}`);
    } finally {
      client.release();
    }
  }
}

async function main(): Promise<void> {
  try {
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

    const pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    const reviewer = new MasterDataReviewer(pool);

    try {
      await reviewer.reviewAndCreate();
    } finally {
      reviewer.close();
      await pool.end();
    }
  } catch (error: any) {
    logger.error('Failed to review master data:', error);
    console.error(chalk.red(`\n✗ Error: ${error.message}\n`));
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});

