/**
 * Unit Tests for Transformer Service
 */

import { TransformerService } from './transformer.service.js';
import { TableMapping, FieldMapping } from '../models/table-mapping.interface.js';

describe('Transformer Service', () => {
  let transformer: TransformerService;

  beforeEach(() => {
    transformer = new TransformerService();
  });

  describe('transformRecord', () => {
    it('should transform record according to field mappings', () => {
      const mapping: TableMapping = {
        legacyTable: 'test',
        targetTable: 'test_table',
        loadOrder: 1,
        loadStrategy: 'truncate',
        primaryKey: 'id',
        fieldMappings: {
          item_no: {
            target: 'itemNo',
            type: 'string',
            required: true,
          },
          price: {
            target: 'price',
            type: 'number',
            required: false,
          },
        },
      };

      const record = {
        item_no: 'ITEM001',
        price: '100.50',
      };

      const result = transformer.transformRecord(record, mapping);

      expect(result.itemNo).toBe('ITEM001');
      expect(result.price).toBe(100.5);
    });

    it('should handle null values with defaults', () => {
      const mapping: TableMapping = {
        legacyTable: 'test',
        targetTable: 'test_table',
        loadOrder: 1,
        loadStrategy: 'truncate',
        primaryKey: 'id',
        fieldMappings: {
          status: {
            target: 'status',
            type: 'string',
            defaultValue: 'active',
          },
        },
      };

      const record = { status: null };
      const result = transformer.transformRecord(record, mapping);

      expect(result.status).toBe('active');
    });
  });

  describe('transformBoolean', () => {
    it('should convert FoxPro .T. to true', () => {
      const mapping: FieldMapping = {
        target: 'active',
        type: 'boolean',
        trueValue: '.T.',
      };

      const transformer = new TransformerService();
      // Access private method via any for testing
      const result = (transformer as any).transformValue('.T.', mapping);
      expect(result).toBe(true);
    });

    it('should convert FoxPro .F. to false', () => {
      const mapping: FieldMapping = {
        target: 'active',
        type: 'boolean',
        falseValue: '.F.',
      };

      const transformer = new TransformerService();
      const result = (transformer as any).transformValue('.F.', mapping);
      expect(result).toBe(false);
    });
  });

  describe('transformDate', () => {
    it('should convert FoxPro date format (YYYYMMDD) to Date', () => {
      const mapping: FieldMapping = {
        target: 'date',
        type: 'date',
        format: 'foxpro',
      };

      const transformer = new TransformerService();
      const result = (transformer as any).transformValue('20250115', mapping);

      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January is 0-indexed
      expect(result.getDate()).toBe(15);
    });
  });
});


