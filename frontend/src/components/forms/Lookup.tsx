import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

/**
 * Lookup Item Interface
 */
export interface LookupItem {
  code: string
  name: string
  description?: string
  [key: string]: unknown
}

/**
 * Lookup Component with Type-to-Search
 * 
 * Provides instant search with debouncing, keyboard navigation, and selection.
 * 
 * Original Logic Reference:
 * - Documentation: docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md lines 67-71
 * 
 * UX Requirements:
 * - Type-to-Search: Instant search as user types
 * - Keyboard: Arrow keys to navigate, Enter to select
 * - Display: Show code and description
 * 
 * Reference: Task 04-02 - Lookup Component
 */
export interface LookupProps {
  label?: string
  name: string
  value: string
  onChange: (value: string, item?: LookupItem) => void
  onSearch: (query: string) => Promise<LookupItem[]>
  displayField?: string
  valueField?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  autoFocus?: boolean
  minSearchLength?: number
  debounceMs?: number
}

export function Lookup({
  label,
  name,
  value,
  onChange,
  onSearch,
  displayField = 'name',
  valueField = 'code',
  placeholder,
  error,
  required,
  disabled,
  autoFocus,
  minSearchLength = 1,
  debounceMs = 200,
}: LookupProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(searchQuery, debounceMs)

  // Keep input display in sync with controlled value
  useEffect(() => {
    if (!open) {
      setSearchQuery(value || '')
    }
  }, [value, open])

  useEffect(() => {
    if (debouncedQuery.length >= minSearchLength && open) {
      setLoading(true)
      onSearch(debouncedQuery)
        .then((items) => {
          setResults(items)
          setSelectedIndex(-1)
        })
        .catch(() => {
          setResults([])
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (debouncedQuery.length < minSearchLength) {
      setResults([])
    }
  }, [debouncedQuery, onSearch, minSearchLength, open])

  const handleSelect = (item: LookupItem) => {
    onChange(item[valueField], item)
    setSearchQuery(item[displayField] || item[valueField])
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={error ? 'text-destructive' : ''}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            ref={inputRef}
            id={name}
            name={name}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={cn(error && 'border-destructive')}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          {loading && (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          )}
          {!loading && results.length === 0 && debouncedQuery.length >= minSearchLength && (
            <div className="p-4 text-sm text-muted-foreground">No results found</div>
          )}
          {!loading && results.length > 0 && (
            <div ref={resultsRef} className="max-h-[300px] overflow-auto">
              {results.map((item, index) => (
                <div
                  key={item[valueField]}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    'px-4 py-2 cursor-pointer hover:bg-accent',
                    selectedIndex === index && 'bg-accent'
                  )}
                >
                  <div className="font-medium">{item[valueField]}</div>
                  {item[displayField] && (
                    <div className="text-sm text-muted-foreground">{item[displayField]}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}


