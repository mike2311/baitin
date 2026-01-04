import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ContractDetail } from './contract-detail.entity';

/**
 * Contract Header Entity
 *
 * Legacy Table: `mconthd`
 *
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/contract-process.md
 * - Documentation: docs/source/01-data-architecture/table-details/transaction-tables.md (mconthd)
 *
 * Business Rules:
 * - Generated from OC and grouped by vendor (`vendor_no`)
 * - One contract per vendor per OC
 */
@Entity('contract_header')
@Index(['contNo'], { unique: true })
@Index(['confNo'])
@Index(['vendorNo'])
export class ContractHeader {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'cont_no', type: 'varchar', length: 50, unique: true })
  contNo: string;

  @Column({ name: 'conf_no', type: 'varchar', length: 50 })
  confNo: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'vendor_no', type: 'varchar', length: 50 })
  vendorNo: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payment: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'req_date_fr', type: 'date', nullable: true })
  reqDateFr: Date;

  @Column({ name: 'req_date_to', type: 'date', nullable: true })
  reqDateTo: Date;

  @Column({ name: 'cur_code', type: 'varchar', length: 20, nullable: true })
  curCode: string;

  @Column({ name: 'ship_to', type: 'varchar', length: 50, nullable: true })
  shipTo: string;

  @Column({ type: 'integer', default: 0 })
  status: number;

  @Column({ name: 'user_id', type: 'varchar', length: 50, nullable: true })
  userId: string;

  @OneToMany(() => ContractDetail, (d) => d.header, { cascade: true })
  details: ContractDetail[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
