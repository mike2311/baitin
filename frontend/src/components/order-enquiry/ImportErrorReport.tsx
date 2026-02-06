import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Import Error Report Component
 *
 * Displays validation errors and warnings from import execution.
 *
 * Features:
 * - List errors with row numbers
 * - Error message (clear and actionable)
 * - Error type (Critical/Warning)
 * - Summary count (X errors, Y warnings)
 * - Expandable error list
 * - Filter by error type
 * - Sort by row number
 *
 * Reference: Task 03-02 - Error Reporting
 */

export interface ImportError {
  rowNumber?: number;
  message: string;
  type: 'critical' | 'warning';
  field?: string;
}

export interface ImportErrorReportProps {
  errors: ImportError[];
  onRowClick?: (rowNumber?: number) => void;
  className?: string;
}

export function ImportErrorReport({
  errors,
  onRowClick,
  className,
}: ImportErrorReportProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [sortBy, setSortBy] = useState<'row' | 'type'>('row');

  const criticalErrors = errors.filter((e) => e.type === 'critical');
  const warnings = errors.filter((e) => e.type === 'warning');

  const filteredErrors =
    filter === 'all'
      ? errors
      : filter === 'critical'
        ? criticalErrors
        : warnings;

  const sortedErrors = [...filteredErrors].sort((a, b) => {
    if (sortBy === 'row') {
      const aRow = a.rowNumber ?? 0;
      const bRow = b.rowNumber ?? 0;
      return aRow - bRow;
    } else {
      return a.type.localeCompare(b.type);
    }
  });

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Import Errors</CardTitle>
        <CardDescription>
          Please review and fix the following errors before importing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                {criticalErrors.length} Critical Error{criticalErrors.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary">
                {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({errors.length})
              </Button>
              <Button
                variant={filter === 'critical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('critical')}
              >
                Critical ({criticalErrors.length})
              </Button>
              <Button
                variant={filter === 'warning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('warning')}
              >
                Warnings ({warnings.length})
              </Button>
            </div>
          </div>

          {/* Critical Errors Alert */}
          {criticalErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>{criticalErrors.length} critical error{criticalErrors.length !== 1 ? 's' : ''}</strong> must be
                fixed before the import can proceed. These errors prevent data from being imported.
              </AlertDescription>
            </Alert>
          )}

          {/* Error List */}
          {sortedErrors.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No {filter === 'all' ? '' : filter} errors to display.
            </div>
          ) : (
            <div className="border rounded-lg overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSortBy('row')}
                        className="h-auto p-0 font-medium"
                      >
                        Row {sortBy === 'row' && '↓'}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSortBy('type')}
                        className="h-auto p-0 font-medium"
                      >
                        Type {sortBy === 'type' && '↓'}
                      </Button>
                    </TableHead>
                    <TableHead>Message</TableHead>
                    {onRowClick && <TableHead className="w-24">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedErrors.map((error, index) => (
                    <TableRow
                      key={index}
                      className={cn(
                        error.type === 'critical' && 'bg-red-50',
                        error.type === 'warning' && 'bg-yellow-50',
                      )}
                    >
                      <TableCell className="font-medium">
                        {error.rowNumber ?? '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={error.type === 'critical' ? 'destructive' : 'secondary'}
                        >
                          {error.type === 'critical' ? 'Critical' : 'Warning'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          {error.field && (
                            <span className="font-medium text-gray-700">{error.field}: </span>
                          )}
                          <span>{error.message}</span>
                        </div>
                      </TableCell>
                      {onRowClick && (
                        <TableCell>
                          {error.rowNumber && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRowClick(error.rowNumber)}
                            >
                              View Row
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Help Text */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Critical errors</strong> must be fixed before importing. Common issues:
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Missing OE Control record - Create OE Control first (except INSP company)</li>
              <li>Invalid item numbers - Ensure all items exist in the Item Master</li>
              <li>Missing required fields - Check that all required fields are mapped</li>
            </ul>
            <p className="mt-2">
              <strong>Warnings</strong> can be reviewed after import but should be addressed.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
