import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * SO Format Entity
 *
 * Customer-specific shipping order format configurations.
 *
 * Original Logic Reference:
 * - Legacy Table: zsoformat
 * - Documentation: docs/source/02-business-processes/shipping-process.md
 * - Business Rules:
 *   - Stores format layout for customer-specific SO printing
 *   - Used by pso.prg for format application
 *   - vpos/hpos define element positioning
 *   - height/width define element sizing
 *
 * Reference: Phase 3 - Shipping Order Module
 */
@Entity('zsoformat')
export class SoFormat {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  soKey: string; // Format key (e.g., "GLOBE")

  @PrimaryColumn({ type: 'varchar', length: 100 })
  uniqueid: string; // Unique identifier for format element

  @Column({ type: 'varchar', length: 100, nullable: true })
  soName?: string; // Format name

  @Column({ type: 'varchar', length: 100, nullable: true })
  fieldName?: string; // Field name (upper case of expr)

  @Column({ type: 'varchar', length: 200, nullable: true })
  name?: string; // Display name

  @Column({ type: 'text', nullable: true })
  expr?: string; // Expression/field reference

  @Column({ type: 'integer', nullable: true })
  vpos?: number; // Vertical position

  @Column({ type: 'integer', nullable: true })
  hpos?: number; // Horizontal position

  @Column({ type: 'integer', nullable: true })
  height?: number; // Height

  @Column({ type: 'integer', nullable: true })
  width?: number; // Width

  @Column({ type: 'varchar', length: 50, nullable: true })
  fontface?: string; // Font face

  @Column({ type: 'varchar', length: 50, nullable: true })
  fontstyle?: string; // Font style

  @Column({ type: 'integer', nullable: true })
  fontsize?: number; // Font size

  @Column({ type: 'boolean', nullable: true })
  print?: boolean; // Whether to print this element
}
