import React, { useState } from 'react'
import { ItemList } from '@/components/master-data/item/ItemList'
import { ItemEntryForm } from '@/components/master-data/item/ItemEntryForm'
import { Item } from '@/services/api/items'

/**
 * Item Master Page
 * 
 * Main page for item master data management.
 * Displays item list and provides access to item entry form.
 * 
 * Original Logic Reference:
 * - FoxPro Form: iitem.scx (Input Item Detail)
 * - Documentation: docs/source/02-business-processes/master-data-management.md lines 9-163
 * 
 * Features:
 * - List view with filtering
 * - Create new items
 * - Edit existing items
 * - Keyboard-first navigation
 * 
 * Reference: Phase 1 - Item Master Module
 */

type ViewMode = 'list' | 'create' | 'edit'

export function ItemMasterPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedItemNo, setSelectedItemNo] = useState<string | undefined>()

  /**
   * Handle new item button click
   */
  const handleCreateNew = () => {
    setSelectedItemNo(undefined)
    setViewMode('create')
  }

  /**
   * Handle item selection from list
   */
  const handleSelectItem = (item: Item) => {
    setSelectedItemNo(item.itemNo)
    setViewMode('edit')
  }

  /**
   * Handle form success (create or update)
   */
  const handleFormSuccess = (item: Item) => {
    setViewMode('list')
    setSelectedItemNo(undefined)
  }

  /**
   * Handle form cancel
   */
  const handleFormCancel = () => {
    setViewMode('list')
    setSelectedItemNo(undefined)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">BAITIN Trading Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-sm text-gray-700 hover:text-indigo-600">Dashboard</a>
              <a href="/items" className="text-sm font-medium text-indigo-600">Items</a>
              <a href="/customers" className="text-sm text-gray-700 hover:text-indigo-600">Customers</a>
              <a href="/vendors" className="text-sm text-gray-700 hover:text-indigo-600">Vendors</a>
            </div>
          </div>
        </div>
      </nav>

      {viewMode === 'list' && (
        <ItemList
          onSelectItem={handleSelectItem}
          onCreateNew={handleCreateNew}
        />
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <ItemEntryForm
          mode={viewMode}
          itemNo={selectedItemNo}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}

