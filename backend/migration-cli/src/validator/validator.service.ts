/**
 * Validator Service
 * 
 * Validates uniqueness constraints, referential integrity, and required values.
 */

import { Pool } from 'pg';
import { TableMapping } from '../models/table-mapping.interface.js';
import { logger } from '../utils/logger.util.js';

export class ValidatorService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Validate uniqueness constraints
   */
  async validateUniqueness(tableMapping: TableMapping): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const targetTable = tableMapping.targetTable;
    const primaryKey = tableMapping.primaryKey;

    try {
      // Check for duplicate primary keys
      const query = `
        SELECT "${primaryKey}", COUNT(*) as count
        FROM "${targetTable}"
        GROUP BY "${primaryKey}"
        HAVING COUNT(*) > 1
      `;
      const result = await this.pool.query(query);

      if (result.rows.length > 0) {
        errors.push(`Duplicate primary keys found in ${targetTable}: ${result.rows.length} duplicates`);
      }
    } catch (error) {
      logger.error(`Failed to validate uniqueness for ${targetTable}:`, error);
      errors.push(`Validation error: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate referential integrity
   */
  async validateReferentialIntegrity(
    tableMapping: TableMapping,
    _allMappings: TableMapping[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!tableMapping.dependencies || tableMapping.dependencies.length === 0) {
      return { valid: true, errors: [] };
    }

    // TODO: Implement referential integrity checks
    // For each dependency, check that foreign key values exist in referenced table

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

