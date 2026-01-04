import { useMemo, useState } from 'react'
import { TextInput } from '../components/forms/TextInput'
import { Button } from '../components/ui/button'
import { DataGrid } from '../components/forms/DataGrid'
import { Contract, ContractDetail, deleteContract, getContract, upsertContract } from '../services/api/contract'

type Row = Omit<ContractDetail, 'id'> & { id: string; isDirty?: boolean; isNew?: boolean }

/**
 * Contract Entry Page
 *
 * Original Logic Reference:
 * - FoxPro Form: `isetcont@@_2018` / `iconthd_2018`
 * - Documentation: docs/source/04-forms-and-screens/contract-forms.md (date validation rules)
 */
export default function ContractEntryPage() {
  const [contNo, setContNo] = useState('')
  const [confNo, setConfNo] = useState('')
  const [vendorNo, setVendorNo] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [reqDateFr, setReqDateFr] = useState('')
  const [reqDateTo, setReqDateTo] = useState('')
  const [payment, setPayment] = useState('')
  const [curCode, setCurCode] = useState('')
  const [shipTo, setShipTo] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loaded, setLoaded] = useState<Contract | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const columns = useMemo(() => {
    return [
      { key: 'lineNo', name: 'Line', editable: true, width: 70 },
      { key: 'itemNo', name: 'Item', editable: true, width: 160 },
      { key: 'vendorNo', name: 'Vendor', editable: true, width: 140 },
      { key: 'qty', name: 'Qty', editable: true, width: 110 },
      { key: 'ctn', name: 'Ctn', editable: true, width: 90 },
      { key: 'price', name: 'Price', editable: true, width: 110 },
      { key: 'cost', name: 'Cost', editable: true, width: 110 },
      { key: 'head', name: 'Head', editable: true, width: 90 },
    ] as any[]
  }, [])

  const load = async () => {
    setError(null)
    const key = contNo.trim()
    if (!key) {
      setError('Contract No is required')
      return
    }
    setIsLoading(true)
    try {
      const c = await getContract(key)
      setLoaded(c)
      setContNo(c.contNo)
      setConfNo(c.confNo)
      setVendorNo(c.vendorNo)
      setDate((c.date || '').slice(0, 10))
      setReqDateFr(c.reqDateFr ? c.reqDateFr.slice(0, 10) : '')
      setReqDateTo(c.reqDateTo ? c.reqDateTo.slice(0, 10) : '')
      setPayment(c.payment || '')
      setCurCode(c.curCode || '')
      setShipTo(c.shipTo || '')
      setRows(
        (c.details || []).map((d) => ({
          id: d.id,
          lineNo: d.lineNo,
          itemNo: d.itemNo,
          vendorNo: d.vendorNo ?? null,
          qty: Number(d.qty),
          ctn: d.ctn ?? null,
          price: d.price ?? null,
          cost: d.cost ?? null,
          head: d.head ?? false,
          descMemo: d.descMemo ?? null,
          itemMemo: d.itemMemo ?? null,
          isNew: false,
          isDirty: false,
        }))
      )
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load contract')
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
        vendorNo: vendorNo || null,
        qty: 1,
        ctn: null,
        price: null,
        cost: null,
        head: false,
        descMemo: null,
        itemMemo: null,
        isNew: true,
        isDirty: true,
      },
    ])
  }

  const save = async () => {
    setError(null)
    const key = contNo.trim()
    if (!key) {
      setError('Contract No is required')
      return
    }
    if (!confNo.trim()) {
      setError('OC No (confNo) is required')
      return
    }
    if (!vendorNo.trim()) {
      setError('Vendor No is required')
      return
    }
    if (rows.length === 0) {
      setError('At least one line item is required')
      return
    }

    setIsLoading(true)
    try {
      const c = await upsertContract({
        contNo: key,
        confNo: confNo.trim(),
        date,
        vendorNo: vendorNo.trim(),
        payment: payment.trim() || undefined,
        remark: undefined,
        reqDateFr: reqDateFr || undefined,
        reqDateTo: reqDateTo || undefined,
        curCode: curCode.trim() || undefined,
        shipTo: shipTo.trim() || undefined,
        details: rows.map((r) => ({
          lineNo: Number(r.lineNo),
          itemNo: String(r.itemNo || '').trim(),
          vendorNo: r.vendorNo ? String(r.vendorNo).trim() : undefined,
          qty: Number(r.qty),
          ctn: r.ctn !== null && r.ctn !== undefined ? Number(r.ctn) : undefined,
          price: r.price !== null && r.price !== undefined ? Number(r.price) : undefined,
          cost: r.cost !== null && r.cost !== undefined ? Number(r.cost) : undefined,
          head: Boolean(r.head),
          descMemo: r.descMemo ?? undefined,
          itemMemo: r.itemMemo ?? undefined,
        })),
      })
      setLoaded(c)
      setRows(
        (c.details || []).map((d) => ({
          id: d.id,
          lineNo: d.lineNo,
          itemNo: d.itemNo,
          vendorNo: d.vendorNo ?? null,
          qty: Number(d.qty),
          ctn: d.ctn ?? null,
          price: d.price ?? null,
          cost: d.cost ?? null,
          head: d.head ?? false,
          descMemo: d.descMemo ?? null,
          itemMemo: d.itemMemo ?? null,
          isNew: false,
          isDirty: false,
        }))
      )
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save contract')
    } finally {
      setIsLoading(false)
    }
  }

  const remove = async () => {
    setError(null)
    const key = contNo.trim()
    if (!key) {
      setError('Contract No is required')
      return
    }
    setIsLoading(true)
    try {
      await deleteContract(key)
      setLoaded(null)
      setRows([])
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to delete contract')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="text-xl font-semibold">Contract - Entry</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <TextInput label="Contract No" value={contNo} onChange={(e) => setContNo(e.target.value)} />
            <TextInput label="OC No (confNo)" value={confNo} onChange={(e) => setConfNo(e.target.value)} />
            <TextInput label="Vendor No" value={vendorNo} onChange={(e) => setVendorNo(e.target.value)} />
            <TextInput label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <TextInput label="Req Date From" type="date" value={reqDateFr} onChange={(e) => setReqDateFr(e.target.value)} />
            <TextInput label="Req Date To" type="date" value={reqDateTo} onChange={(e) => setReqDateTo(e.target.value)} />
            <TextInput label="Payment" value={payment} onChange={(e) => setPayment(e.target.value)} />
            <TextInput label="Currency" value={curCode} onChange={(e) => setCurCode(e.target.value)} />
            <TextInput label="Ship To" value={shipTo} onChange={(e) => setShipTo(e.target.value)} />
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


