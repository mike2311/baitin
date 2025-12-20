import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Vendor, CreateVendorDto, UpdateVendorDto, createVendor, updateVendor, getVendor } from '@/services/api/vendors'
import { cn } from '@/lib/utils'

/**
 * Vendor Entry Form Component
 * 
 * Reference: Task 03-01 - Vendor Entry Form
 */

interface VendorEntryFormProps {
  vendorNo?: string
  mode?: 'create' | 'edit'
  onSuccess?: (vendor: Vendor) => void
  onCancel?: () => void
}

export function VendorEntryForm({ vendorNo, mode = 'create', onSuccess, onCancel }: VendorEntryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateVendorDto>()

  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && vendorNo) {
      loadVendor(vendorNo)
    }
  }, [mode, vendorNo])

  const loadVendor = async (vendorNo: string) => {
    try {
      setLoading(true)
      const vendor = await getVendor(vendorNo)
      reset(vendor)
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to load vendor')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CreateVendorDto) => {
    try {
      setSubmitError(null)
      
      if (mode === 'create') {
        const newVendor = await createVendor(data)
        onSuccess?.(newVendor)
      } else if (mode === 'edit' && vendorNo) {
        const updatedVendor = await updateVendor(vendorNo, data as UpdateVendorDto)
        onSuccess?.(updatedVendor)
      }
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to save vendor')
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 max-w-4xl">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Create New Vendor' : 'Edit Vendor'}
        </h2>
        <div className="flex gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vendorNo">
              Vendor Number <span className="text-red-500">*</span>
            </Label>
            <input
              id="vendorNo"
              type="text"
              disabled={mode === 'edit'}
              className={cn(
                'w-full px-3 py-2 border rounded-md',
                errors.vendorNo && 'border-red-500',
                mode === 'edit' && 'bg-gray-100'
              )}
              {...register('vendorNo', { required: 'Vendor Number is required' })}
            />
            {errors.vendorNo && (
              <p className="text-sm text-red-500 mt-1">{errors.vendorNo.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              className={cn(
                'w-full px-3 py-2 border rounded-md',
                errors.type && 'border-red-500'
              )}
              {...register('type', {
                valueAsNumber: true,
                validate: (value) => 
                  value === undefined || value === 1 || value === 2 || 
                  'Type must be 1 (Vendor) or 2 (Maker)'
              })}
            >
              <option value="">Select Type</option>
              <option value="1">1 - Vendor</option>
              <option value="2">2 - Maker</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="ename">English Name</Label>
            <input id="ename" type="text" className="w-full px-3 py-2 border rounded-md" {...register('ename')} />
          </div>

          <div>
            <Label htmlFor="sname">Short Name</Label>
            <input id="sname" type="text" className="w-full px-3 py-2 border rounded-md" {...register('sname')} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Address</h3>
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <Label htmlFor={`addr${i}`}>Address Line {i}</Label>
            <input id={`addr${i}`} type="text" className="w-full px-3 py-2 border rounded-md" {...register(`addr${i}` as any)} />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contName">Contact Name</Label>
            <input id="contName" type="text" className="w-full px-3 py-2 border rounded-md" {...register('contName')} />
          </div>
          <div>
            <Label htmlFor="tel">Telephone</Label>
            <input id="tel" type="text" className="w-full px-3 py-2 border rounded-md" {...register('tel')} />
          </div>
          <div>
            <Label htmlFor="tel2">Telephone 2</Label>
            <input id="tel2" type="text" className="w-full px-3 py-2 border rounded-md" {...register('tel2')} />
          </div>
          <div>
            <Label htmlFor="fax">Fax</Label>
            <input id="fax" type="text" className="w-full px-3 py-2 border rounded-md" {...register('fax')} />
          </div>
          <div>
            <Label htmlFor="fax2">Fax 2</Label>
            <input id="fax2" type="text" className="w-full px-3 py-2 border rounded-md" {...register('fax2')} />
          </div>
        </div>
      </div>
    </form>
  )
}

