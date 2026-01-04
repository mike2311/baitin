import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { OrderConfirmationHeader } from './order-confirmation-header.entity';
import { Item } from '../../items/entities/item.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';

/**
 * Order Confirmation Detail Entity
 *
 * Legacy Table: `morddt` (OC Detail)
 *
 * Original Logic Reference:
 * - FoxPro: `uordcont.prg` (procedures `update_morddt`)
 * - Documentation: docs/source/02-business-processes/order-confirmation-process.md
 * - Documentation: docs/source/01-data-architecture/table-details/transaction-tables.md (morddt)
 *
 * Business Rules:
 * - `head = true` for BOM head items, `head = false` for BOM sub-items.
 * - BOM formula: sub_item_qty = (head_qty * bom_qty) / total_bom_qty
 */
@Entity('order_confirmation_detail')
@Index(['confNo'])
@Index(['itemNo'])
@Index(['vendorNo'])
@Index(['oeNo'])
@Index(['head'])
@Unique(['confNo', 'lineNo'])
export class OrderConfirmationDetail {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'conf_no', type: 'varchar', length: 50 })
  confNo: string;

  @ManyToOne(() => OrderConfirmationHeader, (h) => h.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conf_no', referencedColumnName: 'confNo' })
  header: OrderConfirmationHeader;

  @Column({ name: 'line_no', type: 'integer' })
  lineNo: number;

  @Column({ name: 'oe_no', type: 'varchar', length: 50, nullable: true })
  oeNo: string;

  @Column({ name: 'item_no', type: 'varchar', length: 50 })
  itemNo: string;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_no', referencedColumnName: 'itemNo' })
  item: Item;

  @Column({ name: 'vendor_no', type: 'varchar', length: 50, nullable: true })
  vendorNo: string;

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_no', referencedColumnName: 'vendorNo' })
  vendor: Vendor;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  qty: number;

  @Column({ type: 'integer', nullable: true })
  ctn: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  cost: number;

  @Column({ name: 'po_no', type: 'varchar', length: 100, nullable: true })
  poNo: string;

  @Column({ type: 'boolean', default: false })
  head: boolean;

  @Column({ name: 'del_from', type: 'date', nullable: true })
  delFrom: Date;

  @Column({ name: 'del_to', type: 'date', nullable: true })
  delTo: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
