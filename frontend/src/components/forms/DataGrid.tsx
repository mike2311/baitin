import React, { useMemo } from 'react'
import DataGridLib, { Column, Row } from 'react-data-grid'
import 'react-data-grid/lib/styles.css'

/**
 * Data Grid Component
 * 
 * Excel-like data grid with keyboard navigation, inline editing, and copy/paste support.
 * 
 * Original Logic Reference:
 * - Documentation: docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md lines 75-96
 * 
 * UX Requirements:
 * - Excel-like grid navigation
 * - Arrow keys, Tab, Enter navigation
 * - Copy/paste from Excel
 * - Inline editing
 * 
 * Reference: Task 04-03 - Data Grid Setup
 */
export interface CustomDataGridProps<T extends Row> {
  columns: Column<T>[]
  rows: T[]
  onRowsChange?: (rows: T[]) => void
  onCellClick?: (args: any) => void
  selectedRows?: Set<number>
  height?: number
  className?: string
}

export function DataGrid<T extends Row>({
  columns,
  rows,
  onRowsChange,
  onCellClick,
  selectedRows,
  height = 400,
  className,
}: CustomDataGridProps<T>) {
  const defaultColumnOptions = useMemo(
    () => ({
      resizable: true,
      sortable: true,
    }),
    []
  )

  return (
    <div className={className} style={{ height }}>
      <DataGridLib
        columns={columns}
        rows={rows}
        onRowsChange={onRowsChange}
        defaultColumnOptions={defaultColumnOptions}
        selectedRows={selectedRows}
        onCellClick={onCellClick}
        style={{ height: '100%' }}
      />
    </div>
  )
}


