import React from 'react'
import { Lookup, LookupItem, LookupProps } from '@/components/forms/Lookup'
import { searchItems } from '@/services/api/items'

/**
 * Item Lookup Component
 * 
 * Extends base Lookup component for item-specific type-to-search functionality.
 * 
 * Original Logic Reference:
 * - Lookup forms in original system
 * - UX Strategy: docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md
 * 
 * Features:
 * - Type-to-search with debouncing
 * - Display item_no and short_name
 * - Keyboard navigation (Arrow keys, Enter to select, Escape to close)
 * - Performance: < 200ms response time
 * 
 * Reference: Task 01-02 - Item Lookup with Type-to-Search
 */

interface ItemLookupProps extends Omit<LookupProps, 'onSearch'> {
  onSelect?: (item: LookupItem) => void
}

export function ItemLookup({ onSelect, onChange, ...props }: ItemLookupProps) {
  /**
   * Search items handler
   * 
   * Calls backend API to search items by item_no or short_name.
   * Returns results formatted for Lookup component.
   */
  const handleSearch = async (query: string): Promise<LookupItem[]> => {
    if (!query || query.length < 1) {
      return []
    }

    try {
      const results = await searchItems(query)
      return results.map((item) => ({
        code: item.code,
        name: item.name,
        description: item.description,
      }))
    } catch (error) {
      console.error('Error searching items:', error)
      return []
    }
  }

  /**
   * Handle item selection
   * 
   * When user selects an item from lookup, update value and call onSelect callback.
   */
  const handleChange = (value: string, item?: LookupItem) => {
    onChange(value, item)
    if (item && onSelect) {
      onSelect(item)
    }
  }

  return (
    <Lookup
      {...props}
      onChange={handleChange}
      onSearch={handleSearch}
      placeholder="Search items..."
      minSearchLength={1}
      debounceMs={200}
    />
  )
}

