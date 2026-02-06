import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldMapping } from './FieldMappingInterface';
import { cn } from '@/lib/utils';

/**
 * Import Data Preview Component
 *
 * Displays parsed data in table format before import execution.
 *
 * Features:
 * - Display parsed data in table format
 * - Show mapped fields with values
 * - Highlight rows with validation errors (if pre-validation available)
 * - Pagination for large files
 * - Row numbers
 *
 * Reference: Task 03 - Data Preview Component
 */

export interface PreviewRow {
  rowNumber: number;
  data: Record<string, string | number | null>;
  errors?: string[];
  warnings?: string[];
}

export interface ImportDataPreviewProps {
  rows: PreviewRow[];
  mapping: FieldMapping;
  onRowClick?: (row: PreviewRow) => void;
  className?: string;
}

const ROWS_PER_PAGE = 50;

export function ImportDataPreview({
  rows,
  mapping,
  onRowClick,
  className,
}: ImportDataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentRows = rows.slice(startIndex, endIndex);

  // Get all unique column names from mapping
  const mappedColumns = Object.values(mapping).filter(Boolean);
  const allColumns = [...new Set([...mappedColumns, ...Object.keys(rows[0]?.data || {})])];

  const hasErrors = rows.some((row) => row.errors && row.errors.length > 0);
  const hasWarnings = rows.some((row) => row.warnings && row.warnings.length > 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Data Preview</CardTitle>
        <CardDescription>
          Review the data before importing. Showing {rows.length} row{rows.length !== 1 ? 's' : ''}
          {totalPages > 1 && ` (page ${currentPage} of ${totalPages})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(hasErrors || hasWarnings) && (
            <div className="flex gap-2">
              {hasErrors && (
                <Badge variant="destructive">
                  {rows.filter((r) => r.errors && r.errors.length > 0).length} Error
                  {rows.filter((r) => r.errors && r.errors.length > 0).length !== 1 ? 's' : ''}
                </Badge>
              )}
              {hasWarnings && (
                <Badge variant="secondary">
                  {rows.filter((r) => r.warnings && r.warnings.length > 0).length} Warning
                  {rows.filter((r) => r.warnings && r.warnings.length > 0).length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}

          <div className="border rounded-lg overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  {allColumns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                  {(hasErrors || hasWarnings) && <TableHead>Status</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={allColumns.length + 2} className="text-center text-gray-500">
                      No data to preview
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRows.map((row) => (
                    <TableRow
                      key={row.rowNumber}
                      className={cn(
                        row.errors && row.errors.length > 0 && 'bg-red-50',
                        row.warnings && row.warnings.length > 0 && !row.errors && 'bg-yellow-50',
                        onRowClick && 'cursor-pointer hover:bg-gray-50',
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      <TableCell className="font-medium">{row.rowNumber}</TableCell>
                      {allColumns.map((col) => (
                        <TableCell key={col}>
                          {row.data[col] !== null && row.data[col] !== undefined
                            ? String(row.data[col])
                            : '-'}
                        </TableCell>
                      ))}
                      {(hasErrors || hasWarnings) && (
                        <TableCell>
                          <div className="flex gap-1">
                            {row.errors && row.errors.length > 0 && (
                              <Badge variant="destructive">Error</Badge>
                            )}
                            {row.warnings && row.warnings.length > 0 && !row.errors && (
                              <Badge variant="secondary">Warning</Badge>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
