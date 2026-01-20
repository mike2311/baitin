import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { LoadingAdviceHeader } from './loading-advice-header.entity';

/**
 * Loading Master Entity
 *
 * Represents loading master records for container coordination.
 *
 * Original Logic Reference:
 * - Legacy Table: mload (10MB in legacy)
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Coordinates multiple DNs for container loading
 *   - Tracks vessel, voyage, and container information
 *   - Calculates total weight, cube, and cartons
 *   - Status: Planned → In Progress → Completed
 *
 * Reference: Phase 3 - Loading Module
 */
@Entity('loading_master')
@Index(['date'])
@Index(['status'])
export class LoadingMaster {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  loadingNo: string; // Loading master number

  @Column({ type: 'date' })
  date: Date; // Loading date

  @Column({ type: 'varchar', length: 100, nullable: true })
  vesselName?: string; // Vessel name

  @Column({ type: 'varchar', length: 50, nullable: true })
  voyageNo?: string; // Voyage number

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalWeight?: number; // Total weight

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalCube?: number; // Total cube

  @Column({ type: 'integer', nullable: true })
  totalCartons?: number; // Total cartons

  @Column({ type: 'text', nullable: true })
  remarks?: string; // Remarks

  @Column({ type: 'varchar', length: 20, default: 'Planned' })
  status: string; // Planned/In Progress/Completed

  @Column({ type: 'varchar', length: 50, nullable: true })
  userId?: string; // User ID

  @Column({ type: 'varchar', length: 50, nullable: true })
  creUser?: string; // Creator user

  @CreateDateColumn({ type: 'timestamp' })
  creDate: Date; // Creation date

  @UpdateDateColumn({ type: 'timestamp' })
  modDate: Date; // Modification date

  // Relations
  @OneToMany(() => LoadingAdviceHeader, (advice) => advice.loadingMaster, {
    cascade: true,
  })
  adviceHeaders?: LoadingAdviceHeader[];
}
