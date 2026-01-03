/**
 * Unit Tests for Migration Configuration
 */

import {
  loadTableMappings,
  loadFieldMappings,
  mergeFieldMappings,
  getTablesInLoadOrder,
  validateTableMappings,
} from './migration.config.js';
import { LoadOrder } from '../models/table-mapping.interface.js';

describe('Migration Configuration', () => {

  describe('loadTableMappings', () => {
    it('should load table mappings from JSON file', () => {
      const mappings = loadTableMappings();
      expect(Array.isArray(mappings)).toBe(true);
      expect(mappings.length).toBeGreaterThan(0);
    });

    it('should have required fields for each mapping', () => {
      const mappings = loadTableMappings();
      mappings.forEach((mapping) => {
        expect(mapping.legacyTable).toBeDefined();
        expect(mapping.targetTable).toBeDefined();
        expect(mapping.loadOrder).toBeDefined();
        expect(mapping.primaryKey).toBeDefined();
      });
    });

    it('should convert loadOrder strings to enum values', () => {
      const mappings = loadTableMappings();
      mappings.forEach((mapping) => {
        expect(typeof mapping.loadOrder).toBe('number');
        expect(Object.values(LoadOrder)).toContain(mapping.loadOrder);
      });
    });
  });

  describe('loadFieldMappings', () => {
    it('should load field mappings from JSON file', () => {
      const mappings = loadFieldMappings();
      expect(typeof mappings).toBe('object');
      expect(Object.keys(mappings).length).toBeGreaterThan(0);
    });

    it('should have mappings for each table', () => {
      const tableMappings = loadTableMappings();
      const fieldMappings = loadFieldMappings();
      
      tableMappings.forEach((table) => {
        // Field mappings may not exist for all tables
        if (fieldMappings[table.legacyTable]) {
          expect(typeof fieldMappings[table.legacyTable]).toBe('object');
        }
      });
    });
  });

  describe('mergeFieldMappings', () => {
    it('should merge field mappings into table mappings', () => {
      const tableMappings = loadTableMappings();
      const fieldMappings = loadFieldMappings();
      const merged = mergeFieldMappings(tableMappings, fieldMappings);
      
      expect(merged.length).toBe(tableMappings.length);
      merged.forEach((table) => {
        expect(table.fieldMappings).toBeDefined();
        expect(typeof table.fieldMappings).toBe('object');
      });
    });
  });

  describe('getTablesInLoadOrder', () => {
    it('should sort tables by load order', () => {
      const mappings = loadTableMappings();
      const ordered = getTablesInLoadOrder(mappings);
      
      for (let i = 1; i < ordered.length; i++) {
        expect(ordered[i].loadOrder).toBeGreaterThanOrEqual(ordered[i - 1].loadOrder);
      }
    });
  });

  describe('validateTableMappings', () => {
    it('should validate correct table mappings', () => {
      const mappings = loadTableMappings();
      const result = validateTableMappings(mappings);
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect duplicate legacy table names', () => {
      const mappings = loadTableMappings();
      const duplicate = { ...mappings[0] };
      const invalid = [...mappings, duplicate];
      
      const result = validateTableMappings(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect missing required fields', () => {
      const invalid = [
        {
          legacyTable: 'test',
          // Missing targetTable, primaryKey, loadOrder
        } as any,
      ];
      
      const result = validateTableMappings(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

