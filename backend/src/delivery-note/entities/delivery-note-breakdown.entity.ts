import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Delivery Note Breakdown Entity
 *
 * Represents quantity breakdowns for delivery notes.
 *
 * Original Logic Reference:
 * - Legacy Table: mdnbrk (DBF)
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Breakdowns typically copied from OE quantity breakdowns
 *   - Tracks quantities by port, PO, or other criteria
 *   - Used for detailed delivery tracking
 *
 * Reference: Phase 3 - Delivery Note Module
 */
@Entity('delivery_note_breakdown')
@Index(['dnNo', 'itemNo'])
export class DeliveryNoteBreakdown {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  dnNo: string; // Delivery Note number (FK)

  @PrimaryColumn({ type: 'varchar', length: 20 })
  itemNo: string; // Item number (FK to item)

  @PrimaryColumn({ type: 'varchar', length: 50 })
  port: string; // Port

  @PrimaryColumn({ type: 'varchar', length: 50 })
  poNo: string; // Purchase Order number

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  qty?: number; // Breakdown quantity

  @Column({ type: 'date', nullable: true })
  delFrom?: Date; // Delivery from date

  @Column({ type: 'date', nullable: true })
  delTo?: Date; // Delivery to date

  @Column({ type: 'varchar', length: 50, nullable: true })
  userId?: string; // User ID

  @Column({ type: 'varchar', length: 50, nullable: true })
  creUser?: string; // Creator user

  @CreateDateColumn({ type: 'timestamp' })
  creDate: Date; // Creation date

  @UpdateDateColumn({ type: 'timestamp' })
  modDate: Date; // Modification date
}