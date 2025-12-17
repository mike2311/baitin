# Task 04-01: Text Input Component with Auto-Advance

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 4
- **Priority**: High
- **Estimated Effort**: 1 day
- **Dependencies**: Task 02-03 (Frontend Foundation)
- **Assignee**: Frontend Developer

## Objective

Create a reusable text input component with keyboard-first navigation, auto-advance on Enter, and inline validation support.

## Requirements

### 1. Component Features

#### Keyboard Navigation
- Tab key: Move to next field
- Enter key: Move to next field (if validation passes)
- Shift+Tab: Move to previous field
- Arrow keys: Normal text cursor behavior

#### Auto-Advance
- Automatically move focus to next field on Enter
- Only advance if current field is valid
- Prevent advance on validation errors

#### Inline Validation
- Show validation errors below field
- Don't block typing on validation errors
- Clear errors when field becomes valid
- Support async validation

#### Accessibility
- Proper label association
- ARIA attributes
- Keyboard accessible
- Screen reader support

### 2. Component Props

```typescript
interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onEnter?: () => void; // Called on Enter key
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
  autoFocus?: boolean;
  autoAdvance?: boolean; // Enable auto-advance
  validateOnBlur?: boolean;
}
```

### 3. UX Requirements

**Reference**: `docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md` lines 49-55

- **Keyboard**: Tab to focus, Enter to submit/next
- **Auto-Advance**: Move to next field on Enter (if valid)
- **Validation**: Show error inline, don't block typing
- **Formatting**: Auto-format on blur (for numbers)

## Implementation Steps

1. **Create Base Component**
   - Create TextInput component
   - Use shadcn/ui Input as base
   - Add label and error display

2. **Implement Auto-Advance**
   - Handle Enter key press
   - Find next input field
   - Focus next field if valid

3. **Add Validation Display**
   - Show error message below input
   - Style error state
   - Clear errors on input change

4. **Add Keyboard Handlers**
   - Enter key handler
   - Tab key handler (native)
   - Shift+Tab handler (native)

5. **Integrate with React Hook Form**
   - Create wrapper for RHF
   - Support validation from RHF
   - Handle form state

6. **Testing**
   - Test keyboard navigation
   - Test auto-advance
   - Test validation display
   - Test accessibility

## Acceptance Criteria

- [ ] Text input component created
- [ ] Keyboard navigation works (Tab, Enter, Shift+Tab)
- [ ] Auto-advance works on Enter (when valid)
- [ ] Inline validation displays correctly
- [ ] Error messages show/hide properly
- [ ] Component integrates with React Hook Form
- [ ] Accessibility requirements met
- [ ] Component is reusable
- [ ] Works with shadcn/ui styling

## Component Example

```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function TextInput({
  label,
  name,
  value,
  onChange,
  onEnter,
  error,
  autoAdvance = true,
  ...props
}: TextInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && autoAdvance && !error) {
      e.preventDefault();
      // Focus next input
      onEnter?.();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
```

## Testing Checklist

- [ ] Component renders correctly
- [ ] Tab key moves to next field
- [ ] Enter key advances when valid
- [ ] Enter key does not advance when invalid
- [ ] Error message displays correctly
- [ ] Error clears when input becomes valid
- [ ] Component works with React Hook Form
- [ ] Accessibility tested with screen reader

## Notes

- Base component on shadcn/ui Input
- Ensure consistent styling with design system
- Consider adding number formatting on blur
- Support different input types (text, number, etc.)

## Dependencies

- Task 02-03: Frontend Foundation
- shadcn/ui components installed

## Next Tasks

- Task 04-02: Lookup Component

## References

- **UX/UI Strategy**: `../../../../docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md`
- **PoC Strategy**: `../../../../docs/modernization-strategy/15-poc-strategy/poc-strategy.md`

