import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeliveryNoteHeader } from './delivery-note-header.entity';

/**
 * Delivery Note Detail Entity
 *
 * Represents delivery note line items.
 *
 * Original Logic Reference:
 * - Legacy Table: mdndt (DBF)
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Created from SO items
 *   - Links to OC and SO for tracking
 *   - Supports container and reference numbers
 *   - BOM items have head = false
 *
 * Reference: Phase 3 - Delivery Note Module
 */
@Entity('delivery_note_detail')
@Index(['itemNo'])
@Index(['dnNo', 'itemNo'])
export class DeliveryNoteDetail {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  dnNo: string; // Delivery Note number (FK)

  @PrimaryColumn({ type: 'varchar', length: 20 })
  itemNo: string; // Item number (FK to item)

  @PrimaryColumn({ type: 'integer' })
  lineNo: number; // Line number

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  qty: number; // Delivery quantity

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  ctn?: number; // Carton quantity

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  qctn?: number; // Quantity per carton

  @Column({ type: 'varchar', length: 10, nullable: true })
  unit?: string; // Unit of measure

  @Column({ type: 'text', nullable: true })
  itemDesc?: string; // Item description

  @Column({ type: 'varchar', length: 50, nullable: true })
  poNo?: string; // Purchase Order number

  @Column({ type: 'varchar', length: 50, nullable: true })
  shipNo?: string; // Shipment number

  @Column({ type: 'varchar', length: 50, nullable: true })
  cntrNo?: string; // Container number

  @Column({ type: 'varchar', length: 50, nullable: true })
  refNo?: string; // Reference number

  @Column({ type: 'varchar', length: 20, nullable: true })
  ocNo?: string; // Order Confirmation number

  @Column({ type: 'varchar', length: 20, nullable: true })
  confNo?: string; // Order Confirmation number

  @Column({ type: 'boolean', default: true })
  head: boolean; // Head item flag (for BOM)

  @Column({ type: 'varchar', length: 50, nullable: true })
  userId?: string; // User ID

  @Column({ type: 'varchar', length: 50, nullable: true })
  creUser?: string; // Creator user

  @CreateDateColumn({ type: 'timestamp' })
  creDate: Date; // Creation date

  @UpdateDateColumn({ type: 'timestamp' })
  modDate: Date; // Modification date

  // Relations
  @ManyToOne(() => DeliveryNoteHeader, (header) => header.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dnNo' })
  header?: DeliveryNoteHeader;

  // Relations (will be added when related entities are available)
  // @ManyToOne(() => Item)
  // @JoinColumn({ name: 'itemNo' })
  // item?: Item;
}