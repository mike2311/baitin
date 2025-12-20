import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Customer } from '../../customers/entities/customer.entity'
import { OrderEnquiryDetail } from './order-enquiry-detail.entity'

/**
 * Order Enquiry Header Entity
 * 
 * Represents OE header information.
 * 
 * Original Logic Reference:
 * - Legacy Table: moehd (DBF)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md
 * 
 * Business Rules:
 * - oe_no must be unique
 * - cust_no must exist in customer table
 * - status: 0=Draft, 1=Posted
 * 
 * Reference: Task 03-02 - Order Enquiry Tables Schema
 */
@Entity('order_enquiry_header')
@Index(['oeNo'], { unique: true })
@Index(['custNo'])
@Index(['status'])
@Index(['oeDate'])
export class OrderEnquiryHeader {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'oe_no', type: 'varchar', length: 50, unique: true })
  oeNo: string

  @Column({ name: 'cust_no', type: 'varchar', length: 50 })
  custNo: string

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'cust_no', referencedColumnName: 'custNo' })
  customer: Customer

  @Column({ name: 'oe_date', type: 'date' })
  oeDate: Date

  @Column({ name: 'po_no', type: 'varchar', length: 100, nullable: true })
  poNo: string

  @Column({ type: 'integer', default: 0 }) // 0=Draft, 1=Posted
  status: number

  @Column({ name: 'comp_code', type: 'varchar', length: 10, nullable: true })
  compCode: string // HT, BAT, INSP, HFW

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, nullable: true })
  totalAmount: number

  @Column({ type: 'text', nullable: true })
  remark: string

  @OneToMany(() => OrderEnquiryDetail, (detail) => detail.header, { cascade: true })
  details: OrderEnquiryDetail[]

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


