import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '../components/Navigation'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { CustomerLookup } from '../components/master-data/customer/CustomerLookup'
import {
  enquireOrderEnquiries,
  OrderEnquiryEnquiryResult,
  OrderEnquiryEnquiryParams,
} from '../services/api/orderEnquiryEnquiry'
import { useDebounce } from '../hooks/useDebounce'

/**
 * Order Enquiry List Page
 *
 * Displays list of Order Enquiries with search and filter functionality.
 *
 * Original Logic Reference:
 * - Legacy Tables: moehd (OE Header)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md
 *
 * Features:
 * - Search by OE Number (contains)
 * - Filter by Customer (lookup)
 * - Filter by Date range
 * - Filter by Status
 * - Click row to view/edit (navigate to entry page)
 * - Sort by columns
 *
 * Reference: Task 03-01 - OE List View, Task 03-02 - OE Search and Filter
 */
export default function OrderEnquiryListPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState<OrderEnquiryEnquiryResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState<OrderEnquiryEnquiryParams>({
    limit: 200,
  })
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')

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

  const loadResults = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await enquireOrderEnquiries({
        ...searchParams,
        oeNo: debouncedOeNo || undefined,
      })
      setResults(data || [])
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load Order Enquiries'))
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [searchParams, debouncedOeNo, getErrorMessage])

  useEffect(() => {
    void loadResults()
  }, [loadResults])

  const handleSearchChange = (
    field: keyof OrderEnquiryEnquiryParams,
    value: string | number | undefined,
  ) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value || undefined,
    }))
  }

  const handleCustomerSelect = (customer: { code: string; name: string }) => {
    setSelectedCustomer(customer.code)
    handleSearchChange('custNo', customer.code)
  }

  const clearFilters = () => {
    setSearchParams({ limit: 200 })
    setSelectedCustomer('')
  }

  const handleRowClick = (oe: OrderEnquiryEnquiryResult) => {
    navigate(`/order-enquiry/entry?oeNo=${encodeURIComponent(oe.oeNo)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 space-y-4">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Order Enquiry List</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/order-enquiry/import')}
              >
                Import Excel
              </Button>
              <Button onClick={() => navigate('/order-enquiry/entry')}>
                Create New OE
              </Button>
            </div>
          </div>

          {/* Search/Filter Section */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">OE Number</label>
                <Input
                  placeholder="Search OE Number"
                  value={searchParams.oeNo || ''}
                  onChange={(e) => handleSearchChange('oeNo', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search Customer"
                    value={selectedCustomer}
                    onChange={(e) => {
                      setSelectedCustomer(e.target.value)
                      handleSearchChange('custNo', e.target.value)
                    }}
                    className="flex-1"
                  />
                  <CustomerLookup
                    onSelect={handleCustomerSelect}
                    trigger={
                      <Button type="button" variant="outline" size="sm">
                        F2
                      </Button>
                    }
                  />
                </div>
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
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={searchParams.status ?? ''}
                  onChange={(e) =>
                    handleSearchChange(
                      'status',
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">All</option>
                  <option value="0">Draft</option>
                  <option value="1">Posted</option>
                </select>
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
                    <th className="px-4 py-3 text-left text-sm font-semibold">OE Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">PO Number</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Total Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Item Count</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No Order Enquiries found
                      </td>
                    </tr>
                  ) : (
                    results.map((oe) => (
                      <tr
                        key={oe.oeNo}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(oe)}
                      >
                        <td className="px-4 py-3 text-sm font-medium">{oe.oeNo}</td>
                        <td className="px-4 py-3 text-sm">
                          {oe.oeDate ? new Date(oe.oeDate).toLocaleDateString() : ''}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {oe.customerName || oe.custNo}
                        </td>
                        <td className="px-4 py-3 text-sm">{oe.poNo || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          {oe.status === 0 ? 'Draft' : oe.status === 1 ? 'Posted' : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {oe.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-sm">{oe.itemCount || 0}</td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRowClick(oe)
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

          {/* Results Count */}
          {!loading && results.length > 0 && (
            <div className="text-sm text-gray-600">
              Showing {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
