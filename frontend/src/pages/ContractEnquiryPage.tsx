import { useState } from 'react'
import { TextInput } from '../components/forms/TextInput'
import { Button } from '../components/ui/button'
import { DataGrid } from '../components/forms/DataGrid'
import { Navigation } from '../components/Navigation'
import { enquireContracts, getContractReport } from '../services/api/contract'
import { useNavigate } from 'react-router-dom'

type Row = { contNo: string; confNo: string; date: string; vendorNo: string; lines: number }

/**
 * Contract Enquiry Page
 *
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/contract-process.md (Contract reports)
 * - Documentation: docs/source/04-forms-and-screens/contract-forms.md (pcontract@_2018, pcontbrk)
 */
export default function ContractEnquiryPage() {
  const navigate = useNavigate()
  const [contNo, setContNo] = useState('')
  const [confNo, setConfNo] = useState('')
  const [vendorNo, setVendorNo] = useState('')
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
      const data = await enquireContracts({
        contNo: contNo.trim() || undefined,
        confNo: confNo.trim() || undefined,
        vendorNo: vendorNo.trim() || undefined,
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
          <h2 className="text-xl font-semibold">Contract - Enquiry</h2>

          <form
            className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
            onSubmit={(e) => {
              e.preventDefault()
              search()
            }}
          >
            <TextInput label="Contract No contains" value={contNo} onChange={(e) => setContNo(e.target.value)} />
            <TextInput label="OC No contains" value={confNo} onChange={(e) => setConfNo(e.target.value)} />
            <TextInput label="Vendor No contains" value={vendorNo} onChange={(e) => setVendorNo(e.target.value)} />
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
                { key: 'contNo', name: 'Contract No', width: 240 },
                { key: 'confNo', name: 'OC No', width: 200 },
                { key: 'date', name: 'Date', width: 120 },
                { key: 'vendorNo', name: 'Vendor', width: 140 },
                { key: 'lines', name: 'Lines', width: 90 },
                {
                  key: 'open',
                  name: 'Open',
                  width: 110,
                  renderCell: (p: any) => {
                    const row = p?.row as Row
                    return (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/contract/entry?contNo=${encodeURIComponent(row.contNo)}`)}>
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
                            const r = await getContractReport(row.contNo)
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
            <h3 className="text-lg font-semibold mb-2">Contract Report (JSON)</h3>
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(report, null, 2)}</pre>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}


