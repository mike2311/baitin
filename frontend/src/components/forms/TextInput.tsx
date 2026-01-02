import React, { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * Text Input Component with Auto-Advance
 * 
 * Provides keyboard-first navigation with auto-advance on Enter.
 * 
 * Original Logic Reference:
 * - Documentation: docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md lines 49-55
 * 
 * UX Requirements:
 * - Tab to focus, Enter to submit/next
 * - Auto-Advance: Move to next field on Enter (if valid)
 * - Validation: Show error inline, don't block typing
 * 
 * Reference: Task 04-01 - Text Input Component
 */
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  autoAdvance?: boolean
  onEnter?: () => void
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, autoAdvance = true, onEnter, className, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const combinedRef = ref || inputRef

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && autoAdvance && !error) {
        e.preventDefault()
        onEnter?.()
        // Find next input field
        const form = e.currentTarget.form
        if (form) {
          const inputs = Array.from(form.querySelectorAll('input, textarea, select'))
          const currentIndex = inputs.indexOf(e.currentTarget)
          const nextInput = inputs[currentIndex + 1] as HTMLElement
          if (nextInput) {
            nextInput.focus()
          }
        }
      }
      props.onKeyDown?.(e)
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id || props.name} className={error ? 'text-destructive' : ''}>
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Input
          ref={combinedRef}
          className={cn(error && 'border-destructive', className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {error && (
          <p
            id={`${props.id || props.name}-error`}
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'


