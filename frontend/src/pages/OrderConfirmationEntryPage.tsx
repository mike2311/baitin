import { useMemo, useState } from 'react'
import { TextInput } from '../components/forms/TextInput'
import { Button } from '../components/ui/button'
import { DataGrid } from '../components/forms/DataGrid'
import {
  deleteOrderConfirmation,
  getOrderConfirmation,
  OrderConfirmation,
  OrderConfirmationDetail,
  upsertOrderConfirmation,
} from '../services/api/orderConfirmation'

type OcRow = Omit<OrderConfirmationDetail, 'id'> & { id: string; isNew?: boolean; isDirty?: boolean }

/**
 * Order Confirmation Entry Page
 *
 * Original Logic Reference:
 * - FoxPro Form: `iordhd` (Input Order Confirmation)
 * - Documentation: docs/source/04-forms-and-screens/order-confirmation-forms.md (Manual OC Entry)
 */
export default function OrderConfirmationEntryPage() {
  const [confNo, setConfNo] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [custNo, setCustNo] = useState('')
  const [compCode, setCompCode] = useState('HT')
  const [rows, setRows] = useState<OcRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<OrderConfirmation | null>(null)

  const columns = useMemo(() => {
    return [
      { key: 'lineNo', name: 'Line', editable: true, width: 70 },
      { key: 'itemNo', name: 'Item', editable: true, width: 160 },
      { key: 'vendorNo', name: 'Vendor', editable: true, width: 140 },
      { key: 'qty', name: 'Qty', editable: true, width: 110 },
      { key: 'ctn', name: 'Ctn', editable: true, width: 90 },
      { key: 'price', name: 'Price', editable: true, width: 110 },
      { key: 'cost', name: 'Cost', editable: true, width: 110 },
      { key: 'poNo', name: 'PO No', editable: true, width: 160 },
      { key: 'head', name: 'Head', editable: true, width: 90 },
    ] as any[]
  }, [])

  const load = async () => {
    setError(null)
    const key = confNo.trim()
    if (!key) {
      setError('OC No (confNo) is required')
      return
    }
    setIsLoading(true)
    try {
      const oc = await getOrderConfirmation(key)
      setLoaded(oc)
      setDate((oc.date || '').slice(0, 10))
      setCustNo(oc.custNo || '')
      setCompCode(oc.compCode || 'HT')
      setRows(
        (oc.details || []).map((d) => ({
          id: d.id,
          lineNo: d.lineNo,
          itemNo: d.itemNo,
          vendorNo: d.vendorNo ?? null,
          qty: Number(d.qty),
          ctn: d.ctn ?? null,
          price: d.price ?? null,
          cost: d.cost ?? null,
          poNo: d.poNo ?? null,
          head: d.head ?? false,
          isNew: false,
          isDirty: false,
        }))
      )
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load OC')
      setLoaded(null)
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }

  const addRow = () => {
    const id = `new-${Date.now()}`
    setRows((prev) => [
      ...prev,
      {
        id,
        lineNo: prev.length + 1,
        itemNo: '',
        vendorNo: null,
        qty: 1,
        ctn: null,
        price: null,
        cost: null,
        poNo: null,
        head: false,
        isNew: true,
        isDirty: true,
      },
    ])
  }

  const save = async () => {
    setError(null)
    const key = confNo.trim()
    if (!key) {
      setError('OC No (confNo) is required')
      return
    }
    if (!custNo.trim()) {
      setError('Customer No is required')
      return
    }
    if (rows.length === 0) {
      setError('At least one line item is required')
      return
    }

    setIsLoading(true)
    try {
      const oc = await upsertOrderConfirmation({
        confNo: key,
        date,
        custNo: custNo.trim(),
        compCode: compCode.trim().toUpperCase(),
        details: rows.map((r) => ({
          lineNo: Number(r.lineNo),
          itemNo: String(r.itemNo || '').trim(),
          vendorNo: r.vendorNo ? String(r.vendorNo).trim() : undefined,
          qty: Number(r.qty),
          ctn: r.ctn !== null && r.ctn !== undefined ? Number(r.ctn) : undefined,
          price: r.price !== null && r.price !== undefined ? Number(r.price) : undefined,
          cost: r.cost !== null && r.cost !== undefined ? Number(r.cost) : undefined,
          poNo: r.poNo ? String(r.poNo).trim() : undefined,
          head: Boolean(r.head),
        })),
      })
      setLoaded(oc)
      setRows(
        (oc.details || []).map((d) => ({
          id: d.id,
          lineNo: d.lineNo,
          itemNo: d.itemNo,
          vendorNo: d.vendorNo ?? null,
          qty: Number(d.qty),
          ctn: d.ctn ?? null,
          price: d.price ?? null,
          cost: d.cost ?? null,
          poNo: d.poNo ?? null,
          head: d.head ?? false,
          isNew: false,
          isDirty: false,
        }))
      )
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save OC')
    } finally {
      setIsLoading(false)
    }
  }

  const remove = async () => {
    setError(null)
    const key = confNo.trim()
    if (!key) {
      setError('OC No (confNo) is required')
      return
    }
    setIsLoading(true)
    try {
      await deleteOrderConfirmation(key)
      setLoaded(null)
      setRows([])
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to delete OC')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="text-xl font-semibold">Order Confirmation - Entry</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <TextInput label="OC No (confNo)" value={confNo} onChange={(e) => setConfNo(e.target.value)} />
            <TextInput label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <TextInput label="Customer No" value={custNo} onChange={(e) => setCustNo(e.target.value)} />
            <TextInput label="Company Code" value={compCode} onChange={(e) => setCompCode(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <Button onClick={load} disabled={isLoading}>
              Load
            </Button>
            <Button variant="outline" onClick={addRow} disabled={isLoading}>
              Add Line
            </Button>
            <Button onClick={save} disabled={isLoading}>
              Save
            </Button>
            <Button variant="destructive" onClick={remove} disabled={isLoading || !loaded}>
              Delete
            </Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <DataGrid
            columns={columns}
            rows={rows}
            onRowsChange={(nextRows) => setRows(nextRows.map((r) => ({ ...r, isDirty: true })))}
            height={520}
          />
        </div>
      </div>
    </div>
  )
}


