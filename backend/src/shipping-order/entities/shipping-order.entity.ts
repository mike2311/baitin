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

/**
 * Shipping Order Entity
 *
 * Represents shipping orders for delivery coordination.
 *
 * Original Logic Reference:
 * - Legacy Table: mso (DBF) - 279MB (largest transaction table)
 * - Documentation: docs/source/02-business-processes/shipping-process.md
 * - Business Rules:
 *   - Created from Order Confirmations and Contracts
 *   - Links to customer ship marks and FOB terms
 *   - Supports customer-specific format configurations
 *   - Used for invoice generation
 *
 * Reference: Phase 3 - Shipping Order Module
 */
@Entity('shipping_order')
@Index(['confNo'])
@Index(['contNo'])
@Index(['itemNo'])
@Index(['soNo', 'itemNo'])
@Index(['shipDate'])
export class ShippingOrder {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  soNo: string; // Shipping Order number

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  confNo?: string; // Order Confirmation number (FK to order_confirmation_header)

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  contNo?: string; // Contract number (FK to contract_header)

  @Column({ type: 'varchar', length: 20 })
  @Index()
  itemNo: string; // Item number (FK to item)

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  qty: number; // Shipping quantity

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  ctn?: number; // Carton quantity

  @Column({ type: 'date', nullable: true })
  @Index()
  shipDate?: Date; // Shipping date

  @Column({ type: 'text', nullable: true })
  shipMark?: string; // Shipping mark (from customer memo)

  @Column({ type: 'varchar', length: 50, nullable: true })
  fobPort?: string; // FOB port (from contract or default)

  @Column({ type: 'varchar', length: 50, nullable: true })
  poNo?: string; // Purchase Order number

  @Column({ type: 'varchar', length: 20, nullable: true })
  ocNo?: string; // Order Confirmation number

  @Column({ type: 'varchar', length: 100, nullable: true })
  shipTo?: string; // Ship to location

  @Column({ type: 'varchar', length: 100, nullable: true })
  loadingPort?: string; // Loading port

  @Column({ type: 'varchar', length: 100, nullable: true })
  dest?: string; // Destination

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

  // Relations (will be added when related entities are available)
  // @ManyToOne(() => OrderConfirmationHeader)
  // @JoinColumn({ name: 'confNo' })
  // orderConfirmation?: OrderConfirmationHeader;

  // @ManyToOne(() => ContractHeader)
  // @JoinColumn({ name: 'contNo' })
  // contract?: ContractHeader;

  // @ManyToOne(() => Item)
  // @JoinColumn({ name: 'itemNo' })
  // item?: Item;
}
