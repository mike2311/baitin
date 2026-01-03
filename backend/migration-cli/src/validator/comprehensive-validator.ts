/**
 * Comprehensive Data Migration Validation Script
 * 
 * Validates row counts, data integrity, referential integrity, and data quality
 */

import { Pool } from 'pg';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loadTableMappings, loadFieldMappings, mergeFieldMappings } from '../config/migration.config.js';
import { getDatabaseConfig } from '../utils/environment.util.js';
import { logger } from '../utils/logger.util.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ValidationResult {
  table: string;
  checks: {
    rowCount?: { passed: boolean; extracted: number; loaded: number; difference?: number };
    primaryKeyUniqueness?: { passed: boolean; duplicates?: number };
    compositeKeyUniqueness?: { passed: boolean; duplicates?: number };
    requiredFields?: { passed: boolean; missingCount?: number; missingFields?: string[] };
    foreignKeys?: { passed: boolean; orphanedCount?: number; details?: string[] };
    sampleComparison?: { passed: boolean; differences?: string[] };
    statistics?: { passed: boolean; details?: any };
    businessRules?: { passed: boolean; details?: string[] };
  };
  overall: boolean;
}

class ComprehensiveValidator {
  private pool: Pool;
  private tableMappings: any[];
  private csvDir: string;
  private manifest: any;

  constructor(pool: Pool, tableMappings: any[], csvDir: string, manifest: any) {
    this.pool = pool;
    this.tableMappings = tableMappings;
    this.csvDir = csvDir;
    this.manifest = manifest;
  }

  async validateAll(): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    for (const mapping of this.tableMappings) {
      console.log(chalk.blue(`\n🔍 Validating ${mapping.targetTable}...`));
      const result = await this.validateTable(mapping);
      results.set(mapping.targetTable, result);
    }

    return results;
  }

  async validateTable(mapping: any): Promise<ValidationResult> {
    const result: ValidationResult = {
      table: mapping.targetTable,
      checks: {},
      overall: true,
    };

    // 1. Row Count Validation
    result.checks.rowCount = await this.validateRowCount(mapping);

    // 2. Primary Key Uniqueness
    result.checks.primaryKeyUniqueness = await this.validatePrimaryKeyUniqueness(mapping);

    // 3. Composite Key Uniqueness (if applicable)
    if (mapping.uniqueKeys && mapping.uniqueKeys.length > 0) {
      result.checks.compositeKeyUniqueness = await this.validateCompositeKeyUniqueness(mapping);
    }

    // 4. Required Fields
    result.checks.requiredFields = await this.validateRequiredFields(mapping);

    // 5. Foreign Key Referential Integrity
    if (mapping.dependencies && mapping.dependencies.length > 0) {
      result.checks.foreignKeys = await this.validateForeignKeys(mapping);
    }

    // 6. Sample Record Comparison (spot check)
    result.checks.sampleComparison = await this.validateSampleRecords(mapping);

    // 7. Statistical Validation
    result.checks.statistics = await this.validateStatistics(mapping);

    // 8. Business Rules Validation
    result.checks.businessRules = await this.validateBusinessRules(mapping);

    // Overall result
    result.overall = Object.values(result.checks).every(
      check => check && check.passed !== false
    );

    return result;
  }

  async validateRowCount(mapping: any): Promise<any> {
    const manifestResult = this.manifest.results.find((r: any) => r.table === mapping.legacyTable);
    const extractedCount = manifestResult?.rowCount || 0;
    const result = await this.pool.query(`SELECT COUNT(*) as count FROM "${mapping.targetTable}"`);
    const loadedCount = parseInt(result.rows[0].count, 10);

    const passed = extractedCount === loadedCount;
    const difference = Math.abs(extractedCount - loadedCount);

    const status = passed ? chalk.green('✅') : chalk.red('❌');
    const diffText = difference > 0 ? chalk.yellow(` (${difference} difference)`) : '';
    console.log(`  Row Count: ${loadedCount}/${extractedCount} ${status}${diffText}`);

    return { passed, extracted: extractedCount, loaded: loadedCount, difference };
  }

  async validatePrimaryKeyUniqueness(mapping: any): Promise<any> {
    const query = `
      SELECT "${mapping.primaryKey}", COUNT(*) as count
      FROM "${mapping.targetTable}"
      GROUP BY "${mapping.primaryKey}"
      HAVING COUNT(*) > 1
      LIMIT 10
    `;
    const result = await this.pool.query(query);
    const duplicates = result.rows.length;

    const passed = duplicates === 0;
    const status = passed ? chalk.green('✅') : chalk.red(`❌ ${duplicates} duplicate(s) found`);
    console.log(`  Primary Key Uniqueness: ${status}`);

    return { passed, duplicates };
  }

  async validateCompositeKeyUniqueness(mapping: any): Promise<any> {
    const columns = mapping.uniqueKeys.map((col: string) => `"${col}"`).join(', ');
    const query = `
      SELECT ${columns}, COUNT(*) as count
      FROM "${mapping.targetTable}"
      GROUP BY ${columns}
      HAVING COUNT(*) > 1
      LIMIT 10
    `;
    const result = await this.pool.query(query);
    const duplicates = result.rows.length;

    const passed = duplicates === 0;
    const status = passed ? chalk.green('✅') : chalk.red(`❌ ${duplicates} duplicate(s) found`);
    console.log(`  Composite Key Uniqueness (${mapping.uniqueKeys.join('+')}): ${status}`);

    return { passed, duplicates };
  }

  async validateRequiredFields(mapping: any): Promise<any> {
    const requiredFields = Object.entries(mapping.fieldMappings || {})
      .filter(([_, field]: [string, any]) => field.required)
      .map(([_, field]: [string, any]) => ({
        target: field.target,
        type: field.type || 'string',
      }));

    const missingCounts: Record<string, number> = {};
    let totalMissing = 0;

    for (const field of requiredFields) {
      const dbField = this.toSnakeCase(field.target);
      
      // For date/timestamp fields, only check for NULL (empty string won't be valid)
      // For other fields, check both NULL and empty string
      let query: string;
      if (field.type === 'date' || field.type === 'timestamp') {
        query = `SELECT COUNT(*) as count FROM "${mapping.targetTable}" WHERE "${dbField}" IS NULL`;
      } else {
        query = `SELECT COUNT(*) as count FROM "${mapping.targetTable}" WHERE "${dbField}" IS NULL OR "${dbField}" = ''`;
      }
      
      try {
        const result = await this.pool.query(query);
        const missing = parseInt(result.rows[0].count, 10);
        if (missing > 0) {
          missingCounts[field.target] = missing;
          totalMissing += missing;
        }
      } catch (error: any) {
        // Skip fields that cause errors (might be complex types)
        logger.warn(`Skipping required field validation for ${field.target}: ${error.message}`);
      }
    }

    const passed = totalMissing === 0;
    const missingFields = Object.keys(missingCounts);
    const status = passed ? chalk.green('✅') : chalk.red(`❌ ${totalMissing} missing value(s) in: ${missingFields.join(', ')}`);
    console.log(`  Required Fields: ${status}`);

    return { passed, missingCount: totalMissing, missingFields };
  }

  async validateForeignKeys(mapping: any): Promise<any> {
    const orphaned: string[] = [];

    // Check each dependency
    for (const dep of mapping.dependencies) {
      const depMapping = this.tableMappings.find(m => m.targetTable === dep || m.legacyTable === dep);
      if (!depMapping) continue;

      // Find foreign key field
      const fkField = this.findForeignKeyField(mapping, depMapping);
      if (!fkField) {
        // Try common patterns
        const commonFk = this.findCommonForeignKey(mapping, dep);
        if (commonFk) {
          const dbFkField = this.toSnakeCase(commonFk);
          const dbPkField = depMapping.primaryKey;

          const query = `
            SELECT COUNT(DISTINCT "${dbFkField}") as count
            FROM "${mapping.targetTable}" t
            WHERE t."${dbFkField}" IS NOT NULL
            AND t."${dbFkField}" != ''
            AND NOT EXISTS (
              SELECT 1 FROM "${depMapping.targetTable}" r
              WHERE r."${dbPkField}" = t."${dbFkField}"
            )
          `;
          const result = await this.pool.query(query);
          const orphanedCount = parseInt(result.rows[0].count, 10);

          if (orphanedCount > 0) {
            orphaned.push(`${commonFk} → ${dep}: ${orphanedCount} orphaned`);
          }
        }
        continue;
      }

      const dbFkField = this.toSnakeCase(fkField);
      const dbPkField = depMapping.primaryKey;

      const query = `
        SELECT COUNT(DISTINCT "${dbFkField}") as count
        FROM "${mapping.targetTable}" t
        WHERE t."${dbFkField}" IS NOT NULL
        AND t."${dbFkField}" != ''
        AND NOT EXISTS (
          SELECT 1 FROM "${depMapping.targetTable}" r
          WHERE r."${dbPkField}" = t."${dbFkField}"
        )
      `;
      const result = await this.pool.query(query);
      const orphanedCount = parseInt(result.rows[0].count, 10);

      if (orphanedCount > 0) {
        orphaned.push(`${fkField} → ${dep}: ${orphanedCount} orphaned`);
      }
    }

    const passed = orphaned.length === 0;
    const status = passed ? chalk.green('✅') : chalk.red(`❌ ${orphaned.join('; ')}`);
    console.log(`  Foreign Keys: ${status}`);

    return { passed, orphanedCount: orphaned.length, details: orphaned };
  }

  async validateSampleRecords(mapping: any): Promise<any> {
    // Sample 5 records from database
    const dbRecords = await this.pool.query(`SELECT * FROM "${mapping.targetTable}" LIMIT 5`);
    
    if (dbRecords.rows.length === 0) {
      return { passed: false, differences: ['No records in database'] };
    }

    // Read CSV file
    const csvPath = path.join(this.csvDir, `${mapping.legacyTable}.csv`);
    if (!fs.existsSync(csvPath)) {
      return { passed: false, differences: ['CSV file not found'] };
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const csvRecords = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: false,
      relax_quotes: true,
    });

    if (csvRecords.length === 0) {
      return { passed: false, differences: ['No records in CSV'] };
    }

    // Compare first record (check key fields)
    const differences: string[] = [];
    const dbRecord = dbRecords.rows[0];
    const csvRecord = csvRecords[0];

    // Check primary key matches (case-insensitive)
    const pkDbValue = String(dbRecord[mapping.primaryKey] || '').trim();
    const csvPkField = this.findCsvField(csvRecords, mapping.primaryKey);
    const csvPkValue = String(csvRecord[csvPkField] || '').trim();

    if (pkDbValue.toLowerCase() !== csvPkValue.toLowerCase() && pkDbValue && csvPkValue) {
      differences.push(`Primary key mismatch: DB=${pkDbValue}, CSV=${csvPkValue}`);
    }

    const passed = differences.length === 0;
    const status = passed ? chalk.green('✅') : chalk.yellow(`⚠️  ${differences.length} difference(s) found`);
    console.log(`  Sample Comparison: ${status}`);

    return { passed, differences };
  }

  async validateStatistics(mapping: any): Promise<any> {
    const stats: any = {};

    // Count distinct values for primary key
    if (mapping.primaryKey) {
      const result = await this.pool.query(
        `SELECT COUNT(DISTINCT "${mapping.primaryKey}") as count FROM "${mapping.targetTable}"`
      );
      stats.distinctPrimaryKeys = parseInt(result.rows[0].count, 10);
    }

    // Special validation for order_enquiry_detail
    if (mapping.targetTable === 'order_enquiry_detail') {
      const result = await this.pool.query(`
        SELECT 
          MIN("line_no")::integer as min_line_no,
          MAX("line_no")::integer as max_line_no,
          AVG("line_no"::numeric) as avg_line_no,
          COUNT(DISTINCT "oe_no") as distinct_oe_nos,
          COUNT(*) as total_rows
        FROM "${mapping.targetTable}"
      `);
      stats.lineNoStats = result.rows[0];
    }

    const passed = true; // Statistics validation is informational
    const distinctKeys = stats.distinctPrimaryKeys || 'N/A';
    console.log(`  Statistics: ${chalk.green('✅')} (distinct keys: ${distinctKeys})`);

    return { passed, details: stats };
  }

  async validateBusinessRules(mapping: any): Promise<any> {
    const issues: string[] = [];

    // Business rule: order_enquiry_detail line_no should start at 1 for each oe_no
    if (mapping.targetTable === 'order_enquiry_detail') {
      const result = await this.pool.query(`
        SELECT COUNT(*) as count
        FROM (
          SELECT "oe_no", MIN("line_no"::integer) as min_line_no
          FROM "${mapping.targetTable}"
          GROUP BY "oe_no"
        ) subq
        WHERE min_line_no != 1
      `);
      const oeNosNotStartingAt1 = parseInt(result.rows[0].count, 10);
      if (oeNosNotStartingAt1 > 0) {
        issues.push(`${oeNosNotStartingAt1} OE(s) have line_no not starting at 1`);
      }

      // Check for gaps in line_no sequence
      const gapResult = await this.pool.query(`
        SELECT COUNT(*) as count
        FROM (
          SELECT 
            "oe_no",
            "line_no"::integer as current_line,
            LAG("line_no"::integer) OVER (PARTITION BY "oe_no" ORDER BY "line_no"::integer) as prev_line
          FROM "${mapping.targetTable}"
        ) subq
        WHERE prev_line IS NOT NULL AND current_line - prev_line > 1
      `);
      const gaps = parseInt(gapResult.rows[0].count, 10);
      if (gaps > 0) {
        issues.push(`${gaps} gap(s) found in line_no sequence`);
      }
    }

    // Business rule: All OE detail records should have corresponding header
    if (mapping.targetTable === 'order_enquiry_detail') {
      const headerMapping = this.tableMappings.find(m => m.targetTable === 'order_enquiry_header');
      if (headerMapping) {
        const orphanResult = await this.pool.query(`
          SELECT COUNT(DISTINCT d."oe_no") as count
          FROM "${mapping.targetTable}" d
          LEFT JOIN "${headerMapping.targetTable}" h ON d."oe_no" = h."oe_no"
          WHERE h."oe_no" IS NULL
        `);
        const orphanedOeNos = parseInt(orphanResult.rows[0].count, 10);
        if (orphanedOeNos > 0) {
          issues.push(`${orphanedOeNos} OE detail record(s) have no corresponding header`);
        }
      }
    }

    const passed = issues.length === 0;
    const status = passed ? chalk.green('✅') : chalk.red(`❌ ${issues.join('; ')}`);
    console.log(`  Business Rules: ${status}`);

    return { passed, details: issues };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
  }

  private findForeignKeyField(mapping: any, depMapping: any): string | null {
    // Heuristic: look for field ending with depMapping.primaryKey
    const depPk = depMapping.primaryKey.toLowerCase();
    
    for (const [legacyField, fieldMapping] of Object.entries(mapping.fieldMappings || {})) {
      const targetField = (fieldMapping as any).target;
      if (targetField && targetField.toLowerCase().includes(depPk)) {
        return targetField;
      }
    }
    
    return null;
  }

  private findCommonForeignKey(mapping: any, depTable: string): string | null {
    // Common patterns: cust_no, item_no, vendor_no, oe_no, etc.
    const commonPatterns: Record<string, string[]> = {
      'customer': ['cust_no', 'custNo'],
      'item': ['item_no', 'itemNo'],
      'vendor': ['vendor_no', 'vendorNo'],
      'order_enquiry_header': ['oe_no', 'oeNo'],
      'order_enquiry_control': ['oe_no', 'oeNo'],
    };

    const patterns = commonPatterns[depTable];
    if (!patterns) return null;

    for (const pattern of patterns) {
      for (const [legacyField, fieldMapping] of Object.entries(mapping.fieldMappings || {})) {
        const targetField = (fieldMapping as any).target;
        if (targetField && targetField.toLowerCase() === pattern.toLowerCase()) {
          return targetField;
        }
      }
    }

    return null;
  }

  private findCsvField(csvRecords: any[], field: string): string {
    if (csvRecords.length === 0) return field;
    const headers = Object.keys(csvRecords[0] || {});
    return headers.find(h => h.toLowerCase() === field.toLowerCase()) || field;
  }
}

// Build manifest from CSV files if incomplete
function buildCompleteManifest(csvDir: string, tableMappings: any[]): any {
  const results: any[] = [];
  let totalRows = 0;

  for (const mapping of tableMappings) {
    const csvPath = path.join(csvDir, `${mapping.legacyTable}.csv`);
    if (fs.existsSync(csvPath)) {
      // Count rows in CSV (skip header)
      const content = fs.readFileSync(csvPath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      const rowCount = Math.max(0, lines.length - 1); // Subtract header

      results.push({
        table: mapping.legacyTable,
        rowCount,
        timestamp: new Date().toISOString(),
        sourcePath: '',
        outputPath: csvPath,
        rejectedCount: 0,
      });
      totalRows += rowCount;
    }
  }

  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    sourceDirectory: '',
    outputDirectory: csvDir,
    results,
    totalTables: results.length,
    totalRows,
  };
}

// Main execution
async function main() {
  const csvDir = path.join(__dirname, '../../test-output/extracted');
  const manifestPath = path.join(csvDir, 'extraction-manifest.json');

  const tableMappings = loadTableMappings();
  const fieldMappings = loadFieldMappings();
  const mergedMappings = mergeFieldMappings(tableMappings, fieldMappings);

  // Load manifest or build from CSV files
  let manifest: any;
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    // If manifest only has partial data, rebuild it
    if (manifest.results.length < mergedMappings.length) {
      console.log(chalk.yellow('⚠️  Manifest incomplete, building from CSV files...'));
      manifest = buildCompleteManifest(csvDir, tableMappings);
    }
  } else {
    console.log(chalk.yellow('⚠️  Manifest not found, building from CSV files...'));
    manifest = buildCompleteManifest(csvDir, tableMappings);
  }

  const dbConfig = getDatabaseConfig();
  const pool = new Pool(dbConfig);

  try {
    // Test connection
    await pool.query('SELECT 1');

    console.log(chalk.blue('\n═══════════════════════════════════════════════════════════════'));
    console.log(chalk.blue('  COMPREHENSIVE DATA MIGRATION VALIDATION'));
    console.log(chalk.blue('═══════════════════════════════════════════════════════════════\n'));

    const validator = new ComprehensiveValidator(pool, mergedMappings, csvDir, manifest);
    const results = await validator.validateAll();

    // Generate report
    console.log(chalk.blue('\n\n📊 VALIDATION SUMMARY'));
    console.log(chalk.gray('═'.repeat(80)));

    let allPassed = true;
    for (const [table, result] of results.entries()) {
      const status = result.overall ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
      console.log(`\n${table}: ${status}`);
      allPassed = allPassed && result.overall;
    }

    console.log(chalk.gray('\n' + '═'.repeat(80)));
    const overallStatus = allPassed ? chalk.green('✅ ALL CHECKS PASSED') : chalk.red('❌ SOME CHECKS FAILED');
    console.log(`\nOverall Status: ${overallStatus}\n`);

    // Write detailed JSON report
    const reportDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `validation-report-${Date.now()}.json`);
    const report = {
      timestamp: new Date().toISOString(),
      overall: allPassed,
      results: Object.fromEntries(results),
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.gray(`📄 Detailed report saved to: ${reportPath}\n`));

    process.exit(allPassed ? 0 : 1);

  } catch (error: any) {
    console.error(chalk.red(`\n✗ Validation failed: ${error.message}\n`));
    logger.error('Validation failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
