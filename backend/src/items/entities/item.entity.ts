import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Item Entity
 *
 * Represents item master data in the system.
 *
 * Original Logic Reference:
 * - Legacy Table: mitem (DBF)
 * - Documentation: docs/01-data-architecture/table-details/master-data-tables.md lines 5-49
 * - File Size: 11MB DBF + 24MB FPT (memo)
 *
 * Business Rules:
 * - item_no must be unique
 * - std_code validated against zstdcode table
 * - origin validated against zorigin table
 *
 * Reference: Task 03-01 - Master Data Tables Schema
 */
@Entity('item')
@Index(['itemNo'], { unique: true })
@Index(['stdCode'])
@Index(['origin'])
@Index(['grpCode'])
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'item_no', type: 'varchar', length: 50, unique: true })
  itemNo: string;

  @Column({ name: 'item_type', type: 'varchar', length: 20, nullable: true })
  itemType: string;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ name: 'short_name', type: 'varchar', length: 100, nullable: true })
  shortName: string;

  @Column({ type: 'text', nullable: true }) // Memo field converted to TEXT
  desp: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  origin: string;

  @Column({ name: 'grp_code', type: 'varchar', length: 20, nullable: true })
  grpCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material: string;

  @Column({ name: 'upc_no', type: 'varchar', length: 50, nullable: true })
  upcNo: string;

  @Column({ name: 'htc_no', type: 'varchar', length: 50, nullable: true })
  htcNo: string;

  @Column({ name: 'std_code', type: 'varchar', length: 50, nullable: true })
  stdCode: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  price: number;

  @Column({ name: 'price_cur', type: 'varchar', length: 3, nullable: true })
  priceCur: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  cost: number;

  @Column({ name: 'pack_pc_1', type: 'integer', nullable: true })
  packPc1: number;

  @Column({ name: 'pack_desp_1', type: 'varchar', length: 50, nullable: true })
  packDesp1: string;

  @Column({ name: 'pack_pc_2', type: 'integer', nullable: true })
  packPc2: number;

  @Column({ name: 'pack_desp_2', type: 'varchar', length: 50, nullable: true })
  packDesp2: string;

  @Column({ name: 'pack_pc_3', type: 'integer', nullable: true })
  packPc3: number;

  @Column({ name: 'pack_desp_3', type: 'varchar', length: 50, nullable: true })
  packDesp3: string;

  @Column({ name: 'pack_pc_4', type: 'integer', nullable: true })
  packPc4: number;

  @Column({ name: 'pack_desp_4', type: 'varchar', length: 50, nullable: true })
  packDesp4: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  wt: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  net: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cube: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dim: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  duty: number;

  @Column({ name: 'suspend_flag', type: 'boolean', default: false })
  suspendFlag: boolean;

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
