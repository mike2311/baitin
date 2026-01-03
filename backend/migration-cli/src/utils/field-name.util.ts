/**
 * Field Name Utility
 * 
 * Provides consistent conversion between camelCase and snake_case field names
 * to match database column naming conventions.
 */

/**
 * Convert camelCase or mixedCase to snake_case
 * Handles edge cases like numbers: packPc1 -> pack_pc_1 (not pack_pc1)
 * 
 * Examples:
 * - packPc1 -> pack_pc_1
 * - custNo -> cust_no
 * - origin -> origin (already lowercase)
 * - std_code -> std_code (already snake_case)
 * 
 * @param name - Field name in camelCase or snake_case
 * @returns Field name in snake_case format
 */
export function toSnakeCase(name: string): string {
  if (!name) return name;
  
  // If already in snake_case (contains underscore and all lowercase), return as-is
  if (name.includes('_') && name === name.toLowerCase()) {
    return name;
  }
  
  // If all lowercase with no uppercase, return as-is (e.g., "origin")
  if (name === name.toLowerCase()) {
    return name;
  }
  
  // Convert camelCase to snake_case
  // Process in order: handle uppercase letters first, then numbers
  return name
    // Step 1: Insert underscore before uppercase letters that follow lowercase (packPc -> pack_Pc)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    // Step 2: Insert underscore before uppercase letters that follow numbers (1P -> 1_P)
    .replace(/(\d)([A-Z])/g, '$1_$2')
    // Step 3: Insert underscore before numbers that follow letters (packPc_1 -> packPc__1, but we want pack_pc_1)
    // Actually, after step 1, packPc1 becomes packPc1, so we need: (packPc)(1) -> (pack_Pc)(1)
    .replace(/([a-zA-Z])(\d)/g, '$1_$2')
    // Step 4: Convert to lowercase
    .toLowerCase();
}

/**
 * Get database column name from target field name
 * This is the canonical way to convert any target field name to database column format
 * 
 * @param targetFieldName - Target field name from field mapping (could be camelCase or snake_case)
 * @returns Database column name in snake_case format
 */
export function getDbColumnName(targetFieldName: string): string {
  return toSnakeCase(targetFieldName);
}

