# Task 04-03: Data Grid Setup (React Data Grid)

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 4
- **Priority**: High
- **Estimated Effort**: 2 days
- **Dependencies**: Task 02-03 (Frontend Foundation)
- **Assignee**: Frontend Developer

## Objective

Set up React Data Grid (Adazzle) library with Excel-like keyboard navigation, inline editing, and integration with the application.

## Requirements

### 1. Library Installation

#### React Data Grid (Adazzle)
- Install `react-data-grid` package
- Version: Latest stable (7.x+)
- Install types: `@types/react-data-grid` (if needed)

### 2. Grid Features

#### Keyboard Navigation
- Arrow keys: Move between cells
- Tab/Enter: Move to next cell
- Shift+Tab: Move to previous cell
- Ctrl+C/Ctrl+V: Copy/paste
- F2: Edit cell
- Escape: Cancel edit

#### Inline Editing
- Direct cell editing
- Auto-save on cell change
- Validation on edit
- Cancel edit with Escape

#### Excel-like Features
- Copy/paste from Excel
- Multi-row selection
- Row-level validation
- Auto-calculate totals

#### Performance
- Virtual scrolling for large datasets
- Lazy loading support
- Client-side filtering/sorting

### 3. Grid Configuration

#### Basic Setup
- Column definitions
- Row data
- Cell renderers
- Cell editors

#### Customization
- Styling with Tailwind CSS
- Theme integration
- Custom cell components

### 4. Integration

#### With React Query
- Data fetching
- Optimistic updates
- Cache management

#### With Form State
- Grid as form field
- Validation integration
- Change tracking

## Implementation Steps

1. **Install Library**
   - Install react-data-grid
   - Install dependencies
   - Verify installation

2. **Create Base Grid Component**
   - Create DataGrid wrapper component
   - Configure basic grid
   - Set up column definitions

3. **Implement Keyboard Navigation**
   - Configure keyboard handlers
   - Test navigation
   - Ensure Excel-like behavior

4. **Add Inline Editing**
   - Configure cell editors
   - Handle cell changes
   - Implement auto-save

5. **Integrate Copy/Paste**
   - Handle clipboard events
   - Parse Excel data
   - Paste into grid

6. **Add Styling**
   - Customize grid styles
   - Match design system
   - Ensure readability

7. **Testing**
   - Test keyboard navigation
   - Test inline editing
   - Test copy/paste
   - Test performance

## Acceptance Criteria

- [ ] React Data Grid installed
- [ ] Base grid component created
- [ ] Keyboard navigation works (arrows, Tab, Enter)
- [ ] Inline editing works
- [ ] Copy/paste from Excel works
- [ ] Grid integrates with React Query
- [ ] Grid styling matches design system
- [ ] Performance acceptable with large datasets
- [ ] Component is reusable

## Grid Component Example

```typescript
import DataGrid, { Column, Row } from 'react-data-grid';
import { useMemo } from 'react';

interface DataGridProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowsChange?: (rows: T[]) => void;
  onCellClick?: (args: any) => void;
  selectedRows?: Set<number>;
}

export function CustomDataGrid<T extends Row>({
  columns,
  rows,
  onRowsChange,
  onCellClick,
  selectedRows,
}: DataGridProps<T>) {
  const defaultColumnOptions = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      editable: true,
    }),
    []
  );

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      onRowsChange={onRowsChange}
      defaultColumnOptions={defaultColumnOptions}
      selectedRows={selectedRows}
      onCellClick={onCellClick}
      className="rdg-light" // or custom theme
      style={{ height: '100%' }}
    />
  );
}
```

## Column Definition Example

```typescript
const columns: Column<OrderEnquiryDetail>[] = [
  {
    key: 'item_no',
    name: 'Item No',
    width: 150,
    editable: true,
    editor: TextEditor,
    cellClass: 'font-mono',
  },
  {
    key: 'qty',
    name: 'Quantity',
    width: 100,
    editable: true,
    editor: NumberEditor,
    formatter: (props) => formatNumber(props.row.qty),
  },
  {
    key: 'price',
    name: 'Price',
    width: 120,
    editable: true,
    editor: NumberEditor,
    formatter: (props) => formatCurrency(props.row.price),
  },
  {
    key: 'amount',
    name: 'Total',
    width: 120,
    editable: false,
    formatter: (props) => formatCurrency(props.row.qty * props.row.price),
  },
];
```

## Keyboard Navigation Configuration

```typescript
const keyboardNavigationOptions = {
  // Enable Excel-like navigation
  enableCellSelection: true,
  enableCellCopy: true,
  enableCellPaste: true,
  
  // Keyboard shortcuts
  onCellKeyDown: (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      // Move to next cell
      event.preventDefault();
      // Focus next cell logic
    }
    if (event.key === 'F2') {
      // Start editing
      event.preventDefault();
      // Start edit logic
    }
  },
};
```

## Testing Checklist

- [ ] Grid renders correctly
- [ ] Arrow keys navigate cells
- [ ] Tab/Enter moves to next cell
- [ ] Inline editing works
- [ ] Copy/paste works
- [ ] Excel paste works
- [ ] Cell validation works
- [ ] Performance acceptable (1000+ rows)
- [ ] Grid integrates with form state

## Notes

- React Data Grid is free and open-source
- Consider virtual scrolling for large datasets
- Customize cell editors for specific data types
- Ensure accessibility (keyboard navigation)
- Match grid styling with design system

## Dependencies

- Task 02-03: Frontend Foundation

## Next Tasks

- Task 04-04: Form Layout Components

## References

- **UX/UI Strategy**: `../../../../docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md` (lines 75-96)
- **PoC Strategy**: `../../../../docs/modernization-strategy/15-poc-strategy/poc-strategy.md`

