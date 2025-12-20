import React, { useState, useEffect } from 'react'
import { getCustomers, Customer } from '@/services/api/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'

/**
 * Customer List Component
 * 
 * Reference: Task 02-03 - Customer List
 */

interface CustomerListProps {
  onSelectCustomer?: (customer: Customer) => void
  onCreateNew?: () => void
}

export function CustomerList({ onSelectCustomer, onCreateNew }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  const debouncedFilter = useDebounce(filter, 300)

  useEffect(() => {
    loadCustomers()
  }, [page, debouncedFilter])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getCustomers(page, limit, debouncedFilter || undefined)
      setCustomers(response.customers || [])
      setTotal(response.total || 0)
      setTotalPages(response.totalPages || 1)
    } catch (err: any) {
      console.error('Error loading customers:', err)
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.')
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load customers')
      }
      setCustomers([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Master</h2>
        {onCreateNew && <Button onClick={onCreateNew}>New Customer</Button>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by Customer No, English Name, or Short Name..."
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          />
        </div>
        <Button variant="outline" onClick={loadCustomers}>Refresh</Button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">{error}</div>}
      {loading && <div className="text-center py-4 text-gray-500">Loading...</div>}

      {!loading && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer No</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">English Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Short Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No customers found</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => onSelectCustomer?.(customer)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.custNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.ename || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.sname || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.contName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.email || '-'}</td>
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
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} customers
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

