import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { DeliveryNoteDetail } from './delivery-note-detail.entity';

/**
 * Delivery Note Header Entity
 *
 * Represents delivery note header records.
 *
 * Original Logic Reference:
 * - Legacy Table: mdnhd (DBF)
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Created from Shipping Orders
 *   - Links to SO for tracking
 *   - Supports loading coordination
 *   - Status transitions: Created → Loading → Shipped → Delivered → Invoiced
 *
 * Reference: Phase 3 - Delivery Note Module
 */
@Entity('delivery_note_header')
@Index(['custNo'])
@Index(['soNo'])
@Index(['date'])
@Index(['loadingStatus'])
export class DeliveryNoteHeader {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  dnNo: string; // Delivery Note number

  @Column({ type: 'date' })
  @Index()
  date: Date; // DN date

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  custNo?: string; // Customer number (FK to customer)

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  soNo?: string; // Shipping Order number (FK to shipping_order)

  @Column({ type: 'varchar', length: 100, nullable: true })
  delAddr1?: string; // Delivery address line 1

  @Column({ type: 'varchar', length: 100, nullable: true })
  delAddr2?: string; // Delivery address line 2

  @Column({ type: 'varchar', length: 100, nullable: true })
  delAddr3?: string; // Delivery address line 3

  @Column({ type: 'varchar', length: 100, nullable: true })
  delAddr4?: string; // Delivery address line 4

  @Column({ type: 'date', nullable: true })
  delDate?: Date; // Delivery date

  @Column({ type: 'varchar', length: 20, default: 'Created' })
  @Index()
  loadingStatus: string; // Created/Loading/Shipped/Delivered/Invoiced

  @Column({ type: 'varchar', length: 50, nullable: true })
  loadingNo?: string; // Loading master number

  @Column({ type: 'text', nullable: true })
  remarks?: string; // Remarks

  @Column({ type: 'varchar', length: 50, nullable: true })
  userId?: string; // User ID

  @Column({ type: 'varchar', length: 50, nullable: true })
  creUser?: string; // Creator user

  @CreateDateColumn({ type: 'timestamp' })
  creDate: Date; // Creation date

  @UpdateDateColumn({ type: 'timestamp' })
  modDate: Date; // Modification date

  // Relations
  @OneToMany(() => DeliveryNoteDetail, (detail) => detail.header, {
    cascade: true,
  })
  details?: DeliveryNoteDetail[];

  // Relations (will be added when related entities are available)
  // @ManyToOne(() => Customer)
  // @JoinColumn({ name: 'custNo' })
  // customer?: Customer;

  // @ManyToOne(() => ShippingOrder)
  // @JoinColumn({ name: 'soNo' })
  // shippingOrder?: ShippingOrder;
}
