import React from 'react'
import { Lookup, LookupItem, LookupProps } from '@/components/forms/Lookup'
import { searchVendors } from '@/services/api/vendors'

/**
 * Vendor Lookup Component
 * 
 * Extends base Lookup component for vendor-specific type-to-search functionality.
 * 
 * Original Logic Reference:
 * - Lookup forms in original system
 * - UX Strategy: docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md
 * 
 * Features:
 * - Type-to-search with debouncing
 * - Display vendor_no and ename
 * - Keyboard navigation (Arrow keys, Enter to select, Escape to close)
 * - Performance: < 200ms response time
 * 
 * Reference: Task 03-02 - Vendor Lookup
 */

interface VendorLookupProps extends Omit<LookupProps, 'onSearch'> {
  onSelect?: (item: LookupItem) => void
}

export function VendorLookup({ onSelect, onChange, ...props }: VendorLookupProps) {
  /**
   * Search vendors handler
   * 
   * Calls backend API to search vendors by vendor_no or ename.
   * Returns results formatted for Lookup component.
   * 
   * Original Logic Reference:
   * - Documentation: docs/planning/poc_planning/01-phase-1-master-data/03-vendor-master/task-03-02-vendor-lookup.md
   * - API Endpoint: GET /api/vendors/search?q={query}
   */
  const handleSearch = async (query: string): Promise<LookupItem[]> => {
    if (!query || query.length < 1) {
      return []
    }

    try {
      const results = await searchVendors(query)
      return results.map((vendor) => ({
        code: vendor.code,
        name: vendor.name,
        description: vendor.description,
      }))
    } catch (error) {
      console.error('Error searching vendors:', error)
      return []
    }
  }

  /**
   * Handle vendor selection
   * 
   * When user selects a vendor from lookup, update value and call onSelect callback.
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
      placeholder="Search vendors..."
      minSearchLength={1}
      debounceMs={200}
    />
  )
}


