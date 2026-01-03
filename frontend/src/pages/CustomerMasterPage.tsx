import { useState } from 'react'
import { CustomerList } from '@/components/master-data/customer/CustomerList'
import { CustomerEntryForm } from '@/components/master-data/customer/CustomerEntryForm'
import { Customer } from '@/services/api/customers'

/**
 * Customer Master Page
 * 
 * Main page for customer master data management.
 * Displays customer list and provides access to customer entry form.
 * 
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/master-data-management.md
 * 
 * Features:
 * - List view with filtering
 * - Create new customers
 * - Edit existing customers
 * - Keyboard-first navigation
 * 
 * Reference: Phase 1 - Customer Master Module
 */

type ViewMode = 'list' | 'create' | 'edit'

export function CustomerMasterPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedCustNo, setSelectedCustNo] = useState<string | undefined>()

  const handleCreateNew = () => {
    setSelectedCustNo(undefined)
    setViewMode('create')
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustNo(customer.custNo)
    setViewMode('edit')
  }

  const handleFormSuccess = () => {
    setViewMode('list')
    setSelectedCustNo(undefined)
  }

  const handleFormCancel = () => {
    setViewMode('list')
    setSelectedCustNo(undefined)
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
              <a href="/customers" className="text-sm font-medium text-indigo-600">Customers</a>
              <a href="/vendors" className="text-sm text-gray-700 hover:text-indigo-600">Vendors</a>
            </div>
          </div>
        </div>
      </nav>

      {viewMode === 'list' && (
        <CustomerList
          onSelectCustomer={handleSelectCustomer}
          onCreateNew={handleCreateNew}
        />
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <CustomerEntryForm
          mode={viewMode}
          custNo={selectedCustNo}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}

