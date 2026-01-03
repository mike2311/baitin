import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Customer Entity
 *
 * Represents customer master data in the system.
 *
 * Original Logic Reference:
 * - Legacy Table: mcustom (DBF)
 * - Documentation: docs/01-data-architecture/table-details/master-data-tables.md lines 136-177
 * - File Size: 576KB DBF + 394KB FPT
 *
 * Business Rules:
 * - cust_no must be unique
 * - Used for validation during OE import
 *
 * Reference: Task 03-01 - Master Data Tables Schema
 */
@Entity('customer')
@Index(['custNo'], { unique: true })
@Index(['ename'])
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cust_no', type: 'varchar', length: 50, unique: true })
  custNo: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  ename: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sname: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  cname: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  addr1: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  addr2: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  addr3: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  addr4: string;

  @Column({ name: 'cont_name', type: 'varchar', length: 100, nullable: true })
  contName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tel: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tel2: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fax: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fax2: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ name: 'show_sub_item_detail', type: 'boolean', default: false })
  showSubItemDetail: boolean;

  @Column({ name: 'cre_date', type: 'date', nullable: true })
  creDate: Date;

  @Column({ name: 'cre_user', type: 'varchar', length: 50, nullable: true })
  creUser: string;

  @Column({ name: 'mod_date', type: 'date', nullable: true })
  modDate: Date;

  @Column({ name: 'mod_user', type: 'varchar', length: 50, nullable: true })
  modUser: string;

  @Column({ name: 'user_id', type: 'varchar', length: 50, nullable: true })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
