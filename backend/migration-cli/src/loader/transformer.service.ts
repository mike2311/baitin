/**
 * Transformer Service
 * 
 * Applies field mappings, type conversions, and normalization rules.
 */

import { TableMapping, FieldMapping } from '../models/table-mapping.interface.js';
import { logger } from '../utils/logger.util.js';

/**
 * Transform a record according to field mappings
 */
export class TransformerService {
  /**
   * Transform a single record
   */
  transformRecord(
    record: Record<string, any>,
    tableMapping: TableMapping
  ): Record<string, any> {
    const transformed: Record<string, any> = {};
    
    for (const [legacyField, mapping] of Object.entries(tableMapping.fieldMappings)) {
      const legacyValue = record[legacyField];
      const targetField = mapping.target;
      
      // Apply transformation
      transformed[targetField] = this.transformValue(legacyValue, mapping);
    }
    
    return transformed;
  }

  /**
   * Transform a single value according to field mapping
   */
  private transformValue(value: any, mapping: FieldMapping): any {
    // Handle null/undefined
    if (value === null || value === undefined || value === '') {
      if (mapping.required && !mapping.defaultValue) {
        throw new Error(`Required field ${mapping.target} is null/empty`);
      }
      return mapping.defaultValue ?? null;
    }

    // Type conversion
    switch (mapping.type) {
      case 'string':
        return this.transformString(value, mapping);
      
      case 'number':
        return this.transformNumber(value, mapping);
      
      case 'boolean':
        return this.transformBoolean(value, mapping);
      
      case 'date':
        return this.transformDate(value, mapping);
      
      case 'timestamp':
        return this.transformTimestamp(value, mapping);
      
      case 'text':
        return String(value);
      
      default:
        return value;
    }
  }

  /**
   * Transform to string
   */
  private transformString(value: any, mapping: FieldMapping): string {
    const str = String(value).trim();
    
    // Apply length limit if specified
    if (mapping.length && str.length > mapping.length) {
      logger.warn(`String value truncated for field ${mapping.target}: ${str.length} > ${mapping.length}`);
      return str.substring(0, mapping.length);
    }
    
    return str;
  }

  /**
   * Transform to number
   */
  private transformNumber(value: any, mapping: FieldMapping): number | null {
    if (value === null || value === undefined || value === '') {
      return mapping.defaultValue as number ?? null;
    }
    
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    
    if (isNaN(num)) {
      if (mapping.required) {
        throw new Error(`Invalid number value for required field ${mapping.target}: ${value}`);
      }
      return mapping.defaultValue as number ?? null;
    }
    
    // Apply precision/scale if specified
    if (mapping.scale !== undefined) {
      return parseFloat(num.toFixed(mapping.scale));
    }
    
    return num;
  }

  /**
   * Transform to boolean
   */
  private transformBoolean(value: any, mapping: FieldMapping): boolean | null {
    if (value === null || value === undefined || value === '') {
      return mapping.defaultValue as boolean ?? null;
    }
    
    if (typeof value === 'boolean') {
      return value;
    }
    
    const str = String(value).trim().toUpperCase();
    
    // Check for true value
    if (mapping.trueValue && str === mapping.trueValue.toUpperCase()) {
      return true;
    }
    
    // Check for false value
    if (mapping.falseValue && str === mapping.falseValue.toUpperCase()) {
      return false;
    }
    
    // Default FoxPro logical values
    if (str === '.T.' || str === 'T' || str === 'TRUE' || str === 'Y' || str === 'YES') {
      return true;
    }
    
    if (str === '.F.' || str === 'F' || str === 'FALSE' || str === 'N' || str === 'NO') {
      return false;
    }
    
    // Numeric: 0 = false, non-zero = true
    const num = parseFloat(str);
    if (!isNaN(num)) {
      return num !== 0;
    }
    
    return Boolean(value);
  }

  /**
   * Transform to date
   */
  private transformDate(value: any, mapping: FieldMapping): Date | null {
    if (value === null || value === undefined || value === '') {
      if (mapping.defaultValue && typeof mapping.defaultValue === 'string') {
        const date = new Date(mapping.defaultValue);
        return !isNaN(date.getTime()) ? date : null;
      }
      return null;
    }
    
    if (value instanceof Date) {
      return value;
    }
    
    // FoxPro date format (YYYYMMDD)
    if (mapping.format === 'foxpro') {
      const str = String(value).trim();
      if (str.length === 8) {
        const year = parseInt(str.substring(0, 4), 10);
        const month = parseInt(str.substring(4, 6), 10) - 1; // JavaScript months are 0-indexed
        const day = parseInt(str.substring(6, 8), 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    // Try standard date parsing
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    if (mapping.required) {
      throw new Error(`Invalid date value for required field ${mapping.target}: ${value}`);
    }
    
    return null;
  }

  /**
   * Transform to timestamp
   */
  private transformTimestamp(value: any, mapping: FieldMapping): Date | null {
    // Same as date for now, can be extended for timestamp-specific formats
    return this.transformDate(value, mapping);
  }
}

