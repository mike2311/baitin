import { useState } from 'react'
import { TextInput } from '../components/forms/TextInput'
import { Button } from '../components/ui/button'
import { DataGrid } from '../components/forms/DataGrid'
import { Navigation } from '../components/Navigation'
import { enquireOrderConfirmations, getOrderConfirmationReport } from '../services/api/orderConfirmation'
import { useNavigate } from 'react-router-dom'

type Row = {
  confNo: string
  oeNo?: string | null
  date: string
  custNo: string
  compCode?: string | null
  lines: number
}

/**
 * Order Confirmation Enquiry Page
 *
 * Original Logic Reference:
 * - FoxPro reports/forms: `pconfirm`, `eocsumry`, `pocbrk`
 * - Documentation: docs/source/02-business-processes/order-confirmation-process.md (Reporting)
 */
export default function OrderConfirmationEnquiryPage() {
  const navigate = useNavigate()
  const [confNo, setConfNo] = useState('')
  const [custNo, setCustNo] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<any>(null)

  const search = async () => {
    setError(null)
    setReport(null)
    setIsLoading(true)
    try {
      const data = await enquireOrderConfirmations({
        confNo: confNo.trim() || undefined,
        custNo: custNo.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: 200,
      })
      setRows(data)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="text-xl font-semibold">Order Confirmation - Enquiry</h2>

          <form
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            onSubmit={(e) => {
              e.preventDefault()
              search()
            }}
          >
            <TextInput label="OC No contains" value={confNo} onChange={(e) => setConfNo(e.target.value)} />
            <TextInput label="Customer No contains" value={custNo} onChange={(e) => setCustNo(e.target.value)} />
            <TextInput label="From Date" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <TextInput label="To Date" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <DataGrid
            columns={
              [
                { key: 'confNo', name: 'OC No', width: 200 },
                { key: 'oeNo', name: 'OE No', width: 160 },
                { key: 'date', name: 'Date', width: 120 },
                { key: 'custNo', name: 'Customer', width: 140 },
                { key: 'compCode', name: 'Company', width: 110 },
                { key: 'lines', name: 'Lines', width: 90 },
                {
                  key: 'open',
                  name: 'Open',
                  width: 110,
                  renderCell: (p: any) => {
                    const row = p?.row as Row
                    return (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/order-confirmation/entry?confNo=${encodeURIComponent(row.confNo)}`)}>
                        Open
                      </Button>
                    )
                  },
                },
                {
                  key: 'report',
                  name: 'Report',
                  width: 110,
                  renderCell: (p: any) => {
                    const row = p?.row as Row
                    return (
                      <Button
                        size="sm"
                        onClick={async () => {
                          setError(null)
                          try {
                            const r = await getOrderConfirmationReport(row.confNo)
                            setReport(r)
                          } catch (e: any) {
                            setError(e?.response?.data?.message ?? 'Failed to load report')
                          }
                        }}
                      >
                        View
                      </Button>
                    )
                  },
                },
              ] as any[]
            }
            rows={rows}
            height={520}
          />
        </div>

        {report && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">OC Report (JSON)</h3>
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(report, null, 2)}</pre>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}


