import { useCallback, useEffect, useState } from 'react'
import {
  searchOrderEnquiryControls,
  OrderEnquiryControl,
  OrderEnquiryControlSearchParams,
} from '@/services/api/orderEnquiryControl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '../../hooks/useDebounce'

/**
 * Order Enquiry Control List Component
 *
 * Displays list of OE Control records with search and filter functionality.
 *
 * Reference: Task 01-02 - OE Control Search
 */

interface OEControlListProps {
  onSelectControl?: (control: OrderEnquiryControl) => void
  onCreateNew?: () => void
}

export function OEControlList({
  onSelectControl,
  onCreateNew,
}: OEControlListProps) {
  const [controls, setControls] = useState<OrderEnquiryControl[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState<OrderEnquiryControlSearchParams>({
    page: 1,
    limit: 50,
  })
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const debouncedOeNo = useDebounce(searchParams.oeNo || '', 300)

  const getErrorMessage = useCallback((error: unknown, fallback: string) => {
    const err = error as {
      response?: { status?: number; data?: { message?: string } }
      message?: string
    }
    if (err?.response?.status === 401)
      return 'Authentication failed. Please login again.'
    return err?.response?.data?.message || err?.message || fallback
  }, [])

  const loadControls = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await searchOrderEnquiryControls({
        ...searchParams,
        oeNo: debouncedOeNo || undefined,
      })
      setControls(response.controls || [])
      setTotal(response.total || 0)
      setTotalPages(response.totalPages || 1)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load OE Controls'))
      setControls([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [searchParams, debouncedOeNo, getErrorMessage])

  useEffect(() => {
    void loadControls()
  }, [loadControls])

  const handleSearchChange = (field: keyof OrderEnquiryControlSearchParams, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value || undefined,
      page: 1, // Reset to first page on search
    }))
  }

  const clearFilters = () => {
    setSearchParams({ page: 1, limit: 50 })
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">OE Control List</h2>
        {onCreateNew && (
          <Button onClick={onCreateNew}>Create New OE Control</Button>
        )}
      </div>

      {/* Search/Filter Section */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">OE Number</label>
            <Input
              placeholder="Search OE Number"
              value={searchParams.oeNo || ''}
              onChange={(e) => handleSearchChange('oeNo', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Customer Number</label>
            <Input
              placeholder="Search Customer"
              value={searchParams.custNo || ''}
              onChange={(e) => handleSearchChange('custNo', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date From</label>
            <Input
              type="date"
              value={searchParams.dateFrom || ''}
              onChange={(e) => handleSearchChange('dateFrom', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date To</label>
            <Input
              type="date"
              value={searchParams.dateTo || ''}
              onChange={(e) => handleSearchChange('dateTo', e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <div className="p-4 text-center">Loading...</div>}

      {/* Results Table */}
      {!loading && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">OE Number</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">OE Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">PO Number</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {controls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No OE Controls found
                  </td>
                </tr>
              ) : (
                controls.map((control) => (
                  <tr
                    key={control.oeNo}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectControl?.(control)}
                  >
                    <td className="px-4 py-3 text-sm">{control.oeNo}</td>
                    <td className="px-4 py-3 text-sm">
                      {control.customer?.ename || control.custNo}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {control.oeDate ? new Date(control.oeDate).toLocaleDateString() : ''}
                    </td>
                    <td className="px-4 py-3 text-sm">{control.poNo || '-'}</td>
                    <td className="px-4 py-3 text-sm">{control.status || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectControl?.(control)
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {controls.length} of {total} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={searchParams.page === 1}
              onClick={() =>
                setSearchParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
              }
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {searchParams.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={searchParams.page === totalPages}
              onClick={() =>
                setSearchParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
