import React from 'react'
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Form Container Component
 * 
 * Wraps form with React Hook Form provider and handles submission.
 * 
 * Reference: Task 04-04 - Form Layout Components
 */
export interface FormContainerProps {
  children: React.ReactNode
  onSubmit: (data: any) => void | Promise<void>
  defaultValues?: any
  className?: string
}

export function FormContainer({
  children,
  onSubmit,
  defaultValues,
  className,
}: FormContainerProps) {
  const methods = useForm({ defaultValues })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
      >
        {children}
      </form>
    </FormProvider>
  )
}

/**
 * Form Section Component
 * 
 * Groups related fields with a title and optional description.
 * 
 * Reference: Task 04-04 - Form Layout Components
 */
export interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

/**
 * Form Field Group Component
 * 
 * Horizontal field layout with consistent spacing.
 * 
 * Reference: Task 04-04 - Form Layout Components
 */
export interface FormFieldGroupProps {
  columns?: 1 | 2 | 3 | 4
  children: React.ReactNode
  className?: string
}

export function FormFieldGroup({ columns = 2, children, className }: FormFieldGroupProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  )
}

/**
 * Form Actions Component
 * 
 * Standard action buttons for forms (Save, Cancel, etc.).
 * 
 * Reference: Task 04-04 - Form Layout Components
 */
export interface FormActionsProps {
  onSave?: () => void
  onCancel?: () => void
  onPrint?: () => void
  onExport?: () => void
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function FormActions({
  onSave,
  onCancel,
  onPrint,
  onExport,
  loading = false,
  disabled = false,
  className,
}: FormActionsProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2 border-t pt-4', className)}>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
          Cancel
        </Button>
      )}
      {onSave && (
        <Button type="submit" onClick={onSave} disabled={disabled || loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      )}
      {onPrint && (
        <Button type="button" variant="outline" onClick={onPrint} disabled={disabled}>
          Print
        </Button>
      )}
      {onExport && (
        <Button type="button" variant="outline" onClick={onExport} disabled={disabled}>
          Export
        </Button>
      )}
    </div>
  )
}


