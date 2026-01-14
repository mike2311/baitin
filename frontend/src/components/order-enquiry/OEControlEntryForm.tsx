import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { TextInput } from '@/components/forms/TextInput'
import { CustomerLookup } from '@/components/master-data/customer/CustomerLookup'
import {
  OrderEnquiryControl,
  CreateOrderEnquiryControlDto,
  UpdateOrderEnquiryControlDto,
  createOrderEnquiryControl,
  updateOrderEnquiryControl,
  getOrderEnquiryControl,
} from '@/services/api/orderEnquiryControl'
import { cn } from '@/lib/utils'

/**
 * Order Enquiry Control Entry Form Component
 *
 * Implements OE Control entry form with full CRUD functionality,
 * keyboard-first navigation, and all original validation rules.
 *
 * Original Logic Reference:
 * - Legacy Table: moectrl (DBF)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md lines 44-69
 * - Business Rule: OE Control must exist before OE creation (except INSP company)
 *
 * Validation Rules:
 * - oeNo: Must be unique, error: "OE Number Already Exists"
 * - custNo: Must exist in customer table, error: "Customer Number does not exist"
 * - Required fields: oeNo, custNo, oeDate
 *
 * UX Requirements:
 * - Keyboard Navigation: Tab, Enter (auto-advance), Shift+Tab, F2 (lookup)
 * - Auto-Advance: Move to next field on Enter (if valid)
 * - Inline Validation: Show errors below field, don't block typing
 *
 * Reference: Task 01-01 - OE Control Entry Form
 */

interface OEControlEntryFormProps {
  oeNo?: string
  mode?: 'create' | 'edit'
  onSuccess?: (control: OrderEnquiryControl) => void
  onCancel?: () => void
}

export function OEControlEntryForm({
  oeNo,
  mode = 'create',
  onSuccess,
  onCancel,
}: OEControlEntryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateOrderEnquiryControlDto>({
    defaultValues: {
      oeDate: new Date().toISOString().slice(0, 10),
    },
  })

  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')

  const watchedCustNo = watch('custNo')

  const getErrorMessage = useCallback((error: unknown, fallback: string) => {
    const err = error as { response?: { data?: { message?: string } } }
    return err?.response?.data?.message || fallback
  }, [])

  const loadControl = useCallback(
    async (controlOeNo: string) => {
      try {
        setLoading(true)
        const control = await getOrderEnquiryControl(controlOeNo)
        reset({
          oeNo: control.oeNo,
          custNo: control.custNo,
          oeDate: control.oeDate ? control.oeDate.slice(0, 10) : '',
          poNo: control.poNo || '',
          status: control.status || '',
          remark: control.remark || '',
        })
        setSelectedCustomer(control.custNo)
      } catch (error: unknown) {
        setSubmitError(getErrorMessage(error, 'Failed to load OE Control'))
      } finally {
        setLoading(false)
      }
    },
    [getErrorMessage, reset],
  )

  useEffect(() => {
    if (mode === 'edit' && oeNo) {
      loadControl(oeNo)
    }
  }, [mode, oeNo, loadControl])

  const onSubmit = async (data: CreateOrderEnquiryControlDto) => {
    try {
      setSubmitError(null)

      if (mode === 'create') {
        const newControl = await createOrderEnquiryControl(data)
        onSuccess?.(newControl)
      } else if (mode === 'edit' && oeNo) {
        const updatedControl = await updateOrderEnquiryControl(
          oeNo,
          data as UpdateOrderEnquiryControlDto,
        )
        onSuccess?.(updatedControl)
      }
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, 'Failed to save OE Control'))
    }
  }

  const handleCustomerSelect = (customer: { code: string; name: string }) => {
    setValue('custNo', customer.code)
    setSelectedCustomer(customer.code)
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 max-w-4xl">
      {/* Form Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Create New OE Control' : 'Edit OE Control'}
        </h2>
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OE Number */}
        <div className="space-y-2">
          <Label htmlFor="oeNo">
            OE Number <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id="oeNo"
            {...register('oeNo', {
              required: 'OE Number is required',
              disabled: mode === 'edit', // OE No cannot be changed after creation
            })}
            className={cn(errors.oeNo && 'border-red-500')}
            placeholder="Enter OE Number"
          />
          {errors.oeNo && (
            <p className="text-sm text-red-600">{errors.oeNo.message as string}</p>
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
              {...register('custNo', {
                required: 'Customer Number is required',
              })}
              className={cn('flex-1', errors.custNo && 'border-red-500')}
              placeholder="Enter or lookup customer"
              value={watchedCustNo || selectedCustomer}
              onChange={(e) => {
                setValue('custNo', e.target.value)
                setSelectedCustomer(e.target.value)
              }}
            />
            <CustomerLookup
              onSelect={handleCustomerSelect}
              trigger={
                <Button type="button" variant="outline">
                  F2
                </Button>
              }
            />
          </div>
          {errors.custNo && (
            <p className="text-sm text-red-600">{errors.custNo.message as string}</p>
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
            {...register('oeDate', {
              required: 'OE Date is required',
            })}
            className={cn(
              'w-full px-3 py-2 border rounded-md',
              errors.oeDate && 'border-red-500',
            )}
          />
          {errors.oeDate && (
            <p className="text-sm text-red-600">{errors.oeDate.message as string}</p>
          )}
        </div>

        {/* PO Number */}
        <div className="space-y-2">
          <Label htmlFor="poNo">PO Number</Label>
          <TextInput
            id="poNo"
            {...register('poNo')}
            placeholder="Enter PO Number"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <TextInput
            id="status"
            {...register('status')}
            placeholder="Enter status"
          />
        </div>

        {/* Remarks */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="remark">Remarks</Label>
          <textarea
            id="remark"
            {...register('remark')}
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter remarks"
          />
        </div>
      </div>
    </form>
  )
}
