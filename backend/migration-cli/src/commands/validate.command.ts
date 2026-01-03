/**
 * Validate Command
 * 
 * CLI command to validate and reconcile migrated data.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { logger } from '../utils/logger.util.js';
import { Pool } from 'pg';
import { ReconciliationService } from '../validator/reconciliation.service.js';
import { ValidatorService } from '../validator/validator.service.js';
import { loadTableMappings, loadFieldMappings, mergeFieldMappings } from '../config/migration.config.js';
import { getDatabaseConfig, validatePocEnvironment } from '../utils/environment.util.js';
import * as fs from 'fs';
import * as path from 'path';
import { ExtractionManifest } from '../models/extraction-result.interface.js';

export function createValidateCommand(): Command {
  const command = new Command('validate')
    .description('Validate and reconcile migrated data')
    .requiredOption('--manifest <path>', 'Path to extraction manifest JSON file')
    .option('--output <path>', 'Output directory for reports', './reports')
    .action(async (options) => {
      try {
        logger.info('Starting validation process');
        console.log(chalk.blue('\n✅ Starting Validation\n'));

        // Validate environment
        if (!validatePocEnvironment()) {
          process.exit(1);
        }

        // Load manifest
        if (!fs.existsSync(options.manifest)) {
          throw new Error(`Manifest file not found: ${options.manifest}`);
        }

        const manifestContent = fs.readFileSync(options.manifest, 'utf-8');
        const manifest: ExtractionManifest = JSON.parse(manifestContent);

        console.log(chalk.gray(`Validating ${manifest.totalTables} tables...\n`));

        // Get database configuration
        const dbConfig = getDatabaseConfig();
        const pool = new Pool(dbConfig);

        try {
          // Test connection
          await pool.query('SELECT 1');

          // Load configurations
          const tableMappings = loadTableMappings();
          const fieldMappings = loadFieldMappings();
          const mergedMappings = mergeFieldMappings(tableMappings, fieldMappings);

          // Create services
          const reconciliation = new ReconciliationService(pool);
          const validator = new ValidatorService(pool);

          // Create table mapping (legacy -> target)
          const tableMap = new Map<string, string>();
          mergedMappings.forEach(m => tableMap.set(m.legacyTable, m.targetTable));

          // Reconcile row counts
          const reconciliationResults = await reconciliation.reconcile(manifest, tableMap);

          // Generate report
          const reportDir = options.output || path.join(__dirname, '../../reports');
          if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
          }

          const reportPath = path.join(reportDir, `reconciliation-${Date.now()}.md`);
          const jsonReportPath = path.join(reportDir, `reconciliation-${Date.now()}.json`);

          // Generate Markdown report
          let report = '# Migration Reconciliation Report\n\n';
          report += `**Generated**: ${new Date().toISOString()}\n\n`;
          report += `## Summary\n\n`;
          report += `- Total Tables: ${manifest.totalTables}\n`;
          report += `- Total Rows Extracted: ${manifest.totalRows}\n\n`;

          report += `## Per-Table Details\n\n`;
          let allMatch = true;
          for (const [table, result] of reconciliationResults.entries()) {
            const match = result.match;
            if (!match) allMatch = false;
            report += `### ${table}\n`;
            report += `- Extracted Rows: ${result.extracted}\n`;
            report += `- Loaded Rows: ${result.loaded}\n`;
            report += `- Status: ${match ? '✓ Match' : '✗ Mismatch'}\n\n`;
          }

          // Validate integrity
          report += `## Integrity Checks\n\n`;
          for (const mapping of mergedMappings) {
            const uniqueness = await validator.validateUniqueness(mapping);
            report += `### ${mapping.targetTable}\n`;
            report += `- Uniqueness: ${uniqueness.valid ? '✓ Pass' : '✗ Fail'}\n`;
            if (!uniqueness.valid) {
              uniqueness.errors.forEach(err => report += `  - ${err}\n`);
            }
            report += '\n';
          }

          fs.writeFileSync(reportPath, report);

          // Generate JSON report
          const jsonReport = {
            timestamp: new Date().toISOString(),
            summary: {
              totalTables: manifest.totalTables,
              totalRows: manifest.totalRows,
              allMatch,
            },
            reconciliation: Object.fromEntries(reconciliationResults),
          };
          fs.writeFileSync(jsonReportPath, JSON.stringify(jsonReport, null, 2));

          console.log(chalk.green(`\n✓ Validation completed\n`));
          console.log(chalk.gray(`  Report: ${reportPath}`));
          console.log(chalk.gray(`  JSON: ${jsonReportPath}\n`));

        } finally {
          await pool.end();
        }

      } catch (error: any) {
        logger.error('Validation failed:', error);
        console.error(chalk.red(`\n✗ Validation failed: ${error.message}\n`));
        process.exit(1);
      }
    });

  return command;
}

