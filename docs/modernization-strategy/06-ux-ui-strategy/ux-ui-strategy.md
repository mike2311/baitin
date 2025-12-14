# UX/UI Strategy

## Overview

This document defines the user experience and user interface strategy for the modernized BAITIN system. The primary goal is to deliver a **Windows-like fast input experience** in a web application, with keyboard-first navigation, shortcuts, and automatic field progression that users are accustomed to in desktop applications.

## UX Principles

### 1. Keyboard-First Design
- **Primary Input Method:** Keyboard, not mouse
- **Shortcuts:** Global shortcuts for all major actions
- **Navigation:** Tab/Enter navigation between fields
- **Type-to-Search:** Instant search in lookups

### 2. Fast Data Entry
- **Auto-Advance:** Automatic focus to next field on Enter
- **Auto-Complete:** Smart autocomplete for codes and names
- **Inline Validation:** Real-time validation without blocking
- **Bulk Operations:** Copy/paste, multi-row operations

### 3. Excel-Like Grid Experience
- **Grid Navigation:** Arrow keys, Tab, Enter navigation
- **Copy/Paste:** Excel-style copy/paste support
- **Multi-Select:** Shift/Ctrl for multi-row selection
- **Inline Editing:** Direct cell editing

### 4. Minimal Latency
- **Client-Side Validation:** Instant feedback
- **Optimistic Updates:** Update UI immediately, sync later
- **Debounced Search:** Fast search without lag
- **Cached Lookups:** Master data cached for instant access

### 5. Error Prevention
- **Inline Validation:** Show errors as user types
- **Smart Defaults:** Pre-fill common values
- **Confirmation Dialogs:** Only for destructive actions
- **Undo/Redo:** Support undo for data entry

### 6. Consistency
- **Pattern Reuse:** Same patterns across all screens
- **Shortcut Consistency:** Same shortcuts for same actions
- **Layout Consistency:** Consistent form layouts
- **Terminology:** Consistent terminology throughout

## Design System

### Component Library

#### Input Components

##### Text Input
- **Keyboard:** Tab to focus, Enter to submit/next
- **Auto-Advance:** Move to next field on Enter (if valid)
- **Validation:** Show error inline, don't block typing
- **Autocomplete:** Show suggestions as user types

##### Number Input
- **Formatting:** Auto-format on blur (e.g., 1000 → 1,000.00)
- **Validation:** Real-time validation (min/max, decimals)
- **Keyboard:** Arrow keys for increment/decrement

##### Date Input
- **Format:** Consistent date format (MM/DD/YYYY)
- **Keyboard:** Type date directly or use date picker
- **Shortcuts:** Today (T), Clear (C)

##### Lookup/Select
- **Type-to-Search:** Instant search as user types
- **Keyboard:** Arrow keys to navigate, Enter to select
- **Display:** Show code and description
- **Recent:** Show recently used items first

#### Data Grid Component

##### AG Grid Enterprise Features
- **Keyboard Navigation:**
  - Arrow keys: Move between cells
  - Tab/Enter: Move to next cell
  - Shift+Tab: Move to previous cell
  - Ctrl+C/Ctrl+V: Copy/paste
  - Ctrl+A: Select all
  - F2: Edit cell
  - Escape: Cancel edit

- **Excel-Like Features:**
  - Copy/paste from Excel
  - Multi-row selection
  - Inline editing
  - Auto-save on cell change
  - Row-level validation

- **Performance:**
  - Virtual scrolling for large datasets
  - Lazy loading
  - Client-side filtering/sorting

#### Form Layout

##### Standard Form Pattern
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

##### Field Layout Rules
- **Grouping:** Related fields grouped together
- **Labels:** Clear, concise labels
- **Placeholders:** Helpful placeholder text
- **Help Text:** Contextual help available
- **Errors:** Inline error messages

### Color Scheme

#### Primary Colors
- **Primary:** Indigo/Blue (matches current system)
- **Secondary:** Gray for secondary actions
- **Success:** Green for success messages
- **Error:** Red for errors
- **Warning:** Orange for warnings
- **Info:** Blue for informational messages

#### Accessibility
- **Contrast:** WCAG AA compliance (4.5:1 contrast ratio)
- **Color Blind:** Don't rely solely on color
- **Focus Indicators:** Clear focus indicators

### Typography

#### Font Family
- **Primary:** System font stack (fast rendering)
- **Monospace:** For codes, numbers
- **Sizes:** 14px base, 12px small, 16px large

#### Hierarchy
- **Headings:** Clear heading hierarchy
- **Body:** Readable body text
- **Labels:** Clear field labels

## Keyboard Shortcuts

### Global Shortcuts

#### Navigation
- **Alt+F:** File menu
- **Alt+O:** Order Enquiry
- **Alt+C:** Order Confirmation / Contract
- **Alt+S:** Shipping Order
- **Alt+D:** Delivery Note
- **Alt+I:** Invoice
- **Alt+E:** Enquiry / Exit
- **Alt+R:** Report
- **Alt+A:** Acrobat File
- **Alt+L:** Logout

#### Common Actions
- **Ctrl+N:** New record
- **Ctrl+S:** Save
- **Ctrl+E:** Edit
- **Ctrl+D:** Delete
- **Ctrl+P:** Print
- **Ctrl+F:** Find/Search
- **Ctrl+Z:** Undo
- **Ctrl+Y:** Redo
- **Escape:** Cancel/Close
- **F1:** Help

#### Data Entry
- **Enter:** Submit/Next field
- **Tab:** Next field
- **Shift+Tab:** Previous field
- **Arrow Keys:** Navigate grid/options
- **Ctrl+Enter:** Save and New
- **F2:** Edit current cell/field

### Module-Specific Shortcuts

#### Order Enquiry
- **Ctrl+I:** Import from Excel
- **Ctrl+E:** Export to Excel
- **F5:** Refresh data
- **Ctrl+B:** Quantity Breakdown

#### Master Data
- **Ctrl+F:** Find item/customer/vendor
- **Ctrl+C:** Copy code
- **F3:** Duplicate record

## Screen-by-Screen UX Specifications

### 1. Login Screen

#### Layout
```
┌─────────────────────────────────────┐
│     BAITIN Trading System          │
│                                     │
│     [Username Input]                │
│     [Password Input]                │
│     [Company Select]                │
│                                     │
│     [Login Button]                  │
└─────────────────────────────────────┘
```

#### Keyboard Behavior
- **Tab:** Username → Password → Company → Login
- **Enter:** Submit login (when on Login button)
- **Escape:** Cancel/Close

#### Validation
- **Real-time:** Validate as user types
- **Error Display:** Show error below field
- **Focus:** Auto-focus on username on load

### 2. Order Enquiry Entry Screen

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ Order Enquiry Entry                    [X]          │
├─────────────────────────────────────────────────────┤
│ Header Section                                      │
│ OE No: [____]  Date: [____]  Customer: [____]      │
│ PO No: [____]  Status: [____]                       │
│                                                     │
│ Detail Grid                                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Item No │ Description │ Qty │ Price │ Total │   │ │
│ │ [____]  │ [________]   │ [__]│ [____]│ [____]│   │ │
│ │ [____]  │ [________]   │ [__]│ [____]│ [____]│   │ │
│ │ [____]  │ [________]   │ [__]│ [____]│ [____]│   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [Save] [Cancel] [Import Excel] [Print] [Export]   │
└─────────────────────────────────────────────────────┘
```

#### Keyboard Behavior

##### Header Fields
- **OE No:** Tab → Date → Customer → PO No → Status
- **Enter:** Move to next field (if valid)
- **Lookup:** F2 or type to search (for Customer)

##### Detail Grid
- **Tab/Enter:** Move to next cell
- **Arrow Keys:** Navigate between cells
- **F2:** Edit current cell
- **Ctrl+Enter:** Add new row
- **Delete:** Delete selected row(s)
- **Ctrl+C/Ctrl+V:** Copy/paste from Excel

##### Item Lookup
- **Type:** Auto-search as user types
- **Arrow Keys:** Navigate suggestions
- **Enter:** Select item, auto-fill description, move to Qty
- **Escape:** Cancel lookup

##### Quantity Entry
- **Enter:** Calculate Total, move to Price
- **Auto-Calculate:** Total = Qty × Price

##### Price Entry
- **Enter:** Calculate Total, move to next row Item No
- **Auto-Add Row:** Add new row if at last row

#### Validation
- **Item No:** Validate exists, show error if not found
- **Qty:** Must be > 0, show error if invalid
- **Price:** Must be >= 0, show error if invalid
- **Total:** Auto-calculated, read-only

#### Auto-Save
- **Trigger:** Auto-save on field blur or every 30 seconds
- **Indicator:** Show "Saving..." / "Saved" indicator
- **Error:** Show error if save fails, allow retry

### 3. Master Data Entry (Item/Customer/Vendor)

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ Item Entry                            [X]           │
├─────────────────────────────────────────────────────┤
│ Item No: [____]  [Find]                            │
│ Description: [________________________________]     │
│ Standard Code: [____]  Origin: [____]               │
│ Price: [____]  Cost: [____]  Unit: [____]           │
│                                                     │
│ [Additional Fields...]                              │
│                                                     │
│ [Save] [Cancel] [New] [Delete] [Print]             │
└─────────────────────────────────────────────────────┘
```

#### Keyboard Behavior
- **Tab:** Navigate through fields
- **Enter:** Move to next field (if valid)
- **F2:** Find/Lookup (opens search dialog)
- **Ctrl+S:** Save
- **Ctrl+N:** New record
- **Ctrl+D:** Delete (with confirmation)
- **Escape:** Cancel/Close

#### Lookup Dialog
- **Type-to-Search:** Instant search as user types
- **Arrow Keys:** Navigate results
- **Enter:** Select and close, populate field
- **Escape:** Cancel

### 4. Excel Import Screen

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ Import Order Enquiry from Excel        [X]          │
├─────────────────────────────────────────────────────┤
│ [Select File] [browse...]                           │
│                                                     │
│ File: orders.xlsx                                  │
│ Format: [Standard Format ▼]                         │
│                                                     │
│ Field Mapping                                       │
│ Excel Column → System Field                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ITEM → Item No                                  │ │
│ │ QTY → Quantity                                   │ │
│ │ PRICE → Price                                   │ │
│ │ [Auto-detected or manual mapping]               │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [Import] [Cancel] [Preview]                         │
│                                                     │
│ Progress: [████████░░] 50%                          │
│ Status: Importing...                               │
│                                                     │
│ Results:                                            │
│ ✅ 100 records imported                            │
│ ⚠️  5 records with warnings                        │
│ ❌ 2 records failed                                 │
│                                                     │
│ [View Errors] [Export Error Report]                │
└─────────────────────────────────────────────────────┘
```

#### Keyboard Behavior
- **Tab:** Navigate through controls
- **Enter:** Start import (when on Import button)
- **Escape:** Cancel/Close

#### Import Process
- **Upload:** Drag-drop or browse
- **Auto-Detect:** Auto-detect field mapping
- **Preview:** Show preview of first 10 rows
- **Progress:** Real-time progress indicator
- **Results:** Summary with error details
- **Error Report:** Export errors to Excel

### 5. Enquiry/List Screens

#### Layout
```
┌─────────────────────────────────────────────────────┐
│ Order Enquiry List                    [X]           │
├─────────────────────────────────────────────────────┤
│ Filters                                             │
│ OE No: [____]  Customer: [____]  Date: [____]     │
│ [Search] [Clear] [Export]                          │
│                                                     │
│ Results Grid                                        │
│ ┌─────────────────────────────────────────────────┐ │
│ │ OE No │ Date │ Customer │ Items │ Status │     │ │
│ │ 12345 │ ...  │ ABC Co   │   10  │ Active │     │ │
│ │ 12346 │ ...  │ XYZ Inc  │    5  │ Posted │     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [New] [Edit] [Delete] [Print] [Export]             │
└─────────────────────────────────────────────────────┘
```

#### Keyboard Behavior
- **Tab:** Navigate filters
- **Enter:** Execute search (when on Search button)
- **Arrow Keys:** Navigate grid rows
- **Enter:** Open selected record
- **Ctrl+F:** Focus search/filter
- **F5:** Refresh data

#### Grid Features
- **Sorting:** Click header to sort
- **Filtering:** Inline filters on columns
- **Selection:** Single or multi-select
- **Pagination:** Page through results

## Performance Targets

### Response Times
- **Page Load:** < 2 seconds (first load)
- **Navigation:** < 500ms (between pages)
- **API Response:** < 500ms (p95)
- **Data Entry:** < 100ms (client-side validation)
- **Lookup Search:** < 200ms (cached lookups)
- **Excel Import:** < 30 seconds (1000 rows)
- **Report Generation:** < 10 seconds (standard reports)

### Perceived Performance
- **Optimistic Updates:** Update UI immediately
- **Loading States:** Show loading indicators for > 500ms operations
- **Skeleton Screens:** Show skeleton while loading
- **Progressive Loading:** Load critical content first

## Accessibility Requirements

### WCAG 2.1 Compliance
- **Level:** AA compliance
- **Keyboard Navigation:** Full keyboard accessibility
- **Screen Readers:** ARIA labels, semantic HTML
- **Focus Indicators:** Clear focus indicators
- **Color Contrast:** 4.5:1 contrast ratio

### Keyboard Accessibility
- **Tab Order:** Logical tab order
- **Skip Links:** Skip to main content
- **Focus Management:** Proper focus management
- **Keyboard Traps:** No keyboard traps

## User Training and Change Management

### Training Approach
- **Interactive Tutorials:** In-app tutorials for new users
- **Video Guides:** Video guides for common tasks
- **Quick Reference:** Keyboard shortcut cheat sheet
- **Contextual Help:** F1 help on every screen

### Change Management
- **Phased Rollout:** Gradual rollout to users
- **Feedback Collection:** Collect user feedback
- **Iterative Improvement:** Continuous UX improvements
- **User Support:** Dedicated support during transition

## Summary

The UX/UI strategy delivers a Windows-like fast input experience in a web application. Key features include keyboard-first navigation, Excel-like grids, auto-advance fields, and minimal latency. The design system ensures consistency across all screens while maintaining accessibility and performance.

## Next Steps

1. **Create Design Mockups:** Visual mockups for key screens
2. **Build Component Library:** Implement reusable components
3. **Develop Prototype:** Interactive prototype for validation
4. **User Testing:** Test with actual users
5. **Iterate:** Refine based on feedback

## Document References

- **Application Modernization:** `../05-application-modernization/`
- **Phased Delivery Plan:** `../11-phased-delivery-plan/`
- **PoC Strategy:** `../15-poc-strategy/`
