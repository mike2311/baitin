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
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderConfirmationDetail } from './order-confirmation-detail.entity';

/**
 * Order Confirmation Header Entity
 *
 * Legacy Table: `mordhd` (OC Header)
 *
 * Original Logic Reference:
 * - FoxPro: `uordcont.prg`, form `upostoe` / `iordhd`
 * - Documentation: docs/source/02-business-processes/order-confirmation-process.md
 * - Documentation: docs/source/01-data-architecture/table-details/transaction-tables.md (mordhd)
 */
@Entity('order_confirmation_header')
@Index(['confNo'], { unique: true })
@Index(['custNo'])
@Index(['date'])
@Index(['oeNo'])
export class OrderConfirmationHeader {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'conf_no', type: 'varchar', length: 50, unique: true })
  confNo: string;

  @Column({ name: 'oe_no', type: 'varchar', length: 50, nullable: true })
  oeNo: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'cust_no', type: 'varchar', length: 50 })
  custNo: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'cust_no', referencedColumnName: 'custNo' })
  customer: Customer;

  @Column({ name: 'req_date_fr', type: 'date', nullable: true })
  reqDateFr: Date;

  @Column({ name: 'req_date_to', type: 'date', nullable: true })
  reqDateTo: Date;

  @Column({ type: 'integer', default: 0 })
  status: number;

  @Column({ name: 'comp_code', type: 'varchar', length: 10, nullable: true })
  compCode: string;

  @Column({ name: 'user_id', type: 'varchar', length: 50, nullable: true })
  userId: string;

  @OneToMany(() => OrderConfirmationDetail, (d) => d.header, { cascade: true })
  details: OrderConfirmationDetail[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
