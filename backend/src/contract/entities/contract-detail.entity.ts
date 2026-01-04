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
import { ContractHeader } from './contract-header.entity';
import { Item } from '../../items/entities/item.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';

/**
 * Contract Detail Entity
 *
 * Legacy Table: `mcontdt`
 *
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/contract-process.md
 * - Documentation: docs/source/01-data-architecture/table-details/transaction-tables.md (mcontdt)
 *
 * Business Rules:
 * - Generated from OC items (`morddt`) filtered/grouped by vendor_no
 * - BOM head/sub-items copied with `head` flag and recalculated quantities
 */
@Entity('contract_detail')
@Index(['contNo'])
@Index(['confNo'])
@Index(['itemNo'])
@Index(['vendorNo'])
@Index(['head'])
@Unique(['contNo', 'lineNo'])
export class ContractDetail {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'cont_no', type: 'varchar', length: 50 })
  contNo: string;

  @ManyToOne(() => ContractHeader, (h) => h.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cont_no', referencedColumnName: 'contNo' })
  header: ContractHeader;

  @Column({ name: 'conf_no', type: 'varchar', length: 50 })
  confNo: string;

  @Column({ name: 'line_no', type: 'integer' })
  lineNo: number;

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

  @Column({ type: 'boolean', default: false })
  head: boolean;

  @Column({ name: 'desc_memo', type: 'text', nullable: true })
  descMemo: string;

  @Column({ name: 'item_memo', type: 'text', nullable: true })
  itemMemo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
