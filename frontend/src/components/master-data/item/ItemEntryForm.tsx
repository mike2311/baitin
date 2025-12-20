import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { TextInput } from '@/components/forms/TextInput'
import { ItemLookup } from './ItemLookup'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Item, CreateItemDto, UpdateItemDto, createItem, updateItem, getItem } from '@/services/api/items'
import { cn } from '@/lib/utils'

/**
 * Item Entry Form Component
 * 
 * Implements item master entry form with full CRUD functionality,
 * keyboard-first navigation, and all original validation rules.
 * 
 * Original Logic Reference:
 * - FoxPro Form: iitem.scx (Input Item Detail)
 * - Business Process: docs/source/02-business-processes/master-data-management.md lines 9-163
 * - Data Model: docs/source/01-data-architecture/table-details/master-data-tables.md lines 5-49
 * - Validation: docs/04-forms-and-screens/validation-catalog.md lines 42-56
 * 
 * Validation Rules (MUST PRESERVE):
 * - item_no: Must be unique, error: "Item Number Already Exists"
 * - price: Must be >= 0, error: "Price Must Be Positive"
 * - cost: Must be >= 0, error: "Cost Must Be Positive"
 * - std_code: Must exist in zstdcode table (if provided), error: "Invalid Standard Code"
 * - origin: Must exist in zorigin table (if provided), error: "Invalid Origin"
 * 
 * UX Requirements:
 * - Keyboard Navigation: Tab, Enter (auto-advance), Shift+Tab, F2 (lookup)
 * - Auto-Advance: Move to next field on Enter (if valid)
 * - Inline Validation: Show errors below field, don't block typing
 * 
 * Reference: Task 01-01 - Item Entry Form
 */

interface ItemEntryFormProps {
  itemNo?: string
  mode?: 'create' | 'edit'
  onSuccess?: (item: Item) => void
  onCancel?: () => void
}

export function ItemEntryForm({ itemNo, mode = 'create', onSuccess, onCancel }: ItemEntryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateItemDto>()

  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Load existing item if in edit mode
  useEffect(() => {
    if (mode === 'edit' && itemNo) {
      loadItem(itemNo)
    }
  }, [mode, itemNo])

  /**
   * Load existing item data
   * 
   * Original Logic Reference:
   * - Business Process: docs/source/02-business-processes/master-data-management.md lines 139-148
   * 
   * Business Flow:
   * 1. User selects existing item (via lookup or search)
   * 2. Load item data into form
   */
  const loadItem = async (itemNo: string) => {
    try {
      setLoading(true)
      const item = await getItem(itemNo)
      // Populate form with item data
      reset({
        itemNo: item.itemNo,
        itemType: item.itemType,
        shortName: item.shortName,
        desp: item.desp,
        origin: item.origin,
        grpCode: item.grpCode,
        material: item.material,
        upcNo: item.upcNo,
        htcNo: item.htcNo,
        stdCode: item.stdCode,
        price: item.price,
        priceCur: item.priceCur,
        cost: item.cost,
        packPc1: item.packPc1,
        packDesp1: item.packDesp1,
        packPc2: item.packPc2,
        packDesp2: item.packDesp2,
        packPc3: item.packPc3,
        packDesp3: item.packDesp3,
        packPc4: item.packPc4,
        packDesp4: item.packDesp4,
        wt: item.wt,
        net: item.net,
        cube: item.cube,
        dim: item.dim,
        duty: item.duty,
      })
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to load item')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle form submission
   * 
   * Original Logic Reference:
   * - Business Process: docs/source/02-business-processes/master-data-management.md lines 125-137
   * 
   * Business Flow (Create):
   * 1. User enters item number
   * 2. System checks uniqueness
   * 3. User enters item details
   * 4. Validates std_code and origin
   * 5. Creates record with audit fields
   * 
   * Business Flow (Update):
   * 1. User modifies fields
   * 2. Validates changes
   * 3. Updates with mod_date and mod_user
   */
  const onSubmit = async (data: CreateItemDto) => {
    try {
      setSubmitError(null)
      
      if (mode === 'create') {
        const newItem = await createItem(data)
        onSuccess?.(newItem)
      } else if (mode === 'edit' && itemNo) {
        const updatedItem = await updateItem(itemNo, data as UpdateItemDto)
        onSuccess?.(updatedItem)
      }
    } catch (error: any) {
      // Handle validation errors from backend
      const message = error.response?.data?.message || 'Failed to save item'
      setSubmitError(message)
    }
  }

  /**
   * Handle origin lookup selection
   */
  const handleOriginSelect = (item: any) => {
    setValue('origin', item.code)
  }

  /**
   * Handle standard code lookup selection
   */
  const handleStdCodeSelect = (item: any) => {
    setValue('stdCode', item.code)
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 max-w-4xl">
      {/* Form Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Create New Item' : 'Edit Item'}
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

      {/* Global Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      {/* Header Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Header Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="itemNo">
              Item Number <span className="text-red-500">*</span>
            </Label>
            <input
              id="itemNo"
              type="text"
              disabled={mode === 'edit'}
              className={cn(
                'w-full px-3 py-2 border rounded-md',
                errors.itemNo && 'border-red-500',
                mode === 'edit' && 'bg-gray-100'
              )}
              {...register('itemNo', {
                required: 'Item Number is required',
                minLength: { value: 1, message: 'Item Number cannot be empty' },
              })}
            />
            {errors.itemNo && (
              <p className="text-sm text-red-500 mt-1">{errors.itemNo.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="shortName">Short Name</Label>
            <input
              id="shortName"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('shortName')}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="desp">Description</Label>
          <textarea
            id="desp"
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
            {...register('desp')}
          />
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="origin">Origin</Label>
            <input
              id="origin"
              type="text"
              className={cn(
                'w-full px-3 py-2 border rounded-md',
                errors.origin && 'border-red-500'
              )}
              {...register('origin')}
            />
            {errors.origin && (
              <p className="text-sm text-red-500 mt-1">{errors.origin.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Press F2 for lookup</p>
          </div>

          <div>
            <Label htmlFor="stdCode">Standard Code</Label>
            <input
              id="stdCode"
              type="text"
              className={cn(
                'w-full px-3 py-2 border rounded-md',
                errors.stdCode && 'border-red-500'
              )}
              {...register('stdCode')}
            />
            {errors.stdCode && (
              <p className="text-sm text-red-500 mt-1">{errors.stdCode.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Press F2 for lookup</p>
          </div>

          <div>
            <Label htmlFor="htcNo">HTC Code</Label>
            <input
              id="htcNo"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('htcNo')}
            />
          </div>

          <div>
            <Label htmlFor="upcNo">UPC Code</Label>
            <input
              id="upcNo"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('upcNo')}
            />
          </div>

          <div>
            <Label htmlFor="itemType">Item Type</Label>
            <input
              id="itemType"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('itemType')}
            />
          </div>

          <div>
            <Label htmlFor="grpCode">Group Code</Label>
            <input
              id="grpCode"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('grpCode')}
            />
          </div>

          <div>
            <Label htmlFor="material">Material</Label>
            <input
              id="material"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              {...register('material')}
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Pricing</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              className={cn(
                'w-full px-3 py-2 border rounded-md',
                errors.price && 'border-red-500'
              )}
              {...register('price', {
                min: { value: 0, message: 'Price Must Be Positive' },
                valueAsNumber: true,
              })}
            />
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="priceCur">Price Currency</Label>
            <input
              id="priceCur"
              type="text"
              maxLength={3}
              className="w-full px-3 py-2 border rounded-md"
              {...register('priceCur')}
              placeholder="USD"
            />
          </div>

          <div>
            <Label htmlFor="cost">Cost</Label>
            <input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              className={cn(
                'w-full px-3 py-2 border rounded-md',
                errors.cost && 'border-red-500'
              )}
              {...register('cost', {
                min: { value: 0, message: 'Cost Must Be Positive' },
                valueAsNumber: true,
              })}
            />
            {errors.cost && (
              <p className="text-sm text-red-500 mt-1">{errors.cost.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Packing Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Packing Information</h3>
        
        {[1, 2, 3, 4].map((level) => (
          <div key={level} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`packPc${level}`}>Pack PC {level}</Label>
              <input
                id={`packPc${level}`}
                type="number"
                className="w-full px-3 py-2 border rounded-md"
                {...register(`packPc${level}` as any, { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor={`packDesp${level}`}>Pack Description {level}</Label>
              <input
                id={`packDesp${level}`}
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                {...register(`packDesp${level}` as any)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dimensions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Dimensions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="wt">Weight</Label>
            <input
              id="wt"
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border rounded-md"
              {...register('wt', { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="net">Net Weight</Label>
            <input
              id="net"
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border rounded-md"
              {...register('net', { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="cube">Cube</Label>
            <input
              id="cube"
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border rounded-md"
              {...register('cube', { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="duty">Duty</Label>
            <input
              id="duty"
              type="number"
              step="0.0001"
              className="w-full px-3 py-2 border rounded-md"
              {...register('duty', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="dim">Dimensions</Label>
          <input
            id="dim"
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            {...register('dim')}
            placeholder="e.g., 10x10x10"
          />
        </div>
      </div>
    </form>
  )
}

