import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Report Definition Entity
 *
 * Stores report definitions and metadata for the 116+ reports.
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Report definitions stored in database
 *   - Supports parameterized reports
 *   - Export formats (PDF, Excel)
 *
 * Reference: Phase 3 - Reporting Module
 */
@Entity('report_definition')
@Index(['category'])
@Index(['status'])
export class ReportDefinition {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  reportKey: string; // Unique report identifier

  @Column({ type: 'varchar', length: 200 })
  reportName: string; // Report display name

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  category?: string; // Report category (Transaction, Summary, Analysis, Export)

  @Column({ type: 'text', nullable: true })
  description?: string; // Report description

  @Column({ type: 'text' })
  sqlQuery: string; // SQL query or query template

  @Column({ type: 'jsonb', nullable: true })
  parameters?: any; // Report parameters definition

  @Column({ type: 'jsonb', nullable: true })
  formatConfig?: any; // Format configuration (columns, grouping, etc.)

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  @Index()
  status: string; // Active/Inactive/Migrated

  @Column({ type: 'varchar', length: 50, nullable: true })
  legacyReportFile?: string; // Original .frx file name

  @Column({ type: 'varchar', length: 50, nullable: true })
  creUser?: string; // Creator user

  @CreateDateColumn({ type: 'timestamp' })
  creDate: Date; // Creation date

  @UpdateDateColumn({ type: 'timestamp' })
  modDate: Date; // Modification date
}
