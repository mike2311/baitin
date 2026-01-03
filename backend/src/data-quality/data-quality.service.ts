import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Data Quality Service
 *
 * Provides data quality tracking and management functionality.
 *
 * Original Logic Reference:
 * - Documentation: backend/migration-cli/docs/data-quality-report.md
 */
@Injectable()
export class DataQualityService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get data quality summary statistics
   */
  async getSummary() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Count orphaned records by type
      const itemOriginResult = await queryRunner.query(`
        SELECT COUNT(*) as count
        FROM item i
        WHERE i.origin IS NOT NULL AND i.origin != ''
        AND NOT EXISTS (SELECT 1 FROM zorigin z WHERE z.origin = i.origin)
      `);

      const oeControlResult = await queryRunner.query(`
        SELECT COUNT(*) as count
        FROM order_enquiry_control oec
        WHERE oec.cust_no IS NOT NULL AND oec.cust_no != ''
        AND NOT EXISTS (SELECT 1 FROM customer c WHERE c.cust_no = oec.cust_no)
      `);

      const oeHeaderResult = await queryRunner.query(`
        SELECT COUNT(*) as count
        FROM order_enquiry_header oeh
        WHERE oeh.cust_no IS NOT NULL AND oeh.cust_no != ''
        AND NOT EXISTS (SELECT 1 FROM customer c WHERE c.cust_no = oeh.cust_no)
      `);

      const oeDetailResult = await queryRunner.query(`
        SELECT COUNT(*) as count
        FROM order_enquiry_detail oed
        WHERE oed.oe_no IS NOT NULL AND oed.oe_no != ''
        AND NOT EXISTS (SELECT 1 FROM order_enquiry_header oeh WHERE oeh.oe_no = oed.oe_no)
      `);

      // Get audit table statistics
      const auditStats = await queryRunner.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM data_quality_audit
        GROUP BY status
      `);

      return {
        orphanedRecords: {
          itemOrigin: parseInt(itemOriginResult[0].count, 10),
          oeControlCustomer: parseInt(oeControlResult[0].count, 10),
          oeHeaderCustomer: parseInt(oeHeaderResult[0].count, 10),
          oeDetailHeader: parseInt(oeDetailResult[0].count, 10),
        },
        auditStatus: auditStats.reduce((acc: any, row: any) => {
          acc[row.status] = parseInt(row.count, 10);
          return acc;
        }, {}),
        timestamp: new Date().toISOString(),
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get all data quality issues
   */
  async getIssues(status?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      let query = `
        SELECT 
          id,
          source_table,
          target_table,
          fk_field,
          fk_value,
          orphaned_count,
          status,
          resolution_notes,
          resolved_by,
          resolved_at,
          created_at,
          updated_at
        FROM data_quality_audit
      `;

      const params: any[] = [];
      if (status) {
        query += ' WHERE status = $1';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const issues = await queryRunner.query(query, params);

      return issues.map((issue: any) => ({
        id: issue.id,
        sourceTable: issue.source_table,
        targetTable: issue.target_table,
        fkField: issue.fk_field,
        fkValue: issue.fk_value,
        orphanedCount: issue.orphaned_count,
        status: issue.status,
        resolutionNotes: issue.resolution_notes,
        resolvedBy: issue.resolved_by,
        resolvedAt: issue.resolved_at,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
      }));
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get specific issue by ID
   */
  async getIssue(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const result = await queryRunner.query(
        `
        SELECT 
          id,
          source_table,
          target_table,
          fk_field,
          fk_value,
          orphaned_count,
          status,
          resolution_notes,
          resolved_by,
          resolved_at,
          created_at,
          updated_at
        FROM data_quality_audit
        WHERE id = $1
        `,
        [id],
      );

      if (result.length === 0) {
        throw new NotFoundException(`Issue with ID ${id} not found`);
      }

      const issue = result[0];
      return {
        id: issue.id,
        sourceTable: issue.source_table,
        targetTable: issue.target_table,
        fkField: issue.fk_field,
        fkValue: issue.fk_value,
        orphanedCount: issue.orphaned_count,
        status: issue.status,
        resolutionNotes: issue.resolution_notes,
        resolvedBy: issue.resolved_by,
        resolvedAt: issue.resolved_at,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update issue status
   */
  async updateIssue(
    id: number,
    status: string,
    notes?: string,
    resolvedBy?: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const validStatuses = [
        'pending',
        'in_review',
        'resolved',
        'approved_as_is',
      ];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        );
      }

      await queryRunner.query(
        `
        UPDATE data_quality_audit
        SET status = $1,
            resolution_notes = $2,
            resolved_by = $3,
            resolved_at = CASE WHEN $1 IN ('resolved', 'approved_as_is') THEN CURRENT_TIMESTAMP ELSE resolved_at END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        `,
        [status, notes || null, resolvedBy || null, id],
      );

      return this.getIssue(id);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Resolve an issue
   */
  async resolveIssue(id: number, notes?: string, resolvedBy?: string) {
    return this.updateIssue(id, 'resolved', notes, resolvedBy);
  }
}
