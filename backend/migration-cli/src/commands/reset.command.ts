/**
 * Reset Command
 * 
 * CLI command to reset database to baseline.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { logger } from '../utils/logger.util.js';
import { validatePocEnvironment, requireConfirmation, getDatabaseConfig } from '../utils/environment.util.js';
import { Pool } from 'pg';
import { LoaderService } from '../loader/loader.service.js';
import { loadTableMappings, loadFieldMappings, mergeFieldMappings, getTablesInLoadOrder } from '../config/migration.config.js';
import * as fs from 'fs';

export function createResetCommand(): Command {
  const command = new Command('reset')
    .description('Reset database to baseline dataset')
    .requiredOption('--input <path>', 'Input directory containing extracted CSV files')
    .option('--confirm', 'Skip confirmation prompt')
    .option('--dry-run', 'Show what would be changed without executing')
    .action(async (options) => {
      try {
        logger.info('Starting reset process');
        console.log(chalk.blue('\n🔄 Starting Database Reset\n'));

        // Validate environment
        if (!validatePocEnvironment()) {
          process.exit(1);
        }

        // Validate input directory
        if (!fs.existsSync(options.input)) {
          throw new Error(`Input directory does not exist: ${options.input}`);
        }

        // Load configurations
        const tableMappings = loadTableMappings();
        const fieldMappings = loadFieldMappings();
        const mergedMappings = mergeFieldMappings(tableMappings, fieldMappings);
        const orderedTables = getTablesInLoadOrder(mergedMappings);

        // Show what will be reset
        console.log(chalk.yellow('The following tables will be truncated and reloaded:\n'));
        orderedTables.forEach((table, index) => {
          console.log(chalk.gray(`  ${index + 1}. ${table.targetTable} (from ${table.legacyTable})`));
        });
        console.log('');

        if (options.dryRun) {
          console.log(chalk.yellow('Dry run mode - no changes will be made\n'));
          return;
        }

        // Require confirmation unless --confirm flag
        if (!options.confirm) {
          const confirmed = await requireConfirmation(
            'This will truncate all tables and reload baseline data. Continue?',
            false
          );
          if (!confirmed) {
            console.log(chalk.yellow('Reset cancelled\n'));
            process.exit(0);
          }
        }

        // Get database configuration
        const dbConfig = getDatabaseConfig();
        const pool = new Pool(dbConfig);

        try {
          // Test connection
          await pool.query('SELECT 1');

          // Initialize loader
          const loader = new LoaderService(pool);

          console.log(chalk.gray('\nResetting tables...\n'));

          // Load tables in baseline mode (truncate + reload)
          const results = await loader.loadTables(mergedMappings, options.input, 'baseline');

          console.log(chalk.green(`\n✓ Reset completed successfully\n`));
          console.log(chalk.gray('Row counts:'));
          for (const [table, count] of results.entries()) {
            console.log(chalk.gray(`  ${table}: ${count} rows`));
          }
          console.log('');

        } finally {
          await pool.end();
        }

      } catch (error: any) {
        logger.error('Reset failed:', error);
        console.error(chalk.red(`\n✗ Reset failed: ${error.message}\n`));
        process.exit(1);
      }
    });

  return command;
}

