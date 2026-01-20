import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LoadingAdviceHeader } from './loading-advice-header.entity';

/**
 * Loading Advice Detail Entity
 *
 * Represents loading advice line items.
 *
 * Original Logic Reference:
 * - Legacy Table: mladt (4.4MB + 16MB FPT in legacy)
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Contains item-level loading information
 *   - Tracks container assignments
 *   - Records loading positions
 *
 * Reference: Phase 3 - Loading Module
 */
@Entity('loading_advice_detail')
@Index(['itemNo'])
export class LoadingAdviceDetail {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  laNo: string; // Loading Advice number (FK)

  @PrimaryColumn({ type: 'varchar', length: 20 })
  itemNo: string; // Item number (FK to item)

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  qty: number; // Loading quantity

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  ctn?: number; // Carton quantity

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  weight?: number; // Weight

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  cube?: number; // Cube

  @Column({ type: 'varchar', length: 50, nullable: true })
  containerNo?: string; // Container number

  @Column({ type: 'varchar', length: 50, nullable: true })
  position?: string; // Loading position

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
  @ManyToOne(() => LoadingAdviceHeader, (header) => header.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'laNo' })
  header?: LoadingAdviceHeader;

  // Relations (will be added when related entities are available)
  // @ManyToOne(() => Item)
  // @JoinColumn({ name: 'itemNo' })
  // item?: Item;
}
