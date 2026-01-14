import { useMemo, useState } from 'react'
import { DataGrid } from '../components/forms/DataGrid'
import { TextInput } from '../components/forms/TextInput'
import { Button } from '../components/ui/button'
import { Navigation } from '../components/Navigation'
import {
  createQtyBreakdown,
  deleteQtyBreakdown,
  listQtyBreakdowns,
  OrderEnquiryQtyBreakdown,
  updateQtyBreakdown,
} from '../services/api/orderEnquiryQtyBreakdown'

type QtyBrkRow = OrderEnquiryQtyBreakdown & {
  isNew?: boolean
  isDirty?: boolean
}

/**
 * Order Enquiry Quantity Breakdown Page
 *
 * Original Logic Reference:
 * - FoxPro Form: `iqtybrk2` (Input Qty Breakdown By PO)
 * - Documentation: docs/source/02-business-processes/order-enquiry-process.md (Quantity Breakdown Processing)
 *
 * Notes:
 * - Phase 2 MVP provides OE + Item scoped breakdown editing with an Excel-like grid.
 */
export default function OrderEnquiryQtyBreakdownPage() {
  const [oeNo, setOeNo] = useState('')
  const [itemNo, setItemNo] = useState('')
  const [rows, setRows] = useState<QtyBrkRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const columns = useMemo(() => {
    return [
      { key: 'id', name: 'ID', width: 90 },
      { key: 'itemNo', name: 'Item', editable: true, width: 140 },
      { key: 'port', name: 'Port', editable: true, width: 110 },
      { key: 'poNo', name: 'PO No', editable: true, width: 140 },
      { key: 'delFrom', name: 'Del From', editable: true, width: 130 },
      { key: 'delTo', name: 'Del To', editable: true, width: 130 },
      { key: 'sizeCode', name: 'Size', editable: true, width: 90 },
      { key: 'colorCode', name: 'Color', editable: true, width: 90 },
      { key: 'styleCode', name: 'Style', editable: true, width: 90 },
      { key: 'qty', name: 'Qty', editable: true, width: 120 },
      {
        key: 'actions',
        name: 'Actions',
        width: 120,
        renderCell: (p: any) => {
          const row = p?.row as QtyBrkRow
          return (
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                setError(null)
                try {
                  if (!row.isNew) {
                    await deleteQtyBreakdown(row.id)
                  }
                  setRows((prev) => prev.filter((r) => r.id !== row.id))
                } catch (e: any) {
                  setError(e?.response?.data?.message ?? 'Failed to delete row')
                }
              }}
            >
              Delete
            </Button>
          )
        },
      },
    ]
  }, [])

  const load = async () => {
    setError(null)
    const oe = oeNo.trim()
    if (!oe) {
      setError('OE No is required')
      return
    }

    setIsLoading(true)
    try {
      const data = await listQtyBreakdowns({ oeNo: oe, itemNo: itemNo.trim() || undefined })
      setRows(data.map((r) => ({ ...r, isNew: false, isDirty: false })))
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load breakdowns')
    } finally {
      setIsLoading(false)
    }
  }

  const addRow = () => {
    const oe = oeNo.trim()
    if (!oe) {
      setError('OE No is required before adding rows')
      return
    }
    const id = `new-${Date.now()}`
    setRows((prev) => [
      ...prev,
      {
        id,
        oeNo: oe,
        itemNo: itemNo.trim(),
        port: null,
        poNo: null,
        delFrom: null,
        delTo: null,
        sizeCode: null,
        colorCode: null,
        styleCode: null,
        qty: 1,
        isNew: true,
        isDirty: true,
      },
    ])
  }

  const saveAll = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const next: QtyBrkRow[] = []
      for (const r of rows) {
        if (!r.isDirty) {
          next.push(r)
          continue
        }

        if (r.isNew) {
          const created = await createQtyBreakdown({
            oeNo: r.oeNo,
            itemNo: r.itemNo,
            port: r.port ?? undefined,
            poNo: r.poNo ?? undefined,
            delFrom: r.delFrom ?? undefined,
            delTo: r.delTo ?? undefined,
            sizeCode: r.sizeCode ?? undefined,
            colorCode: r.colorCode ?? undefined,
            styleCode: r.styleCode ?? undefined,
            qty: Number(r.qty),
            userId: r.userId ?? undefined,
            modDate: r.modDate ?? undefined,
            modTime: r.modTime ?? undefined,
          })
          next.push({ ...created, isNew: false, isDirty: false })
        } else {
          const updated = await updateQtyBreakdown(r.id, {
            port: r.port ?? undefined,
            poNo: r.poNo ?? undefined,
            delFrom: r.delFrom ?? undefined,
            delTo: r.delTo ?? undefined,
            sizeCode: r.sizeCode ?? undefined,
            colorCode: r.colorCode ?? undefined,
            styleCode: r.styleCode ?? undefined,
            qty: Number(r.qty),
          })
          next.push({ ...updated, isNew: false, isDirty: false })
        }
      }
      setRows(next)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save changes')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Order Enquiry - Qty Breakdown</h2>

          <form
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            onSubmit={(e) => {
              e.preventDefault()
              load()
            }}
          >
            <TextInput label="OE No" value={oeNo} onChange={(e) => setOeNo(e.target.value)} />
            <TextInput label="Item No (optional)" value={itemNo} onChange={(e) => setItemNo(e.target.value)} />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load'}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={addRow} disabled={isLoading}>
                Add Row
              </Button>
              <Button type="button" onClick={saveAll} disabled={isLoading}>
                Save
              </Button>
            </div>
          </form>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <DataGrid
            columns={columns}
            rows={rows}
            onRowsChange={(nextRows) => {
              setRows(
                nextRows.map((r, idx) => {
                  const prev = rows[idx]
                  const changed = prev ? JSON.stringify({ ...prev, isDirty: undefined }) !== JSON.stringify({ ...r, isDirty: undefined }) : true
                  return { ...r, isDirty: r.isNew ? true : changed ? true : r.isDirty }
                })
              )
            }}
            height={520}
          />
        </div>
      </div>
      </div>
    </div>
  )
}


