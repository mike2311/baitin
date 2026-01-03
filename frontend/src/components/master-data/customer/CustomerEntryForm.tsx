import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Customer, CreateCustomerDto, UpdateCustomerDto, createCustomer, updateCustomer, getCustomer } from '@/services/api/customers'
import { cn } from '@/lib/utils'

/**
 * Customer Entry Form Component
 * 
 * Reference: Task 02-01 - Customer Entry Form
 */

interface CustomerEntryFormProps {
  custNo?: string
  mode?: 'create' | 'edit'
  onSuccess?: (customer: Customer) => void
  onCancel?: () => void
}

export function CustomerEntryForm({ custNo, mode = 'create', onSuccess, onCancel }: CustomerEntryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCustomerDto>()

  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const getErrorMessage = useCallback((error: unknown, fallback: string) => {
    const err = error as { response?: { data?: { message?: string } } }
    return err?.response?.data?.message || fallback
  }, [])

  const loadCustomer = useCallback(async (customerNo: string) => {
    try {
      setLoading(true)
      const customer = await getCustomer(customerNo)
      reset(customer)
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, 'Failed to load customer'))
    } finally {
      setLoading(false)
    }
  }, [getErrorMessage, reset])

  useEffect(() => {
    if (mode === 'edit' && custNo) {
      loadCustomer(custNo)
    }
  }, [mode, custNo, loadCustomer])

  const onSubmit = async (data: CreateCustomerDto) => {
    try {
      setSubmitError(null)
      
      if (mode === 'create') {
        const newCustomer = await createCustomer(data)
        onSuccess?.(newCustomer)
      } else if (mode === 'edit' && custNo) {
        const updatedCustomer = await updateCustomer(custNo, data as UpdateCustomerDto)
        onSuccess?.(updatedCustomer)
      }
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, 'Failed to save customer'))
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 max-w-4xl">
      {/* Form Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Create New Customer' : 'Edit Customer'}
        </h2>
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="custNo">
              Customer Number <span className="text-red-500">*</span>
            </Label>
            <input
              id="custNo"
              type="text"
              disabled={mode === 'edit'}
              className={cn(
                'w-full px-3 py-2 border rounded-md',
                errors.custNo && 'border-red-500',
                mode === 'edit' && 'bg-gray-100'
              )}
              {...register('custNo', { required: 'Customer Number is required' })}
            />
            {errors.custNo && (
              <p className="text-sm text-red-500 mt-1">{errors.custNo.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="ename">English Name</Label>
            <input
              id="ename"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('ename')}
            />
          </div>

          <div>
            <Label htmlFor="sname">Short Name</Label>
            <input
              id="sname"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('sname')}
            />
          </div>

          <div>
            <Label htmlFor="cname">Chinese Name</Label>
            <input
              id="cname"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('cname')}
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Address</h3>
        
        {(['addr1', 'addr2', 'addr3', 'addr4'] as const).map((field, idx) => (
          <div key={field}>
            <Label htmlFor={field}>Address Line {idx + 1}</Label>
            <input
              id={field}
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register(field)}
            />
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contName">Contact Name</Label>
            <input
              id="contName"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('contName')}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              className={cn(
                'w-full px-3 py-2 border rounded-md',
                errors.email && 'border-red-500'
              )}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tel">Telephone</Label>
            <input
              id="tel"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('tel')}
            />
          </div>

          <div>
            <Label htmlFor="tel2">Telephone 2</Label>
            <input
              id="tel2"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('tel2')}
            />
          </div>

          <div>
            <Label htmlFor="fax">Fax</Label>
            <input
              id="fax"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('fax')}
            />
          </div>

          <div>
            <Label htmlFor="fax2">Fax 2</Label>
            <input
              id="fax2"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('fax2')}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="showSubItemDetail"
            type="checkbox"
            className="w-4 h-4"
            {...register('showSubItemDetail')}
          />
          <Label htmlFor="showSubItemDetail" className="cursor-pointer">
            Show Sub Item Detail
          </Label>
        </div>
      </div>
    </form>
  )
}

