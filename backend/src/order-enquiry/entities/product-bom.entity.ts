import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Item } from '../../items/entities/item.entity';

/**
 * Product BOM Entity
 *
 * Defines product BOM structure (legacy `mprodbom`).
 *
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/order-enquiry-process.md (Product BOM Structure)
 * - Documentation: docs/source/05-business-logic/core-algorithms.md (BOM Processing)
 *
 * Business Rules:
 * - Each (item_no, sub_item_no) pair is unique.
 * - qty is the BOM ratio used for sub-item quantity calculation:
 *   sub_item_qty = (head_qty * bom_qty) / total_bom_qty
 */
@Entity('product_bom')
@Unique(['itemNo', 'subItemNo'])
@Index(['itemNo'])
@Index(['subItemNo'])
export class ProductBom {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'item_no', type: 'varchar', length: 50 })
  itemNo: string;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_no', referencedColumnName: 'itemNo' })
  item: Item;

  @Column({ name: 'sub_item_no', type: 'varchar', length: 50 })
  subItemNo: string;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'sub_item_no', referencedColumnName: 'itemNo' })
  subItem: Item;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  qty: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
