import { useState } from 'react'
import { VendorList } from '@/components/master-data/vendor/VendorList'
import { VendorEntryForm } from '@/components/master-data/vendor/VendorEntryForm'
import { Vendor } from '@/services/api/vendors'

/**
 * Vendor Master Page
 * 
 * Main page for vendor master data management.
 * Displays vendor list and provides access to vendor entry form.
 * 
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/master-data-management.md
 * 
 * Features:
 * - List view with filtering
 * - Create new vendors
 * - Edit existing vendors
 * - Keyboard-first navigation
 * 
 * Reference: Phase 1 - Vendor Master Module
 */

type ViewMode = 'list' | 'create' | 'edit'

export function VendorMasterPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedVendorNo, setSelectedVendorNo] = useState<string | undefined>()

  const handleCreateNew = () => {
    setSelectedVendorNo(undefined)
    setViewMode('create')
  }

  const handleSelectVendor = (vendor: Vendor) => {
    setSelectedVendorNo(vendor.vendorNo)
    setViewMode('edit')
  }

  const handleFormSuccess = () => {
    setViewMode('list')
    setSelectedVendorNo(undefined)
  }

  const handleFormCancel = () => {
    setViewMode('list')
    setSelectedVendorNo(undefined)
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
              <a href="/items" className="text-sm text-gray-700 hover:text-indigo-600">Items</a>
              <a href="/customers" className="text-sm text-gray-700 hover:text-indigo-600">Customers</a>
              <a href="/vendors" className="text-sm font-medium text-indigo-600">Vendors</a>
            </div>
          </div>
        </div>
      </nav>

      {viewMode === 'list' && (
        <VendorList
          onSelectVendor={handleSelectVendor}
          onCreateNew={handleCreateNew}
        />
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <VendorEntryForm
          mode={viewMode}
          vendorNo={selectedVendorNo}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}

