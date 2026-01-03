import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Origin Reference Entity
 *
 * Reference table for country of origin codes used in item master.
 *
 * Reference: Task 03-01 - Master Data Tables Schema
 */
@Entity('zorigin')
@Index(['origin'], { unique: true })
export class Zorigin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  origin: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
