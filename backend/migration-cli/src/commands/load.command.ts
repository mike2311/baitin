/**
 * Load Command
 * 
 * CLI command to load extracted data into PostgreSQL.
 */

import { Command } from 'commander';
import { Pool } from 'pg';
import { LoaderService } from '../loader/loader.service.js';
import { loadTableMappings, loadFieldMappings, mergeFieldMappings } from '../config/migration.config.js';
import { getDatabaseConfig, validatePocEnvironment, validateDatabaseConnection } from '../utils/environment.util.js';
import { logger } from '../utils/logger.util.js';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load command implementation
 */
export function createLoadCommand(): Command {
  const command = new Command('load')
    .description('Load extracted data into PostgreSQL database')
    .requiredOption('--input <path>', 'Input directory containing extracted CSV files')
    .option('--mode <mode>', 'Load mode: baseline (truncate+reload) or incremental (upsert)', 'baseline')
    .action(async (options) => {
      try {
        logger.info('Starting load process');
        console.log(chalk.blue('\n📥 Starting Data Load\n'));

        // Validate environment
        if (!validatePocEnvironment()) {
          process.exit(1);
        }

        // Validate input directory
        if (!fs.existsSync(options.input)) {
          throw new Error(`Input directory does not exist: ${options.input}`);
        }

        // Check for extraction manifest
        const manifestPath = path.join(options.input, 'extraction-manifest.json');
        if (!fs.existsSync(manifestPath)) {
          console.warn(chalk.yellow(`⚠️  Warning: Extraction manifest not found at ${manifestPath}`));
        }

        // Get database configuration
        const dbConfig = getDatabaseConfig();
        validateDatabaseConnection(dbConfig.database, 'poc');

        console.log(chalk.gray(`Database: ${dbConfig.database}`));
        console.log(chalk.gray(`Mode: ${options.mode}\n`));

        // Create database connection
        const pool = new Pool(dbConfig);

        try {
          // Test connection
          await pool.query('SELECT 1');
          logger.info('Database connection established');

          // Load configurations
          const tableMappings = loadTableMappings();
          const fieldMappings = loadFieldMappings();
          const mergedMappings = mergeFieldMappings(tableMappings, fieldMappings);

          // Initialize loader
          const loader = new LoaderService(pool);

          // Load tables
          console.log(chalk.gray(`Loading ${mergedMappings.length} tables...\n`));
          const results = await loader.loadTables(mergedMappings, options.input, options.mode as 'baseline' | 'incremental');

          // Verify row counts
          console.log(chalk.green('\n✓ Load completed successfully\n'));
          console.log(chalk.gray('Row counts:'));
          for (const [table, count] of results.entries()) {
            const dbCount = await loader.getRowCount(table);
            const match = count === dbCount ? '✓' : '✗';
            const color = count === dbCount ? chalk.green : chalk.red;
            console.log(color(`  ${match} ${table}: ${dbCount} rows`));
          }

        } finally {
          await pool.end();
        }

      } catch (error) {
        logger.error('Load failed:', error);
        console.error(chalk.red(`\n✗ Load failed: ${error}\n`));
        process.exit(1);
      }
    });

  return command;
}


