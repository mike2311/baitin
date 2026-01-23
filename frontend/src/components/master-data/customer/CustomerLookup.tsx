import { Lookup, LookupItem, LookupProps } from '@/components/forms/Lookup'
import { searchCustomers } from '@/services/api/customers'

/**
 * Customer Lookup Component
 * 
 * Extends base Lookup component for customer-specific type-to-search functionality.
 * 
 * Original Logic Reference:
 * - Lookup forms in original system
 * - UX Strategy: docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md
 * 
 * Features:
 * - Type-to-search with debouncing
 * - Display cust_no and ename
 * - Keyboard navigation (Arrow keys, Enter to select, Escape to close)
 * - Performance: < 200ms response time
 * 
 * Reference: Task 02-02 - Customer Lookup
 */

interface CustomerLookupProps extends Omit<LookupProps, 'onSearch' | 'value' | 'name' | 'onChange'> {
  onSelect?: (item: LookupItem) => void
  trigger?: React.ReactElement
  value?: string
  name?: string
  onChange?: (value: string, item?: LookupItem) => void
}

export function CustomerLookup({ 
  onSelect, 
  onChange, 
  trigger, 
  value = '', 
  name = 'customer', 
  ...props 
}: CustomerLookupProps) {
  /**
   * Search customers handler
   * 
   * Calls backend API to search customers by cust_no or ename.
   * Returns results formatted for Lookup component.
   * 
   * Original Logic Reference:
   * - Documentation: docs/planning/poc_planning/01-phase-1-master-data/02-customer-master/task-02-02-customer-lookup.md
   * - API Endpoint: GET /api/customers/search?q={query}
   */
  const handleSearch = async (query: string): Promise<LookupItem[]> => {
    if (!query || query.length < 1) {
      return []
    }

    try {
      const results = await searchCustomers(query)
      return results.map((customer) => ({
        code: customer.code,
        name: customer.name,
        description: customer.description,
      }))
    } catch (error) {
      return []
    }
  }

  /**
   * Handle customer selection
   * 
   * When user selects a customer from lookup, update value and call onSelect callback.
   */
  const handleChange = (value: string, item?: LookupItem) => {
    if (onChange) {
      onChange(value, item)
    }
    if (item && onSelect) {
      onSelect(item)
    }
  }

  // If trigger is provided, render just the trigger button (lookup functionality can be added later)
  if (trigger) {
    return <div>{trigger}</div>
  }

  return (
    <Lookup
      {...props}
      value={value}
      name={name}
      onChange={handleChange}
      onSearch={handleSearch}
      placeholder="Search customers..."
      minSearchLength={1}
      debounceMs={200}
    />
  )
}



