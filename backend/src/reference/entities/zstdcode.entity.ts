import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Standard Code Reference Entity
 *
 * Reference table for standard codes used in item master.
 *
 * Reference: Task 03-01 - Master Data Tables Schema
 */
@Entity('zstdcode')
@Index(['stdCode'], { unique: true })
export class Zstdcode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'std_code', type: 'varchar', length: 50, unique: true })
  stdCode: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
