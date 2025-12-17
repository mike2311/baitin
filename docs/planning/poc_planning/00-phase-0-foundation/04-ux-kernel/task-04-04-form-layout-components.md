# Task 04-04: Form Layout Components

## Task Information

- **Phase**: 0 - Foundation
- **Sprint**: Week 4
- **Priority**: Medium
- **Estimated Effort**: 1 day
- **Dependencies**: Task 04-01 (Text Input), Task 04-02 (Lookup)
- **Assignee**: Frontend Developer

## Objective

Create reusable form layout components for consistent form structure, field grouping, and layout patterns used throughout the application.

## Requirements

### 1. Form Container Component

#### Features
- Standard form wrapper
- Form validation integration
- Submit handling
- Loading states
- Error display

### 2. Form Section Component

#### Features
- Group related fields
- Section title
- Optional description
- Visual grouping

### 3. Form Field Group Component

#### Features
- Horizontal field layout
- Responsive design
- Consistent spacing
- Label alignment

### 4. Form Actions Component

#### Features
- Action buttons (Save, Cancel, etc.)
- Consistent button placement
- Loading states
- Disabled states

### 5. Layout Patterns

#### Standard Form Pattern
```
┌─────────────────────────────────────────┐
│ Header Section                          │
│ [Field 1] [Field 2] [Field 3]         │
│                                         │
│ Detail Grid Section                     │
│ ┌─────────────────────────────────────┐ │
│ │ Item | Qty | Price | Total | ...   │ │
│ │ [Grid with keyboard navigation]     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Footer Section                          │
│ [Save] [Cancel] [Print] [Export]      │
└─────────────────────────────────────────┘
```

**Reference**: `docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md` lines 97-122

## Implementation Steps

1. **Create Form Container**
   - Create FormContainer component
   - Integrate with React Hook Form
   - Handle form submission

2. **Create Form Section**
   - Create FormSection component
   - Add section title
   - Group fields visually

3. **Create Form Field Group**
   - Create FormFieldGroup component
   - Support horizontal layout
   - Responsive design

4. **Create Form Actions**
   - Create FormActions component
   - Standard button layout
   - Handle actions

5. **Create Layout Templates**
   - Standard form layout
   - Header-detail layout
   - List-detail layout

6. **Styling**
   - Match design system
   - Ensure consistency
   - Responsive design

7. **Testing**
   - Test layouts
   - Test responsiveness
   - Test accessibility

## Acceptance Criteria

- [ ] Form container component created
- [ ] Form section component created
- [ ] Form field group component created
- [ ] Form actions component created
- [ ] Layout templates created
- [ ] Components integrate with React Hook Form
- [ ] Components are reusable
- [ ] Styling matches design system
- [ ] Responsive design works
- [ ] Accessibility requirements met

## Component Examples

### FormContainer

```typescript
import { FormProvider, useForm } from 'react-hook-form';

export function FormContainer({
  children,
  onSubmit,
  defaultValues,
  ...props
}: FormContainerProps) {
  const methods = useForm({ defaultValues });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} {...props}>
        {children}
      </form>
    </FormProvider>
  );
}
```

### FormSection

```typescript
export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
```

### FormFieldGroup

```typescript
export function FormFieldGroup({
  columns = 2,
  children,
}: FormFieldGroupProps) {
  return (
    <div
      className={`grid gap-4 ${
        columns === 2 ? 'grid-cols-2' : 'grid-cols-3'
      }`}
    >
      {children}
    </div>
  );
}
```

### FormActions

```typescript
import { Button } from '@/components/ui/button';

export function FormActions({
  onSave,
  onCancel,
  onPrint,
  onExport,
  loading = false,
  disabled = false,
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2 border-t pt-4">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
      {onSave && (
        <Button type="submit" onClick={onSave} disabled={disabled || loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      )}
      {onPrint && (
        <Button type="button" variant="outline" onClick={onPrint}>
          Print
        </Button>
      )}
      {onExport && (
        <Button type="button" variant="outline" onClick={onExport}>
          Export
        </Button>
      )}
    </div>
  );
}
```

## Testing Checklist

- [ ] Form container works with React Hook Form
- [ ] Form sections group fields correctly
- [ ] Field groups layout correctly
- [ ] Form actions display correctly
- [ ] Layout templates work
- [ ] Responsive design works
- [ ] Components are reusable
- [ ] Accessibility tested

## Notes

- Use shadcn/ui components as base
- Ensure consistent spacing and alignment
- Support different layout patterns
- Keep components flexible and composable
- Follow design system guidelines

## Dependencies

- Task 04-01: Text Input Component
- Task 04-02: Lookup Component
- Task 02-03: Frontend Foundation

## Next Tasks

- Phase 1: Master Data Module tasks

## References

- **UX/UI Strategy**: `../../../../docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md` (lines 97-122)
- **PoC Strategy**: `../../../../docs/modernization-strategy/15-poc-strategy/poc-strategy.md`

