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
} from 'typeorm'
import { OrderEnquiryHeader } from './order-enquiry-header.entity'
import { Item } from '../../items/entities/item.entity'
import { Vendor } from '../../vendors/entities/vendor.entity'

/**
 * Order Enquiry Detail Entity
 * 
 * Represents OE line items.
 * 
 * Original Logic Reference:
 * - Legacy Table: moe (DBF)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md
 * 
 * Business Rules:
 * - oe_no must exist in order_enquiry_header
 * - item_no must exist in item table
 * - line_no unique per oe_no
 * - qty must be > 0
 * - price must be >= 0
 * - head flag: True for BOM head items
 * 
 * Reference: Task 03-02 - Order Enquiry Tables Schema
 */
@Entity('order_enquiry_detail')
@Index(['oeNo'])
@Index(['itemNo'])
@Index(['vendorNo'])
@Index(['head'])
@Unique(['oeNo', 'lineNo'])
export class OrderEnquiryDetail {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'oe_no', type: 'varchar', length: 50 })
  oeNo: string

  @ManyToOne(() => OrderEnquiryHeader, (header) => header.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'oe_no', referencedColumnName: 'oeNo' })
  header: OrderEnquiryHeader

  @Column({ name: 'line_no', type: 'integer' })
  lineNo: number

  @Column({ name: 'item_no', type: 'varchar', length: 50 })
  itemNo: string

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_no', referencedColumnName: 'itemNo' })
  item: Item

  @Column({ name: 'cust_no', type: 'varchar', length: 50, nullable: true })
  custNo: string

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  qty: number

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  price: number

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true }) // qty * price
  amount: number

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string

  @Column({ type: 'integer', nullable: true })
  ctn: number

  @Column({ type: 'boolean', default: false }) // True for BOM head items
  head: boolean

  @Column({ name: 'vendor_no', type: 'varchar', length: 50, nullable: true })
  vendorNo: string

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_no', referencedColumnName: 'vendorNo' })
  vendor: Vendor

  @Column({ type: 'varchar', length: 100, nullable: true })
  maker: string

  @Column({ name: 'skn_no', type: 'varchar', length: 100, nullable: true })
  sknNo: string

  @Column({ name: 'item_desc', type: 'text', nullable: true })
  itemDesc: string

  @Column({ name: 'pack_pc_1', type: 'integer', nullable: true })
  packPc1: number

  @Column({ name: 'pack_desp_1', type: 'varchar', length: 50, nullable: true })
  packDesp1: string

  @Column({ name: 'pack_pc_2', type: 'integer', nullable: true })
  packPc2: number

  @Column({ name: 'pack_desp_2', type: 'varchar', length: 50, nullable: true })
  packDesp2: string

  @Column({ name: 'pack_pc_3', type: 'integer', nullable: true })
  packPc3: number

  @Column({ name: 'pack_desp_3', type: 'varchar', length: 50, nullable: true })
  packDesp3: string

  @Column({ name: 'pack_pc_4', type: 'integer', nullable: true })
  packPc4: number

  @Column({ name: 'pack_desp_4', type: 'varchar', length: 50, nullable: true })
  packDesp4: string

  @Column({ name: 'del_from', type: 'date', nullable: true })
  delFrom: Date

  @Column({ name: 'del_to', type: 'date', nullable: true })
  delTo: Date

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  cost: number

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  retail1: number

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  retail2: number

  @Column({ type: 'text', nullable: true })
  remark: string

  @Column({ name: 'comp_code', type: 'varchar', length: 10, nullable: true })
  compCode: string

  @Column({ name: 'cre_date', type: 'date', nullable: true })
  creDate: Date

  @Column({ name: 'cre_user', type: 'varchar', length: 50, nullable: true })
  creUser: string

  @Column({ name: 'mod_date', type: 'date', nullable: true })
  modDate: Date

  @Column({ name: 'mod_user', type: 'varchar', length: 50, nullable: true })
  modUser: string

  @Column({ name: 'user_id', type: 'varchar', length: 50, nullable: true })
  userId: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}


