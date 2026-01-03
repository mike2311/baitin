/**
 * Extract Command
 * 
 * CLI command to extract legacy DBF/FPT data to intermediate format.
 */

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { ExtractorService } from '../extractor/extractor.service.js';
import { loadTableMappings, loadFieldMappings, mergeFieldMappings } from '../config/migration.config.js';
import { ExtractionManifest } from '../models/extraction-result.interface.js';
import { logger } from '../utils/logger.util.js';
import chalk from 'chalk';

/**
 * Extract command implementation
 */
export function createExtractCommand(): Command {
  const command = new Command('extract')
    .description('Extract legacy DBF/FPT data to intermediate format (CSV)')
    .requiredOption('--source <path>', 'Source directory containing DBF/FPT files')
    .requiredOption('--output <path>', 'Output directory for extracted CSV files')
    .option('--encoding <encoding>', 'Source file encoding', 'windows-1252')
    .option('--tables <tables...>', 'Specific tables to extract (default: all in scope)')
    .action(async (options) => {
      try {
        logger.info('Starting extraction process');
        console.log(chalk.blue('\n🔍 Starting Legacy Data Extraction\n'));

        // Validate source directory
        if (!fs.existsSync(options.source)) {
          throw new Error(`Source directory does not exist: ${options.source}`);
        }

        // Create output directory
        if (!fs.existsSync(options.output)) {
          fs.mkdirSync(options.output, { recursive: true });
          logger.info(`Created output directory: ${options.output}`);
        }

        // Load configurations
        const tableMappings = loadTableMappings();
        const fieldMappings = loadFieldMappings();
        const mergedMappings = mergeFieldMappings(tableMappings, fieldMappings);

        // Filter tables if specified
        const tablesToExtract = options.tables
          ? mergedMappings.filter(t => options.tables.includes(t.legacyTable))
          : mergedMappings;

        if (tablesToExtract.length === 0) {
          throw new Error('No tables to extract');
        }

        console.log(chalk.gray(`Extracting ${tablesToExtract.length} tables...\n`));

        // Initialize extractor
        const extractor = new ExtractorService();
        const results = [];

        // Extract each table
        for (const tableMapping of tablesToExtract) {
          try {
            console.log(chalk.gray(`  Extracting ${tableMapping.legacyTable}...`));
            const result = await extractor.extractTable(
              tableMapping,
              options.source,
              options.output,
              options.encoding
            );
            results.push(result);
            console.log(chalk.green(`    ✓ Extracted ${result.rowCount} rows`));
            if (result.rejectedCount && result.rejectedCount > 0) {
              console.log(chalk.yellow(`    ⚠ Rejected ${result.rejectedCount} rows`));
            }
          } catch (error) {
            logger.error(`Failed to extract ${tableMapping.legacyTable}:`, error);
            console.log(chalk.red(`    ✗ Failed: ${error}`));
            throw error;
          }
        }

        // Generate manifest
        const manifest: ExtractionManifest = {
          version: '1.0',
          timestamp: new Date(),
          sourceDirectory: options.source,
          outputDirectory: options.output,
          results,
          totalTables: results.length,
          totalRows: results.reduce((sum, r) => sum + r.rowCount, 0),
        };

        const manifestPath = path.join(options.output, 'extraction-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        logger.info(`Extraction manifest saved to ${manifestPath}`);

        console.log(chalk.green(`\n✓ Extraction completed successfully`));
        console.log(chalk.gray(`  Total tables: ${manifest.totalTables}`));
        console.log(chalk.gray(`  Total rows: ${manifest.totalRows}`));
        console.log(chalk.gray(`  Manifest: ${manifestPath}\n`));

      } catch (error) {
        logger.error('Extraction failed:', error);
        console.error(chalk.red(`\n✗ Extraction failed: ${error}\n`));
        process.exit(1);
      }
    });

  return command;
}


