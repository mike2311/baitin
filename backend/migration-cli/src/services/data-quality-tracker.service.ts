/**
 * Data Quality Tracker Service
 * 
 * Tracks and reports orphaned records in the database.
 * 
 * Original Logic Reference:
 * - Documentation: docs/data-quality-report.md
 * - Investigation Script: investigate-orphaned.ts
 */

import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger.util.js';

export interface OrphanedRecord {
  sourceTable: string;
  targetTable: string;
  fkField: string;
  fkValue: string;
  recordCount: number;
  severity: 'warning' | 'error';
  status: 'pending' | 'in_review' | 'resolved' | 'approved_as_is';
}

export interface DataQualityReport {
  timestamp: string;
  summary: {
    totalOrphanedRecords: number;
    totalOrphanedValues: number;
    tablesAffected: number;
  };
  issues: OrphanedRecord[];
  recommendations: string[];
}

export class DataQualityTrackerService {
  /**
   * Track all orphaned records in the database
   */
  async trackOrphanedRecords(
    pool: Pool,
    tableMappings: any[]
  ): Promise<OrphanedRecord[]> {
    const orphanedRecords: OrphanedRecord[] = [];
    const client = await pool.connect();

    try {
      // 1. Check item.origin → zorigin.origin
      logger.info('Checking orphaned item.origin references...');
      const itemOriginResult = await client.query(`
        SELECT 
          i.origin as fk_value,
          COUNT(*) as record_count
        FROM item i
        WHERE i.origin IS NOT NULL AND i.origin != ''
        AND NOT EXISTS (
          SELECT 1 FROM zorigin z WHERE z.origin = i.origin
        )
        GROUP BY i.origin
        ORDER BY record_count DESC
      `);

      for (const row of itemOriginResult.rows) {
        orphanedRecords.push({
          sourceTable: 'item',
          targetTable: 'zorigin',
          fkField: 'origin',
          fkValue: row.fk_value,
          recordCount: parseInt(row.record_count, 10),
          severity: 'warning',
          status: 'pending',
        });
      }

      // 2. Check order_enquiry_control.cust_no → customer.cust_no
      logger.info('Checking orphaned order_enquiry_control.cust_no references...');
      const oeControlResult = await client.query(`
        SELECT 
          oec.cust_no as fk_value,
          COUNT(*) as record_count
        FROM order_enquiry_control oec
        WHERE oec.cust_no IS NOT NULL AND oec.cust_no != ''
        AND NOT EXISTS (
          SELECT 1 FROM customer c WHERE c.cust_no = oec.cust_no
        )
        GROUP BY oec.cust_no
        ORDER BY record_count DESC
      `);

      for (const row of oeControlResult.rows) {
        orphanedRecords.push({
          sourceTable: 'order_enquiry_control',
          targetTable: 'customer',
          fkField: 'cust_no',
          fkValue: row.fk_value,
          recordCount: parseInt(row.record_count, 10),
          severity: 'error',
          status: 'pending',
        });
      }

      // 3. Check order_enquiry_header.cust_no → customer.cust_no
      logger.info('Checking orphaned order_enquiry_header.cust_no references...');
      const oeHeaderResult = await client.query(`
        SELECT 
          oeh.cust_no as fk_value,
          COUNT(*) as record_count
        FROM order_enquiry_header oeh
        WHERE oeh.cust_no IS NOT NULL AND oeh.cust_no != ''
        AND NOT EXISTS (
          SELECT 1 FROM customer c WHERE c.cust_no = oeh.cust_no
        )
        GROUP BY oeh.cust_no
        ORDER BY record_count DESC
      `);

      for (const row of oeHeaderResult.rows) {
        orphanedRecords.push({
          sourceTable: 'order_enquiry_header',
          targetTable: 'customer',
          fkField: 'cust_no',
          fkValue: row.fk_value,
          recordCount: parseInt(row.record_count, 10),
          severity: 'error',
          status: 'pending',
        });
      }

      // 4. Check order_enquiry_detail.oe_no → order_enquiry_header.oe_no
      logger.info('Checking orphaned order_enquiry_detail.oe_no references...');
      const oeDetailResult = await client.query(`
        SELECT 
          oed.oe_no as fk_value,
          COUNT(*) as record_count
        FROM order_enquiry_detail oed
        WHERE oed.oe_no IS NOT NULL AND oed.oe_no != ''
        AND NOT EXISTS (
          SELECT 1 FROM order_enquiry_header oeh WHERE oeh.oe_no = oed.oe_no
        )
        GROUP BY oed.oe_no
        ORDER BY record_count DESC
      `);

      for (const row of oeDetailResult.rows) {
        orphanedRecords.push({
          sourceTable: 'order_enquiry_detail',
          targetTable: 'order_enquiry_header',
          fkField: 'oe_no',
          fkValue: row.fk_value,
          recordCount: parseInt(row.record_count, 10),
          severity: 'error',
          status: 'pending',
        });
      }

      logger.info(`Found ${orphanedRecords.length} unique orphaned record issues`);
      return orphanedRecords;
    } finally {
      client.release();
    }
  }

  /**
   * Generate comprehensive data quality report
   */
  async generateReport(
    orphanedRecords: OrphanedRecord[]
  ): Promise<DataQualityReport> {
    const totalOrphanedRecords = orphanedRecords.reduce(
      (sum, record) => sum + record.recordCount,
      0
    );
    const totalOrphanedValues = orphanedRecords.length;
    const tablesAffected = new Set(
      orphanedRecords.map(r => r.sourceTable)
    ).size;

    const recommendations: string[] = [];

    // Generate recommendations based on issue types
    const itemOriginIssues = orphanedRecords.filter(
      r => r.sourceTable === 'item' && r.fkField === 'origin'
    );
    if (itemOriginIssues.length > 0) {
      recommendations.push(
        `Create ${itemOriginIssues.length} missing origin codes in zorigin table`
      );
    }

    const customerIssues = orphanedRecords.filter(
      r => r.targetTable === 'customer'
    );
    if (customerIssues.length > 0) {
      recommendations.push(
        `Review and create ${customerIssues.length} missing customer codes in customer table`
      );
    }

    const oeDetailIssues = orphanedRecords.filter(
      r => r.sourceTable === 'order_enquiry_detail'
    );
    if (oeDetailIssues.length > 0) {
      recommendations.push(
        `Investigate ${oeDetailIssues.length} orphaned OE detail records - may need header reconstruction`
      );
    }

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalOrphanedRecords,
        totalOrphanedValues,
        tablesAffected,
      },
      issues: orphanedRecords,
      recommendations,
    };
  }

  /**
   * Get orphaned records for a specific table
   */
  async getOrphanedRecordsByTable(
    pool: Pool,
    tableName: string
  ): Promise<OrphanedRecord[]> {
    const allRecords = await this.trackOrphanedRecords(pool, []);
    return allRecords.filter(r => r.sourceTable === tableName);
  }

  /**
   * Save orphaned records to data_quality_audit table
   */
  async saveToAuditTable(
    client: PoolClient,
    orphanedRecords: OrphanedRecord[]
  ): Promise<void> {
    logger.info(`Saving ${orphanedRecords.length} orphaned record issues to audit table...`);

    for (const record of orphanedRecords) {
      // Check if record already exists
      const existing = await client.query(
        `
        SELECT id FROM data_quality_audit
        WHERE source_table = $1
          AND target_table = $2
          AND fk_field = $3
          AND fk_value = $4
        `,
        [record.sourceTable, record.targetTable, record.fkField, record.fkValue]
      );

      if (existing.rows.length === 0) {
        // Insert new record
        await client.query(
          `
          INSERT INTO data_quality_audit 
          (source_table, target_table, fk_field, fk_value, orphaned_count, status)
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            record.sourceTable,
            record.targetTable,
            record.fkField,
            record.fkValue,
            record.recordCount,
            record.status,
          ]
        );
      } else {
        // Update existing record (only if count changed or status is still pending)
        await client.query(
          `
          UPDATE data_quality_audit
          SET orphaned_count = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE source_table = $2
            AND target_table = $3
            AND fk_field = $4
            AND fk_value = $5
            AND status = 'pending'
          `,
          [
            record.recordCount,
            record.sourceTable,
            record.targetTable,
            record.fkField,
            record.fkValue,
          ]
        );
      }
    }

    logger.info('✓ Audit table updated successfully');
  }

  /**
   * Mark an issue as resolved
   */
  async markIssueResolved(
    client: PoolClient,
    issueId: number,
    resolvedBy: string,
    resolutionNotes?: string
  ): Promise<void> {
    await client.query(
      `
      UPDATE data_quality_audit
      SET status = 'resolved',
          resolved_by = $1,
          resolved_at = CURRENT_TIMESTAMP,
          resolution_notes = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [resolvedBy, resolutionNotes || null, issueId]
    );
  }
}





