import { useCallback, useEffect, useState } from 'react'
import { getVendors, Vendor } from '@/services/api/vendors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'

/**
 * Vendor List Component
 * 
 * Reference: Task 03-03 - Vendor List
 */

interface VendorListProps {
  onSelectVendor?: (vendor: Vendor) => void
  onCreateNew?: () => void
}

export function VendorList({ onSelectVendor, onCreateNew }: VendorListProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  const debouncedFilter = useDebounce(filter, 300)

  const getErrorMessage = useCallback((error: unknown, fallback: string) => {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
    if (err?.response?.status === 401) return 'Authentication failed. Please login again.'
    return err?.response?.data?.message || err?.message || fallback
  }, [])

  const loadVendors = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getVendors(page, limit, debouncedFilter || undefined)
      setVendors(response.vendors || [])
      setTotal(response.total || 0)
      setTotalPages(response.totalPages || 1)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load vendors'))
      setVendors([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [page, limit, debouncedFilter, getErrorMessage])

  useEffect(() => {
    void loadVendors()
  }, [loadVendors])

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vendor Master</h2>
        {onCreateNew && <Button onClick={onCreateNew}>New Vendor</Button>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by Vendor No, English Name, or Short Name..."
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          />
        </div>
        <Button variant="outline" onClick={loadVendors}>Refresh</Button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">{error}</div>}
      {loading && <div className="text-center py-4 text-gray-500">Loading...</div>}

      {!loading && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Vendor No</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">English Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Short Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendors.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No vendors found</td></tr>
              ) : (
                vendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    onClick={() => onSelectVendor?.(vendor)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{vendor.vendorNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vendor.ename || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vendor.sname || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {vendor.type === 1 ? 'Vendor' : vendor.type === 2 ? 'Maker' : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vendor.contName || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} vendors
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">Page {page} of {totalPages}</span>
            <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

