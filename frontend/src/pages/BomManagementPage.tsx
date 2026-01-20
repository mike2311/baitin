import { useMemo, useState } from 'react'
import { TextInput } from '../components/forms/TextInput'
import { Button } from '../components/ui/button'
import { DataGrid } from '../components/forms/DataGrid'
import { Navigation } from '../components/Navigation'
import { createBomRow, deleteBomRow, listBom, ProductBomRow, updateBomRow } from '../services/api/bom'

type Row = ProductBomRow & { isNew?: boolean; isDirty?: boolean }

/**
 * BOM Management Page
 *
 * Original Logic Reference:
 * - Legacy Table: mprodbom
 * - Documentation: docs/source/02-business-processes/order-enquiry-process.md (Product BOM Structure)
 */
export default function BomManagementPage() {
  const [itemNo, setItemNo] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const columns = useMemo(() => {
    return [
      { key: 'id', name: 'ID', width: 90 },
      { key: 'itemNo', name: 'Item', editable: true, width: 160 },
      { key: 'subItemNo', name: 'Sub Item', editable: true, width: 160 },
      { key: 'qty', name: 'Qty', editable: true, width: 120 },
      { key: 'unit', name: 'Unit', editable: true, width: 100 },
      {
        key: 'actions',
        name: 'Actions',
        width: 120,
        renderCell: (p: any) => {
          const row = p?.row as Row
          return (
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                setError(null)
                try {
                  if (!row.isNew) {
                    await deleteBomRow(row.id)
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
    ] as any[]
  }, [])

  const load = async () => {
    setError(null)
    const key = itemNo.trim()
    if (!key) {
      setError('Item No is required')
      return
    }
    setIsLoading(true)
    try {
      const data = await listBom(key)
      setRows(data.map((r) => ({ ...r, isNew: false, isDirty: false })))
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load BOM')
    } finally {
      setIsLoading(false)
    }
  }

  const addRow = () => {
    const key = itemNo.trim()
    if (!key) {
      setError('Item No is required before adding rows')
      return
    }
    setRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        itemNo: key,
        subItemNo: '',
        qty: 1,
        unit: null,
        isNew: true,
        isDirty: true,
      },
    ])
  }

  const saveAll = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const next: Row[] = []
      for (const r of rows) {
        if (!r.isDirty) {
          next.push(r)
          continue
        }
        if (r.isNew) {
          const created = await createBomRow({
            itemNo: r.itemNo,
            subItemNo: r.subItemNo,
            qty: Number(r.qty),
            unit: r.unit ?? undefined,
          })
          next.push({ ...created, isNew: false, isDirty: false })
        } else {
          const updated = await updateBomRow(r.id, {
            qty: Number(r.qty),
            unit: r.unit ?? undefined,
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
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="text-xl font-semibold">Master Data - BOM Management</h2>

          <form
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            onSubmit={(e) => {
              e.preventDefault()
              load()
            }}
          >
            <TextInput label="Item No" value={itemNo} onChange={(e) => setItemNo(e.target.value)} />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load'}
            </Button>
            <Button type="button" variant="outline" onClick={addRow} disabled={isLoading}>
              Add Row
            </Button>
            <Button type="button" onClick={saveAll} disabled={isLoading}>
              Save
            </Button>
          </form>

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
    </div>
  )
}


