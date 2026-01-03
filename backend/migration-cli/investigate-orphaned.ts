/**
 * 5 Why Analysis for Orphaned Records Investigation
 * 
 * Systematically investigates why orphaned records exist in the migrated data.
 */

import { Pool } from 'pg';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loadTableMappings, loadFieldMappings, mergeFieldMappings } from './src/config/migration.config.js';
import { getDatabaseConfig } from './src/utils/environment.util.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface InvestigationResult {
  why: string;
  finding: string;
  evidence: any;
  conclusion: string;
}

class OrphanedRecordInvestigator {
  private pool: Pool;
  private tableMappings: any[];
  private csvDir: string;

  constructor(pool: Pool, tableMappings: any[], csvDir: string) {
    this.pool = pool;
    this.tableMappings = tableMappings;
    this.csvDir = csvDir;
  }

  async investigateAll(): Promise<void> {
    console.log(chalk.blue('\n═══════════════════════════════════════════════════════════════'));
    console.log(chalk.blue('  5 WHY ANALYSIS: INVESTIGATING ORPHANED RECORDS'));
    console.log(chalk.blue('═══════════════════════════════════════════════════════════════\n'));

    // 1. Item -> zorigin (origin field)
    await this.investigateForeignKey('item', 'origin', 'zorigin', 'origin');

    // 2. order_enquiry_control -> customer (cust_no)
    await this.investigateForeignKey('order_enquiry_control', 'cust_no', 'customer', 'cust_no');

    // 3. order_enquiry_header -> customer (cust_no)
    await this.investigateForeignKey('order_enquiry_header', 'cust_no', 'customer', 'cust_no');

    // 4. order_enquiry_detail -> order_enquiry_header (oe_no)
    await this.investigateForeignKey('order_enquiry_detail', 'oe_no', 'order_enquiry_header', 'oe_no');

    // 5. order_enquiry_detail -> item (item_no)
    await this.investigateForeignKey('order_enquiry_detail', 'item_no', 'item', 'item_no');

    // 6. order_enquiry_detail -> vendor (vendor_no)
    await this.investigateForeignKey('order_enquiry_detail', 'vendor_no', 'vendor', 'vendor_no');
  }

  async investigateForeignKey(
    sourceTable: string,
    fkField: string,
    targetTable: string,
    pkField: string
  ): Promise<void> {
    console.log(chalk.cyan(`\n${'='.repeat(80)}`));
    console.log(chalk.cyan(`INVESTIGATION: ${sourceTable}.${fkField} → ${targetTable}.${pkField}`));
    console.log(chalk.cyan('='.repeat(80)));

    const findings: InvestigationResult[] = [];

    // WHY 1: Are there orphaned records in the database?
    console.log(chalk.yellow('\n❓ WHY 1: Are there orphaned records in the database?'));
    const orphanedQuery = `
      SELECT DISTINCT t."${fkField}" as orphaned_value, COUNT(*) as count
      FROM "${sourceTable}" t
      WHERE t."${fkField}" IS NOT NULL
      AND t."${fkField}" != ''
      AND NOT EXISTS (
        SELECT 1 FROM "${targetTable}" r
        WHERE r."${pkField}" = t."${fkField}"
      )
      GROUP BY t."${fkField}"
      ORDER BY count DESC
      LIMIT 10
    `;
    const orphanedResult = await this.pool.query(orphanedQuery);
    
    if (orphanedResult.rows.length === 0) {
      console.log(chalk.green('   ✅ NO ORPHANED RECORDS FOUND'));
      return;
    }

    const orphanedCount = orphanedResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    const orphanedValues = orphanedResult.rows.map(row => row.orphaned_value);
    
    console.log(chalk.red(`   ❌ FOUND ${orphanedCount} ORPHANED RECORDS`));
    console.log(chalk.gray(`   Sample orphaned values: ${orphanedValues.slice(0, 5).join(', ')}`));
    
    findings.push({
      why: 'Why 1: Are there orphaned records?',
      finding: `Found ${orphanedCount} orphaned records with ${orphanedValues.length} distinct values`,
      evidence: { count: orphanedCount, sampleValues: orphanedValues.slice(0, 10) },
      conclusion: 'Orphaned records exist in the migrated database'
    });

    // WHY 2: Do these orphaned values exist in the source CSV files?
    console.log(chalk.yellow('\n❓ WHY 2: Do these orphaned values exist in the source CSV files?'));
    const sourceMapping = this.tableMappings.find(m => m.targetTable === sourceTable);
    const targetMapping = this.tableMappings.find(m => m.targetTable === targetTable);
    
    if (!sourceMapping || !targetMapping) {
      console.log(chalk.red('   ❌ Could not find table mapping'));
      return;
    }

    const csvPath = path.join(this.csvDir, `${sourceMapping.legacyTable}.csv`);
    const targetCsvPath = path.join(this.csvDir, `${targetMapping.legacyTable}.csv`);
    
    if (!fs.existsSync(csvPath)) {
      console.log(chalk.red(`   ❌ Source CSV not found: ${csvPath}`));
      return;
    }

    // Read source CSV
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const csvRecords = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: false,
      relax_quotes: true,
    });

    // Find FK field in CSV (case-insensitive)
    const csvFkField = this.findCsvField(csvRecords, sourceMapping, fkField);
    
    // Check if orphaned values exist in CSV
    const csvOrphanedValues: string[] = [];
    for (const orphanedValue of orphanedValues.slice(0, 10)) {
      const found = csvRecords.some((rec: any) => {
        const csvValue = String(rec[csvFkField] || '').trim();
        return csvValue.toLowerCase() === String(orphanedValue).toLowerCase();
      });
      if (found) {
        csvOrphanedValues.push(orphanedValue);
      }
    }

    console.log(chalk.blue(`   📊 Checking ${orphanedValues.length} orphaned values in CSV...`));
    console.log(chalk.gray(`   Found in CSV: ${csvOrphanedValues.length}/${Math.min(10, orphanedValues.length)}`));
    
    findings.push({
      why: 'Why 2: Do orphaned values exist in source CSV?',
      finding: `${csvOrphanedValues.length} of ${Math.min(10, orphanedValues.length)} sampled values exist in CSV`,
      evidence: { csvPath, foundInCsv: csvOrphanedValues },
      conclusion: csvOrphanedValues.length > 0 ? 'Orphaned values DO exist in source CSV' : 'Orphaned values NOT in source CSV'
    });

    // WHY 3: Do the referenced values exist in the target table CSV?
    console.log(chalk.yellow('\n❓ WHY 3: Do the referenced values exist in the target table CSV?'));
    
    if (!fs.existsSync(targetCsvPath)) {
      console.log(chalk.red(`   ❌ Target CSV not found: ${targetCsvPath}`));
    } else {
      const targetCsvContent = fs.readFileSync(targetCsvPath, 'utf-8');
      const targetCsvRecords = parse(targetCsvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: false,
        relax_quotes: true,
      });

      const csvPkField = this.findCsvField(targetCsvRecords, targetMapping, pkField);
      
      // Check if orphaned values exist in target CSV
      const inTargetCsv: string[] = [];
      const notInTargetCsv: string[] = [];
      
      for (const orphanedValue of orphanedValues.slice(0, 10)) {
        const found = targetCsvRecords.some((rec: any) => {
          const csvValue = String(rec[csvPkField] || '').trim();
          return csvValue.toLowerCase() === String(orphanedValue).toLowerCase();
        });
        if (found) {
          inTargetCsv.push(orphanedValue);
        } else {
          notInTargetCsv.push(orphanedValue);
        }
      }

      console.log(chalk.blue(`   📊 Checking if orphaned values exist in ${targetTable} CSV...`));
      console.log(chalk.green(`   ✅ Found in target CSV: ${inTargetCsv.length} values`));
      console.log(chalk.red(`   ❌ NOT in target CSV: ${notInTargetCsv.length} values`));
      if (notInTargetCsv.length > 0) {
        console.log(chalk.gray(`   Missing values: ${notInTargetCsv.slice(0, 5).join(', ')}`));
      }

      findings.push({
        why: 'Why 3: Do referenced values exist in target CSV?',
        finding: `${notInTargetCsv.length} of ${Math.min(10, orphanedValues.length)} values NOT in target CSV`,
        evidence: { notInTargetCsv: notInTargetCsv.slice(0, 10), inTargetCsv: inTargetCsv.slice(0, 10) },
        conclusion: notInTargetCsv.length > 0 ? 'Referenced values are MISSING from target CSV' : 'Referenced values exist in target CSV but not loaded'
      });
    }

    // WHY 4: Were the referenced values filtered out during transformation/loading?
    console.log(chalk.yellow('\n❓ WHY 4: Were the referenced values filtered out during transformation/loading?'));
    
    let notInTargetCsv: string[] = [];
    let inTargetCsv: string[] = [];
    
    if (fs.existsSync(targetCsvPath)) {
      const targetMappingForFilter = this.tableMappings.find(m => m.targetTable === targetTable);
      const requiredFields = Object.entries(targetMappingForFilter?.fieldMappings || {})
        .filter(([_, field]: [string, any]) => field.required)
        .map(([_, field]: [string, any]) => field.target);

      // Check if orphaned values might have been filtered due to missing required fields
      const targetCsvContent = fs.readFileSync(targetCsvPath, 'utf-8');
      const targetCsvRecords = parse(targetCsvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: false,
        relax_quotes: true,
      });

      const csvPkField = this.findCsvField(targetCsvRecords, targetMappingForFilter, pkField);
      
      // Re-determine which values are not in target CSV
      for (const orphanedValue of orphanedValues.slice(0, 10)) {
        const found = targetCsvRecords.some((rec: any) => {
          const csvValue = String(rec[csvPkField] || '').trim();
          return csvValue.toLowerCase() === String(orphanedValue).toLowerCase();
        });
        if (!found) {
          notInTargetCsv.push(orphanedValue);
        } else {
          inTargetCsv.push(orphanedValue);
        }
      }
      
      const filteredCount = targetCsvRecords.filter((rec: any) => {
        const pkValue = String(rec[csvPkField] || '').trim();
        return notInTargetCsv.includes(pkValue);
      }).filter((rec: any) => {
        // Check if record has missing required fields
        for (const reqField of requiredFields) {
          const csvReqField = this.findCsvField(targetCsvRecords, targetMappingForFilter, reqField);
          const value = rec[csvReqField];
          if (!value || String(value).trim() === '') {
            return true; // Would be filtered
          }
        }
        return false;
      }).length;

      console.log(chalk.blue(`   📊 Analyzing if orphaned values were filtered...`));
      console.log(chalk.gray(`   Potential filtered records: ${filteredCount} (might explain missing values)`));

      findings.push({
        why: 'Why 4: Were values filtered during transformation?',
        finding: `${filteredCount} orphaned values might have been filtered due to missing required fields`,
        evidence: { requiredFields, filteredCount },
        conclusion: filteredCount > 0 ? 'Some values were filtered due to validation failures' : 'Values not filtered, they genuinely don\'t exist'
      });
    }

    // WHY 5: Are these legacy data quality issues?
    console.log(chalk.yellow('\n❓ WHY 5: Are these legacy data quality issues?'));
    
    // Check database for actual loaded records
    const dbCountQuery = `SELECT COUNT(*) as count FROM "${targetTable}"`;
    const dbCountResult = await this.pool.query(dbCountQuery);
    const dbCount = parseInt(dbCountResult.rows[0].count, 10);

    const csvCount = fs.existsSync(targetCsvPath) 
      ? parse(fs.readFileSync(targetCsvPath, 'utf-8'), { columns: true, skip_empty_lines: true, trim: true, cast: false }).length
      : 0;

    console.log(chalk.blue(`   📊 Database vs CSV comparison:`));
    console.log(chalk.gray(`   Database: ${dbCount} records`));
    console.log(chalk.gray(`   CSV: ${csvCount} records`));
    
    const rootCause = notInTargetCsv.length > 0 
      ? 'Legacy data quality issue: Referenced values do not exist in source data'
      : dbCount < csvCount
        ? 'Data was filtered during transformation due to validation failures'
        : 'Referential integrity issue: Values exist in target table but FK lookup failed (possible case sensitivity or data type mismatch)';

    console.log(chalk.red(`   🎯 ROOT CAUSE: ${rootCause}`));

    findings.push({
      why: 'Why 5: Root cause analysis',
      finding: rootCause,
      evidence: { dbCount, csvCount, orphanedCount },
      conclusion: rootCause
    });

    // Summary
    console.log(chalk.cyan('\n📋 INVESTIGATION SUMMARY:'));
    console.log(chalk.cyan('─'.repeat(80)));
    findings.forEach((finding, idx) => {
      console.log(chalk.yellow(`\n${finding.why}`));
      console.log(chalk.white(`   Finding: ${finding.finding}`));
      console.log(chalk.gray(`   Conclusion: ${finding.conclusion}`));
    });

    console.log(chalk.red(`\n🎯 FINAL ROOT CAUSE: ${rootCause}`));
  }

  private findCsvField(csvRecords: any[], mapping: any, targetField: string): string {
    if (csvRecords.length === 0) return targetField;
    
    const headers = Object.keys(csvRecords[0] || {});
    
    // Try exact match
    const exactMatch = headers.find(h => h.toLowerCase() === targetField.toLowerCase());
    if (exactMatch) return exactMatch;

    // Try legacy field name
    for (const [legacyField, fieldMapping] of Object.entries(mapping.fieldMappings || {})) {
      if ((fieldMapping as any).target === targetField) {
        const legacyMatch = headers.find(h => h.toLowerCase() === legacyField.toLowerCase());
        if (legacyMatch) return legacyMatch;
      }
    }

    return targetField;
  }
}

// Main execution
async function main() {
  const csvDir = path.join(__dirname, 'test-output/extracted');
  const tableMappings = loadTableMappings();
  const fieldMappings = loadFieldMappings();
  const mergedMappings = mergeFieldMappings(tableMappings, fieldMappings);

  const dbConfig = getDatabaseConfig();
  const pool = new Pool(dbConfig);

  try {
    await pool.query('SELECT 1');

    const investigator = new OrphanedRecordInvestigator(pool, mergedMappings, csvDir);
    await investigator.investigateAll();

  } catch (error: any) {
    console.error(chalk.red(`\n✗ Investigation failed: ${error.message}\n`));
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
