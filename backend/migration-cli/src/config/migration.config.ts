/**
 * Migration Configuration Service
 * 
 * Loads and validates migration configuration files (table mappings, field mappings).
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TableMapping, FieldMapping, LoadOrder } from '../models/table-mapping.interface.js';
import { logger } from '../utils/logger.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load table mappings from JSON config file
 */
export function loadTableMappings(configPath?: string): TableMapping[] {
  const path = configPath || join(__dirname, '../../config/table-mappings.json');
  
  try {
    const content = readFileSync(path, 'utf-8');
    const config = JSON.parse(content);
    
    if (!config.tables || !Array.isArray(config.tables)) {
      throw new Error('Invalid table mappings config: missing "tables" array');
    }

    // Validate and convert loadOrder strings to enum
    const tables = config.tables.map((table: any) => {
      if (typeof table.loadOrder === 'string') {
        table.loadOrder = LoadOrder[table.loadOrder as keyof typeof LoadOrder] || parseInt(table.loadOrder);
      }
      
      // Ensure fieldMappings is initialized (will be populated from field-mappings.json)
      if (!table.fieldMappings) {
        table.fieldMappings = {};
      }
      
      return table;
    });

    logger.info(`Loaded ${tables.length} table mappings from ${path}`);
    return tables as TableMapping[];
  } catch (error) {
    logger.error(`Failed to load table mappings from ${path}:`, error);
    throw error;
  }
}

/**
 * Load field mappings from JSON config file
 */
export function loadFieldMappings(configPath?: string): Record<string, Record<string, FieldMapping>> {
  const path = configPath || join(__dirname, '../../config/field-mappings.json');
  
  try {
    const content = readFileSync(path, 'utf-8');
    const mappings = JSON.parse(content);
    
    logger.info(`Loaded field mappings for ${Object.keys(mappings).length} tables from ${path}`);
    return mappings;
  } catch (error) {
    logger.error(`Failed to load field mappings from ${path}:`, error);
    throw error;
  }
}

/**
 * Merge field mappings into table mappings
 */
export function mergeFieldMappings(
  tableMappings: TableMapping[],
  fieldMappings: Record<string, Record<string, FieldMapping>>
): TableMapping[] {
  return tableMappings.map(table => {
    const legacyTableName = table.legacyTable;
    const tableFieldMappings = fieldMappings[legacyTableName] || {};
    
    return {
      ...table,
      fieldMappings: tableFieldMappings,
    };
  });
}

/**
 * Get table mapping by legacy table name
 */
export function getTableMapping(
  legacyTableName: string,
  tableMappings: TableMapping[]
): TableMapping | undefined {
  return tableMappings.find(t => t.legacyTable === legacyTableName);
}

/**
 * Get table mapping by target table name
 */
export function getTableMappingByTarget(
  targetTableName: string,
  tableMappings: TableMapping[]
): TableMapping | undefined {
  return tableMappings.find(t => t.targetTable === targetTableName);
}

/**
 * Get tables in load order
 */
export function getTablesInLoadOrder(tableMappings: TableMapping[]): TableMapping[] {
  return [...tableMappings].sort((a, b) => {
    // First sort by loadOrder
    if (a.loadOrder !== b.loadOrder) {
      return a.loadOrder - b.loadOrder;
    }
    
    // Then by legacy table name for consistency
    return a.legacyTable.localeCompare(b.legacyTable);
  });
}

/**
 * Validate table mappings configuration
 */
export function validateTableMappings(tableMappings: TableMapping[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for duplicate legacy table names
  const legacyTableNames = tableMappings.map(t => t.legacyTable);
  const duplicates = legacyTableNames.filter((name, index) => legacyTableNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate legacy table names: ${duplicates.join(', ')}`);
  }
  
  // Check for duplicate target table names
  const targetTableNames = tableMappings.map(t => t.targetTable);
  const duplicateTargets = targetTableNames.filter((name, index) => targetTableNames.indexOf(name) !== index);
  if (duplicateTargets.length > 0) {
    errors.push(`Duplicate target table names: ${duplicateTargets.join(', ')}`);
  }
  
  // Validate dependencies exist
  for (const table of tableMappings) {
    if (table.dependencies) {
      for (const dep of table.dependencies) {
        const depTable = tableMappings.find(t => t.targetTable === dep || t.legacyTable === dep);
        if (!depTable) {
          errors.push(`Table ${table.legacyTable} depends on ${dep}, but it is not found in mappings`);
        }
      }
    }
  }
  
  // Validate required fields
  for (const table of tableMappings) {
    if (!table.legacyTable) {
      errors.push(`Table mapping missing legacyTable`);
    }
    if (!table.targetTable) {
      errors.push(`Table mapping for ${table.legacyTable} missing targetTable`);
    }
    if (!table.primaryKey) {
      errors.push(`Table mapping for ${table.legacyTable} missing primaryKey`);
    }
    if (!table.loadOrder || !Object.values(LoadOrder).includes(table.loadOrder)) {
      errors.push(`Table mapping for ${table.legacyTable} has invalid loadOrder: ${table.loadOrder}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}


