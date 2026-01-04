import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEnquiryHeader } from './order-enquiry-header.entity';
import { Item } from '../../items/entities/item.entity';

/**
 * Order Enquiry Quantity Breakdown Entity
 *
 * Stores quantity breakdowns for OE items (legacy `mqtybrk`).
 *
 * Original Logic Reference:
 * - FoxPro Program: `uoexls_2013.prg` (procedure `update_mqtybrk`)
 * - Documentation: docs/source/02-business-processes/order-enquiry-process.md (Quantity Breakdown Processing)
 * - Documentation: docs/source/01-data-architecture/table-details/supporting-tables.md (mqtybrk)
 *
 * Business Rules:
 * - Records are created during OE import or manual entry.
 * - Breakdown may be by PORT/PO/date range and/or by size/color/style codes.
 *
 * Notes:
 * - This table intentionally supports both patterns described in docs.
 */
@Entity('order_enquiry_qty_breakdown')
@Index(['oeNo', 'itemNo'])
@Index(['oeNo', 'port'])
@Index(['oeNo', 'poNo'])
export class OrderEnquiryQtyBreakdown {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'oe_no', type: 'varchar', length: 50 })
  oeNo: string;

  @ManyToOne(() => OrderEnquiryHeader, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'oe_no', referencedColumnName: 'oeNo' })
  header: OrderEnquiryHeader;

  @Column({ name: 'item_no', type: 'varchar', length: 50 })
  itemNo: string;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_no', referencedColumnName: 'itemNo' })
  item: Item;

  @Column({ type: 'varchar', length: 20, nullable: true })
  port: string;

  @Column({ name: 'po_no', type: 'varchar', length: 100, nullable: true })
  poNo: string;

  @Column({ name: 'del_from', type: 'date', nullable: true })
  delFrom: Date;

  @Column({ name: 'del_to', type: 'date', nullable: true })
  delTo: Date;

  @Column({ name: 'size_code', type: 'varchar', length: 20, nullable: true })
  sizeCode: string;

  @Column({ name: 'color_code', type: 'varchar', length: 20, nullable: true })
  colorCode: string;

  @Column({ name: 'style_code', type: 'varchar', length: 20, nullable: true })
  styleCode: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  qty: number;

  @Column({ name: 'user_id', type: 'varchar', length: 50, nullable: true })
  userId: string;

  @Column({ name: 'mod_date', type: 'date', nullable: true })
  modDate: Date;

  @Column({ name: 'mod_time', type: 'varchar', length: 8, nullable: true })
  modTime: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
