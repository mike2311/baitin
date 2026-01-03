#!/usr/bin/env node

/**
 * Migration Execution Script
 * 
 * Executes SQL migration files against the PostgreSQL database using MCP baitin tools.
 * 
 * Usage:
 *   tsx src/scripts/run-migration.ts <migration-file-path>
 * 
 * Example:
 *   tsx src/scripts/run-migration.ts migrations/001-add-soft-fk-constraints.sql
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger.util.js';
import chalk from 'chalk';

// Note: This script would need to be adapted to use MCP baitin tools
// For now, we'll use direct PostgreSQL connection via pg library

async function executeMigration(migrationFilePath: string): Promise<void> {
  try {
    // Resolve migration file path
    const fullPath = path.resolve(process.cwd(), migrationFilePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Migration file not found: ${fullPath}`);
    }

    logger.info(`Reading migration file: ${fullPath}`);
    const migrationSQL = fs.readFileSync(fullPath, 'utf-8');

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

    // Split SQL into individual statements (simple split on semicolon)
    // Note: This is a simplified approach - production should use a proper SQL parser
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    logger.info(`Found ${statements.length} SQL statements to execute`);

    // Import pg library dynamically
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
      await client.query('BEGIN');

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          logger.info(`Executing statement ${i + 1}/${statements.length}`);
          logger.debug(`SQL: ${statement.substring(0, 100)}...`);
          
          try {
            await client.query(statement);
            logger.info(`✓ Statement ${i + 1} executed successfully`);
          } catch (error: any) {
            // If it's a "already exists" error, log as warning and continue
            if (error.message && error.message.includes('already exists')) {
              logger.warn(`⚠ Statement ${i + 1} skipped (already exists): ${error.message}`);
            } else {
              throw error;
            }
          }
        }
      }

      await client.query('COMMIT');
      logger.info(chalk.green('\n✓ Migration completed successfully'));
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error: any) {
    logger.error('Migration execution failed:', error);
    console.error(chalk.red(`\n✗ Migration failed: ${error.message}\n`));
    process.exit(1);
  }
}

// Main execution
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error(chalk.red('\n✗ Error: Migration file path is required\n'));
  console.log('Usage: tsx src/scripts/run-migration.ts <migration-file-path>');
  console.log('Example: tsx src/scripts/run-migration.ts migrations/001-add-soft-fk-constraints.sql\n');
  process.exit(1);
}

executeMigration(migrationFile).catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});





