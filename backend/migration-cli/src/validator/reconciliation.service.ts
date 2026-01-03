/**
 * Reconciliation Service
 * 
 * Compares extracted vs loaded row counts and generates reports.
 */

import { ExtractionManifest } from '../models/extraction-result.interface.js';
import { Pool } from 'pg';

export class ReconciliationService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Reconcile extracted vs loaded row counts
   */
  async reconcile(
    manifest: ExtractionManifest,
    tableMapping: Map<string, string> // legacyTable -> targetTable
  ): Promise<Map<string, { extracted: number; loaded: number; match: boolean }>> {
    const results = new Map();

    for (const result of manifest.results) {
      const targetTable = tableMapping.get(result.table);
      if (!targetTable) continue;

      const loadedCount = await this.getRowCount(targetTable);
      const extractedCount = result.rowCount;
      const match = extractedCount === loadedCount;

      results.set(result.table, {
        extracted: extractedCount,
        loaded: loadedCount,
        match,
      });
    }

    return results;
  }

  /**
   * Get row count for a table
   */
  private async getRowCount(tableName: string): Promise<number> {
    const result = await this.pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    return parseInt(result.rows[0].count, 10);
  }
}

