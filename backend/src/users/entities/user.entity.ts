import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

/**
 * User Entity
 * 
 * Represents a user in the system with authentication and authorization information.
 * 
 * Original Logic Reference:
 * - Table: muser (from legacy FoxPro system)
 * - Documentation: docs/00-overview/user-roles.md
 * 
 * Business Rules:
 * - user_right: SUPERVISOR or REGULAR_USER
 * - company_code: HT, BAT, INSP, or HFW
 * 
 * Reference: Task 02-01 - Authentication Framework Setup
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  username: string

  @Column()
  password: string

  @Column({ name: 'user_right', type: 'varchar', length: 50 })
  userRight: string // SUPERVISOR or REGULAR_USER

  @Column({ name: 'company_code', type: 'varchar', length: 10 })
  companyCode: string // HT, BAT, INSP, HFW

  @Column({ default: true })
  active: boolean

  @CreateDateColumn({ name: 'cre_date' })
  creDate: Date

  @UpdateDateColumn({ name: 'mod_date' })
  modDate: Date
}


