import React, { useState, useEffect, useCallback } from 'react'
import { getItems, Item } from '@/services/api/items'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'

/**
 * Item List Component
 * 
 * Displays item master data in a grid with filtering, sorting, and pagination.
 * 
 * Original Logic Reference:
 * - List views in original system
 * - Documentation: Task 01-03 - Item List with Filtering
 * 
 * Features:
 * - Grid display of items
 * - Filter by item_no, short_name, std_code
 * - Sort by columns
 * - Pagination for large datasets
 * - Click row to edit item
 * 
 * Reference: Task 01-03 - Item List with Filtering
 */

interface ItemListProps {
  onSelectItem?: (item: Item) => void
  onCreateNew?: () => void
}

export function ItemList({ onSelectItem, onCreateNew }: ItemListProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  const debouncedFilter = useDebounce(filter, 300)

  /**
   * Load items from API
   * 
   * Implements filtering and pagination.
   */
  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getItems(page, limit, debouncedFilter || undefined)
      setItems(response.items || [])
      setTotal(response.total || 0)
      setTotalPages(response.totalPages || 1)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
      if (e?.response?.status === 401) {
        setError('Authentication failed. Please login again.')
      } else {
        setError(e?.response?.data?.message || e?.message || 'Failed to load items')
      }
      setItems([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [page, limit, debouncedFilter])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  /**
   * Handle row click
   */
  const handleRowClick = (item: Item) => {
    onSelectItem?.(item)
  }

  /**
   * Handle filter change
   */
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value)
    setPage(1) // Reset to first page on filter change
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Item Master</h2>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            New Item
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by Item No, Short Name, or Standard Code..."
            value={filter}
            onChange={handleFilterChange}
          />
        </div>
        <Button variant="outline" onClick={loadItems}>
          Refresh
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      )}

      {/* Table */}
      {!loading && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Item No
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Short Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Standard Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Origin
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {item.itemNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.shortName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.stdCode || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.origin || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      {item.price != null && !isNaN(Number(item.price))
                        ? `${Number(item.price).toFixed(2)} ${item.priceCur || ''}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      {item.cost != null && !isNaN(Number(item.cost))
                        ? Number(item.cost).toFixed(2)
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} items
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

