import { useEffect, useState } from 'react'

/**
 * Debounce Hook
 * 
 * Delays value updates until after a specified delay period.
 * Used for search inputs to avoid excessive API calls.
 * 
 * Reference: Task 04-02 - Lookup Component
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}


