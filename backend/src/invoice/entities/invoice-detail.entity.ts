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
import { InvoiceHeader } from './invoice-header.entity';

/**
 * Invoice Detail Entity
 *
 * Represents invoice line items.
 *
 * Original Logic Reference:
 * - Legacy Table: minvdt (123MB + 178MB FPT in legacy)
 * - Documentation: docs/source/02-business-processes/invoice-process.md
 * - Business Rules:
 *   - Created from SO or DN details
 *   - Container/ref-driven selection logic
 *   - BOM items have head = false
 *   - Large description memo fields
 *   - Multi-page invoice support
 *
 * Reference: Phase 3 - Invoice Module
 */
@Entity('invoice_detail')
@Index(['itemNo'])
@Index(['soNo'])
@Index(['invNo', 'itemNo'])
export class InvoiceDetail {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  invNo: string; // Invoice number (FK)

  @PrimaryColumn({ type: 'varchar', length: 20 })
  itemNo: string; // Item number (FK to item)

  @PrimaryColumn({ type: 'integer' })
  lineNo: number; // Line number

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  qty: number; // Invoice quantity

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  price?: number; // Invoice price

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount?: number; // Line amount (calculated)

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  ctn?: number; // Carton quantity

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  qctn?: number; // Quantity per carton

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  net?: number; // Net weight

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  wt?: number; // Gross weight

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  cube?: number; // Cube measurement

  @Column({ type: 'varchar', length: 50, nullable: true })
  dim?: string; // Dimensions

  @Column({ type: 'varchar', length: 10, nullable: true })
  unit?: string; // Unit of measure

  @Column({ type: 'text', nullable: true })
  despMemo?: string; // Description memo (large text)

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

  @Column({ type: 'varchar', length: 20, nullable: true })
  soNo?: string; // Shipping Order number (FK to shipping_order)

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
  @ManyToOne(() => InvoiceHeader, (header) => header.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invNo' })
  header?: InvoiceHeader;

  // Relations (will be added when related entities are available)
  // @ManyToOne(() => Item)
  // @JoinColumn({ name: 'itemNo' })
  // item?: Item;

  // @ManyToOne(() => ShippingOrder)
  // @JoinColumn({ name: 'soNo' })
  // shippingOrder?: ShippingOrder;
}
