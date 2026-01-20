import { EntityMetadata } from 'typeorm';

/**
 * Transforms entity metadata for SQLite compatibility
 * SQLite doesn't support AUTOINCREMENT on BIGINT, so we map BIGINT to INTEGER
 */
export function transformEntityMetadataForSqlite(
  metadata: EntityMetadata,
): void {
  metadata.columns.forEach((column) => {
    // If it's a primary generated column with BIGINT type, change to INTEGER for SQLite
    if (
      column.isPrimary &&
      column.generationStrategy === 'increment' &&
      column.type === 'bigint'
    ) {
      // Override the type for SQLite
      (column as any).type = 'integer';
      (column as any).sqlType = 'INTEGER';
    }
  });
}
