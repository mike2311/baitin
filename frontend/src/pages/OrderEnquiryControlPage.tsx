import { useState } from 'react'
import { Navigation } from '../components/Navigation'
import { OEControlEntryForm } from '../components/order-enquiry/OEControlEntryForm'
import { OEControlList } from '../components/order-enquiry/OEControlList'
import { OrderEnquiryControl } from '../services/api/orderEnquiryControl'

/**
 * Order Enquiry Control Page
 *
 * Main page for OE Control management with entry form and list view.
 *
 * Reference: Task 01-01 - OE Control Entry Form
 */
export default function OrderEnquiryControlPage() {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedOeNo, setSelectedOeNo] = useState<string | undefined>()

  const handleCreateNew = () => {
    setSelectedOeNo(undefined)
    setMode('create')
  }

  const handleSelectControl = (control: OrderEnquiryControl) => {
    setSelectedOeNo(control.oeNo)
    setMode('edit')
  }

  const handleSuccess = () => {
    setMode('list')
    setSelectedOeNo(undefined)
  }

  const handleCancel = () => {
    setMode('list')
    setSelectedOeNo(undefined)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6">
        {mode === 'list' && (
          <OEControlList
            onSelectControl={handleSelectControl}
            onCreateNew={handleCreateNew}
          />
        )}
        {(mode === 'create' || mode === 'edit') && (
          <OEControlEntryForm
            oeNo={selectedOeNo}
            mode={mode}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  )
}
