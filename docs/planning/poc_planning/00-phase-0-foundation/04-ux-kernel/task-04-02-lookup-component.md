# Task 04-02: Lookup Component with Type-to-Search

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 4
- **Priority**: High
- **Estimated Effort**: 2 days
- **Dependencies**: Task 04-01 (Text Input Component)
- **Assignee**: Frontend Developer

## Objective

Create a reusable lookup/select component with type-to-search functionality, keyboard navigation, and support for displaying code and description.

## Requirements

### 1. Component Features

#### Type-to-Search
- Instant search as user types
- Debounced API calls (200ms delay)
- Show loading state during search
- Display search results in dropdown

#### Keyboard Navigation
- Arrow keys: Navigate suggestions
- Enter: Select current suggestion
- Escape: Close dropdown
- Tab: Move to next field (after selection)

#### Display
- Show code and description
- Highlight search term in results
- Show "No results" message
- Show loading indicator

#### Selection
- Click to select
- Enter to select
- Auto-fill selected value
- Callback on selection

### 2. Component Props

```typescript
interface LookupProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string, item?: any) => void;
  onSearch: (query: string) => Promise<LookupItem[]>;
  displayField?: string; // Field to display (default: 'name')
  valueField?: string; // Field for value (default: 'code')
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  minSearchLength?: number; // Minimum chars to trigger search
  debounceMs?: number; // Debounce delay
}
```

### 3. Lookup Item Type

```typescript
interface LookupItem {
  code: string;
  name: string;
  description?: string;
  [key: string]: any;
}
```

### 4. UX Requirements

**Reference**: `docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md` lines 67-71

- **Type-to-Search**: Instant search as user types
- **Keyboard**: Arrow keys to navigate, Enter to select
- **Display**: Show code and description
- **Recent**: Show recently used items first (future)

## Implementation Steps

1. **Create Base Component**
   - Create Lookup component
   - Use Combobox or Popover from shadcn/ui
   - Add input field

2. **Implement Type-to-Search**
   - Handle input changes
   - Debounce search calls
   - Call onSearch prop
   - Handle loading state

3. **Add Dropdown Display**
   - Show search results in dropdown
   - Display code and description
   - Highlight search term
   - Handle empty results

4. **Implement Keyboard Navigation**
   - Arrow up/down to navigate
   - Enter to select
   - Escape to close
   - Focus management

5. **Add Selection Handling**
   - Handle click selection
   - Handle keyboard selection
   - Update value
   - Close dropdown

6. **Integration**
   - Integrate with React Hook Form
   - Support validation
   - Handle errors

7. **Testing**
   - Test type-to-search
   - Test keyboard navigation
   - Test selection
   - Test performance

## Acceptance Criteria

- [ ] Lookup component created
- [ ] Type-to-search works (debounced)
- [ ] Search results display correctly
- [ ] Keyboard navigation works (arrows, Enter, Escape)
- [ ] Selection works (click and keyboard)
- [ ] Loading state displayed
- [ ] Empty state handled
- [ ] Component integrates with React Hook Form
- [ ] Performance: Search < 200ms response
- [ ] Component is reusable

## Component Example

```typescript
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Lookup({
  label,
  name,
  value,
  onChange,
  onSearch,
  displayField = 'name',
  valueField = 'code',
  minSearchLength = 1,
  debounceMs = 200,
  ...props
}: LookupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const debouncedQuery = useDebounce(searchQuery, debounceMs);

  useEffect(() => {
    if (debouncedQuery.length >= minSearchLength) {
      setLoading(true);
      onSearch(debouncedQuery)
        .then(setResults)
        .finally(() => setLoading(false));
    }
  }, [debouncedQuery, onSearch, minSearchLength]);

  const handleSelect = (item: LookupItem) => {
    onChange(item[valueField], item);
    setOpen(false);
  };

  // Keyboard handlers...

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          // ... keyboard handlers
        />
      </PopoverTrigger>
      <PopoverContent>
        {loading && <div>Loading...</div>}
        {!loading && results.length === 0 && <div>No results</div>}
        {results.map((item, index) => (
          <div
            key={item[valueField]}
            onClick={() => handleSelect(item)}
            className={selectedIndex === index ? 'bg-blue-100' : ''}
          >
            {item[valueField]} - {item[displayField]}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
```

## Testing Checklist

- [ ] Component renders correctly
- [ ] Type-to-search triggers after debounce
- [ ] Search results display correctly
- [ ] Arrow keys navigate results
- [ ] Enter selects item
- [ ] Escape closes dropdown
- [ ] Loading state shows during search
- [ ] Empty state displays correctly
- [ ] Component works with React Hook Form
- [ ] Performance acceptable (< 200ms)

## Notes

- Use shadcn/ui Combobox or Popover as base
- Implement proper debouncing for performance
- Consider caching search results
- Support both controlled and uncontrolled modes
- Ensure accessibility (ARIA attributes)

## Dependencies

- Task 04-01: Text Input Component
- Task 02-03: Frontend Foundation

## Next Tasks

- Task 04-03: Data Grid Setup

## References

- **UX/UI Strategy**: `../../../../docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md`
- **PoC Strategy**: `../../../../docs/modernization-strategy/15-poc-strategy/poc-strategy.md`

