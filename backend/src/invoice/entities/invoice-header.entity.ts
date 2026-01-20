import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { InvoiceDetail } from './invoice-detail.entity';

/**
 * Invoice Header Entity
 *
 * Represents invoice header records.
 *
 * Original Logic Reference:
 * - Legacy Table: minvhd (93MB in legacy)
 * - Documentation: docs/source/02-business-processes/invoice-process.md
 * - Business Rules:
 *   - Created from SO or DN
 *   - Links to OC for tracking
 *   - Supports multi-page invoices
 *   - Packing list status tracking
 *
 * Reference: Phase 3 - Invoice Module
 */
@Entity('invoice_header')
@Index(['custNo'])
@Index(['ocNo'])
@Index(['date'])
export class InvoiceHeader {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  invNo: string; // Invoice number

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  custNo?: string; // Customer number (FK to customer)

  @Column({ type: 'date' })
  @Index()
  date: Date; // Invoice date

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  ocNo?: string; // Order Confirmation number (FK to order_confirmation_header)

  @Column({ type: 'varchar', length: 100, nullable: true })
  ship?: string; // Shipment information

  @Column({ type: 'date', nullable: true })
  delDate?: Date; // Delivery date

  @Column({ type: 'varchar', length: 100, nullable: true })
  loadingPort?: string; // Loading port

  @Column({ type: 'varchar', length: 100, nullable: true })
  dest?: string; // Destination

  @Column({ type: 'varchar', length: 200, nullable: true })
  paymentTerms?: string; // Payment terms

  @Column({ type: 'text', nullable: true })
  remarks?: string; // Remarks

  @Column({ type: 'varchar', length: 20, default: 'Not Printed' })
  plStatus: string; // Packing List status (Not Printed/Printed)

  @Column({ type: 'varchar', length: 20, default: 'Not Printed' })
  plShStatus: string; // Packing List Ship Mark status (Not Printed/Printed)

  @Column({ type: 'varchar', length: 50, nullable: true })
  userId?: string; // User ID

  @Column({ type: 'varchar', length: 50, nullable: true })
  creUser?: string; // Creator user

  @CreateDateColumn({ type: 'timestamp' })
  creDate: Date; // Creation date

  @UpdateDateColumn({ type: 'timestamp' })
  modDate: Date; // Modification date

  // Relations
  @OneToMany(() => InvoiceDetail, (detail) => detail.header, { cascade: true })
  details?: InvoiceDetail[];

  // Relations (will be added when related entities are available)
  // @ManyToOne(() => Customer)
  // @JoinColumn({ name: 'custNo' })
  // customer?: Customer;

  // @ManyToOne(() => OrderConfirmationHeader)
  // @JoinColumn({ name: 'ocNo' })
  // orderConfirmation?: OrderConfirmationHeader;
}
