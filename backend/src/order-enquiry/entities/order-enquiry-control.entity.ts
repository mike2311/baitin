import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Customer } from '../../customers/entities/customer.entity'

/**
 * Order Enquiry Control Entity
 * 
 * Validation checkpoint before OE creation. Must exist before OE import
 * (except for INSP company which adds "IN-" prefix automatically).
 * 
 * Original Logic Reference:
 * - Legacy Table: moectrl (DBF)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md lines 44-69
 * - Purpose: Validation checkpoint before OE creation
 * 
 * Business Rules:
 * - oe_no must be unique
 * - cust_no must exist in customer table
 * - Required before OE import (except INSP company)
 * 
 * Special Cases:
 * - INSP company: Automatically prefixes OE number with "IN-"
 * 
 * Reference: Task 03-02 - Order Enquiry Tables Schema
 */
@Entity('order_enquiry_control')
@Index(['oeNo'], { unique: true })
@Index(['custNo'])
export class OrderEnquiryControl {
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

  @Column({ type: 'varchar', length: 20, nullable: true })
  status: string

  @Column({ name: 'po_no', type: 'varchar', length: 100, nullable: true })
  poNo: string

  @Column({ type: 'text', nullable: true })
  remark: string

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


