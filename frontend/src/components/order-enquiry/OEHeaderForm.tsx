import { useState, useEffect } from 'react'
import { TextInput } from '@/components/forms/TextInput'
import { Label } from '@/components/ui/label'
import { CustomerLookup } from '@/components/master-data/customer/CustomerLookup'
import { getOrderEnquiryControl } from '@/services/api/orderEnquiryControl'
import { cn } from '@/lib/utils'

/**
 * Order Enquiry Header Form Component
 *
 * Implements OE header form with OE Control validation and customer lookup.
 *
 * Original Logic Reference:
 * - Legacy Table: moehd (OE Header)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md
 * - Business Rule: OE Control must exist before OE creation (except INSP company)
 *
 * Validation Rules:
 * - OE Control must exist (except INSP)
 * - Customer must match OE Control customer (if OE Control exists)
 * - Customer must exist
 *
 * UX Requirements:
 * - Keyboard Navigation: Tab, Enter (auto-advance), Shift+Tab, F2 (lookup)
 * - Auto-Advance: Move to next field on Enter (if valid)
 * - Inline Validation: Show errors below field, don't block typing
 *
 * Reference: Task 02-01 - OE Header Form
 */

export interface OEHeaderFormData {
  oeNo: string
  oeDate: string
  custNo: string
  poNo?: string
  compCode: string
  status?: number
  remark?: string
}

interface OEHeaderFormProps {
  data: OEHeaderFormData
  onChange: (data: OEHeaderFormData) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export function OEHeaderForm({
  data,
  onChange,
  errors = {},
  disabled = false,
}: OEHeaderFormProps) {
  const [oeControlError, setOeControlError] = useState<string | null>(null)
  const [validatingOeControl, setValidatingOeControl] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')

  // Validate OE Control when OE No changes (except INSP)
  useEffect(() => {
    const validateOeControl = async () => {
      const oeNo = data.oeNo?.trim()
      const compCode = (data.compCode || 'HT').toUpperCase()

      if (!oeNo) {
        setOeControlError(null)
        return
      }

      // INSP company bypasses OE Control check
      if (compCode === 'INSP') {
        setOeControlError(null)
        return
      }

      setValidatingOeControl(true)
      setOeControlError(null)

      try {
        const control = await getOrderEnquiryControl(oeNo)
        // If OE Control exists, validate customer match
        if (control.custNo && data.custNo && control.custNo !== data.custNo.trim()) {
          setOeControlError(
            `Customer must match OE Control customer: ${control.custNo}`,
          )
        } else if (control.custNo && !data.custNo) {
          // Auto-fill customer from OE Control
          onChange({ ...data, custNo: control.custNo })
          setSelectedCustomer(control.custNo)
        }
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setOeControlError(
            `OE Control not found for "${oeNo}". Create OE Control first (except INSP company).`,
          )
        } else {
          setOeControlError('Failed to validate OE Control')
        }
      } finally {
        setValidatingOeControl(false)
      }
    }

    const timeoutId = setTimeout(validateOeControl, 500) // Debounce validation
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.oeNo, data.compCode, data.custNo, onChange])

  const handleFieldChange = (field: keyof OEHeaderFormData, value: string | number) => {
    onChange({ ...data, [field]: value })
  }

  const handleCustomerSelect = (customer: { code: string; name: string }) => {
    handleFieldChange('custNo', customer.code)
    setSelectedCustomer(customer.code)
  }

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">OE Header</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OE Number */}
        <div className="space-y-2">
          <Label htmlFor="oeNo">
            OE Number <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id="oeNo"
            value={data.oeNo}
            onChange={(e) => handleFieldChange('oeNo', e.target.value)}
            className={cn(errors.oeNo && 'border-red-500')}
            placeholder="Enter OE Number"
            disabled={disabled}
          />
          {validatingOeControl && (
            <p className="text-sm text-gray-500">Validating OE Control...</p>
          )}
          {oeControlError && (
            <p className="text-sm text-red-600">{oeControlError}</p>
          )}
          {errors.oeNo && (
            <p className="text-sm text-red-600">{errors.oeNo}</p>
          )}
        </div>

        {/* Customer Number */}
        <div className="space-y-2">
          <Label htmlFor="custNo">
            Customer Number <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <TextInput
              id="custNo"
              value={data.custNo || selectedCustomer}
              onChange={(e) => {
                handleFieldChange('custNo', e.target.value)
                setSelectedCustomer(e.target.value)
              }}
              className={cn('flex-1', errors.custNo && 'border-red-500')}
              placeholder="Enter or lookup customer"
              disabled={disabled}
            />
            <CustomerLookup
              onSelect={handleCustomerSelect}
              trigger={
                <button
                  type="button"
                  className="px-3 py-2 border rounded-md hover:bg-gray-50"
                  disabled={disabled}
                >
                  F2
                </button>
              }
            />
          </div>
          {errors.custNo && (
            <p className="text-sm text-red-600">{errors.custNo}</p>
          )}
        </div>

        {/* OE Date */}
        <div className="space-y-2">
          <Label htmlFor="oeDate">
            OE Date <span className="text-red-500">*</span>
          </Label>
          <input
            type="date"
            id="oeDate"
            value={data.oeDate}
            onChange={(e) => handleFieldChange('oeDate', e.target.value)}
            className={cn(
              'w-full px-3 py-2 border rounded-md',
              errors.oeDate && 'border-red-500',
            )}
            disabled={disabled}
          />
          {errors.oeDate && (
            <p className="text-sm text-red-600">{errors.oeDate}</p>
          )}
        </div>

        {/* Company Code */}
        <div className="space-y-2">
          <Label htmlFor="compCode">Company Code</Label>
          <select
            id="compCode"
            value={data.compCode}
            onChange={(e) => handleFieldChange('compCode', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            disabled={disabled}
          >
            <option value="HT">HT</option>
            <option value="BAT">BAT</option>
            <option value="INSP">INSP</option>
            <option value="HFW">HFW</option>
          </select>
        </div>

        {/* PO Number */}
        <div className="space-y-2">
          <Label htmlFor="poNo">PO Number</Label>
          <TextInput
            id="poNo"
            value={data.poNo || ''}
            onChange={(e) => handleFieldChange('poNo', e.target.value)}
            placeholder="Enter PO Number"
            disabled={disabled}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={data.status ?? 0}
            onChange={(e) => handleFieldChange('status', parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
            disabled={disabled}
          >
            <option value={0}>Draft</option>
            <option value={1}>Posted</option>
          </select>
        </div>

        {/* Remarks */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="remark">Remarks</Label>
          <textarea
            id="remark"
            value={data.remark || ''}
            onChange={(e) => handleFieldChange('remark', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter remarks"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
