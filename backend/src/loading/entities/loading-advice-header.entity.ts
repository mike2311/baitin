import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { LoadingMaster } from './loading-master.entity';
import { LoadingAdviceDetail } from './loading-advice-detail.entity';

/**
 * Loading Advice Header Entity
 *
 * Represents loading advice header records.
 *
 * Original Logic Reference:
 * - Legacy Table: mlahd
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Generated from loading master
 *   - Contains vessel and voyage information
 *   - Links to loading master for coordination
 *
 * Reference: Phase 3 - Loading Module
 */
@Entity('loading_advice_header')
@Index(['loadingNo'])
export class LoadingAdviceHeader {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  laNo: string; // Loading Advice number

  @Column({ type: 'date' })
  date: Date; // Loading advice date

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  loadingNo?: string; // Loading master number (FK)

  @Column({ type: 'varchar', length: 100, nullable: true })
  vesselName?: string; // Vessel name

  @Column({ type: 'varchar', length: 50, nullable: true })
  voyageNo?: string; // Voyage number

  @Column({ type: 'text', nullable: true })
  remarks?: string; // Remarks

  @Column({ type: 'varchar', length: 50, nullable: true })
  userId?: string; // User ID

  @Column({ type: 'varchar', length: 50, nullable: true })
  creUser?: string; // Creator user

  @CreateDateColumn({ type: 'timestamp' })
  creDate: Date; // Creation date

  @UpdateDateColumn({ type: 'timestamp' })
  modDate: Date; // Modification date

  // Relations
  @ManyToOne(() => LoadingMaster, (master) => master.adviceHeaders)
  @JoinColumn({ name: 'loadingNo' })
  loadingMaster?: LoadingMaster;

  @OneToMany(() => LoadingAdviceDetail, (detail) => detail.header, { cascade: true })
  details?: LoadingAdviceDetail[];
}