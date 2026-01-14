import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '../components/Navigation'
import { OEHeaderForm, OEHeaderFormData } from '../components/order-enquiry/OEHeaderForm'
import { OEDetailGrid, OEDetailRow } from '../components/order-enquiry/OEDetailGrid'
import { Button } from '../components/ui/button'
import {
  getOrderEnquiry,
  upsertOrderEnquiry,
  deleteOrderEnquiry,
  OrderEnquiry,
} from '../services/api/orderEnquiry'

/**
 * Order Enquiry Entry Page
 *
 * Main page for OE Entry with header form, detail grid, and auto-save functionality.
 *
 * Original Logic Reference:
 * - Legacy Tables: moehd (OE Header), moe (OE Detail)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md
 *
 * Features:
 * - Header form with OE Control validation
 * - Detail grid with Excel-like navigation
 * - Auto-save on field blur (debounced 500ms)
 * - Auto-save every 30 seconds (if changes detected)
 * - Auto-save on row add/delete
 * - Save indicators ("Saving...", "Saved")
 * - Error handling with retry
 *
 * Reference: Task 02-01 - OE Header Form, Task 02-02 - OE Detail Grid, Task 02-03 - Auto-Save
 */
export default function OrderEnquiryEntryPage() {
  const navigate = useNavigate()
  const urlParams = new URLSearchParams(window.location.search)
  const initialOeNo = urlParams.get('oeNo') || ''
  
  const [oeNo, setOeNo] = useState(initialOeNo)
  const [headerData, setHeaderData] = useState<OEHeaderFormData>({
    oeNo: initialOeNo,
    oeDate: new Date().toISOString().slice(0, 10),
    custNo: '',
    poNo: '',
    compCode: 'HT',
    status: 0,
    remark: '',
  })
  const [rows, setRows] = useState<OEDetailRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<OrderEnquiry | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSaveRef = useRef<{ header: OEHeaderFormData; rows: OEDetailRow[] } | null>(null)
  const hasChangesRef = useRef(false)

  // Track changes
  useEffect(() => {
    hasChangesRef.current = true
  }, [headerData, rows])

  // Auto-save on timer (30 seconds)
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setInterval(() => {
      if (hasChangesRef.current && headerData.oeNo && rows.length > 0) {
        performAutoSave()
      }
    }, 30000) // 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerData, rows])

  // Debounced auto-save on field blur
  const debouncedAutoSaveRef = useRef<NodeJS.Timeout | null>(null)
  const performAutoSave = useCallback(async () => {
    if (!headerData.oeNo || rows.length === 0) {
      return
    }

    // Check if there are actual changes
    if (
      lastSaveRef.current &&
      JSON.stringify(lastSaveRef.current.header) === JSON.stringify(headerData) &&
      JSON.stringify(lastSaveRef.current.rows) === JSON.stringify(rows)
    ) {
      return // No changes
    }

    setSaveStatus('saving')
    setSaveError(null)

    try {
      await upsertOrderEnquiry({
        oeNo: headerData.oeNo,
        oeDate: headerData.oeDate,
        custNo: headerData.custNo,
        poNo: headerData.poNo,
        compCode: headerData.compCode,
        status: headerData.status,
        remark: headerData.remark,
        details: rows.map((r) => ({
          lineNo: r.lineNo,
          itemNo: r.itemNo,
          vendorNo: r.vendorNo || undefined,
          qty: r.qty,
          price: r.price || undefined,
          ctn: r.ctn || undefined,
          unit: r.unit || undefined,
          head: r.head || false,
          itemDesc: r.itemDesc || undefined,
          remark: r.remark || undefined,
        })),
      })

      lastSaveRef.current = {
        header: { ...headerData },
        rows: rows.map((r) => ({ ...r })),
      }
      hasChangesRef.current = false
      setSaveStatus('saved')

      // Clear "saved" status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (e: any) {
      setSaveStatus('error')
      setSaveError(e?.response?.data?.message || 'Auto-save failed')
      console.error('Auto-save error:', e)

      // Retry after 5 seconds
      setTimeout(() => {
        if (hasChangesRef.current) {
          performAutoSave()
        }
      }, 5000)
    }
  }, [headerData, rows])

  // Debounced save on field changes
  useEffect(() => {
    if (debouncedAutoSaveRef.current) {
      clearTimeout(debouncedAutoSaveRef.current)
    }

    if (hasChangesRef.current && headerData.oeNo && rows.length > 0) {
      debouncedAutoSaveRef.current = setTimeout(() => {
        performAutoSave()
      }, 500) // 500ms debounce
    }

    return () => {
      if (debouncedAutoSaveRef.current) {
        clearTimeout(debouncedAutoSaveRef.current)
      }
    }
  }, [headerData, rows, performAutoSave])

  // Load OE
  const load = async () => {
    setError(null)
    const key = oeNo.trim()
    if (!key) {
      setError('OE Number is required')
      return
    }
    setIsLoading(true)
    try {
      const oe = await getOrderEnquiry(key)
      setLoaded(oe)
      setHeaderData({
        oeNo: oe.oeNo,
        oeDate: oe.oeDate ? oe.oeDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        custNo: oe.custNo,
        poNo: oe.poNo || '',
        compCode: oe.compCode || 'HT',
        status: oe.status ?? 0,
        remark: oe.remark || '',
      })
      setRows(
        (oe.details || []).map((d, index) => ({
          id: d.id || `row-${index}`,
          lineNo: d.lineNo,
          itemNo: d.itemNo,
          itemDesc: d.itemDesc || null,
          qty: Number(d.qty),
          price: d.price ? Number(d.price) : null,
          amount: d.amount ? Number(d.amount) : null,
          unit: d.unit || null,
          ctn: d.ctn ?? null,
          vendorNo: d.vendorNo ?? null,
          head: d.head ?? false,
          remark: d.remark || null,
          isNew: false,
          isDirty: false,
        })),
      )
      lastSaveRef.current = {
        header: {
          oeNo: oe.oeNo,
          oeDate: oe.oeDate ? oe.oeDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
          custNo: oe.custNo,
          poNo: oe.poNo || '',
          compCode: oe.compCode || 'HT',
          status: oe.status ?? 0,
          remark: oe.remark || '',
        },
        rows: (oe.details || []).map((d, index) => ({
          id: d.id || `row-${index}`,
          lineNo: d.lineNo,
          itemNo: d.itemNo,
          itemDesc: d.itemDesc || null,
          qty: Number(d.qty),
          price: d.price ? Number(d.price) : null,
          amount: d.amount ? Number(d.amount) : null,
          unit: d.unit || null,
          ctn: d.ctn ?? null,
          vendorNo: d.vendorNo ?? null,
          head: d.head ?? false,
          remark: d.remark || null,
          isNew: false,
          isDirty: false,
        })),
      }
      hasChangesRef.current = false
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load OE')
      setLoaded(null)
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }

  // Manual save
  const save = async () => {
    setError(null)
    if (!headerData.oeNo.trim()) {
      setError('OE Number is required')
      return
    }
    if (!headerData.custNo.trim()) {
      setError('Customer Number is required')
      return
    }
    if (rows.length === 0) {
      setError('At least one detail line is required')
      return
    }

    setIsLoading(true)
    setSaveStatus('saving')
    try {
      const oe = await upsertOrderEnquiry({
        oeNo: headerData.oeNo,
        oeDate: headerData.oeDate,
        custNo: headerData.custNo,
        poNo: headerData.poNo,
        compCode: headerData.compCode,
        status: headerData.status,
        remark: headerData.remark,
        details: rows.map((r) => ({
          lineNo: r.lineNo,
          itemNo: r.itemNo,
          vendorNo: r.vendorNo || undefined,
          qty: r.qty,
          price: r.price || undefined,
          ctn: r.ctn || undefined,
          unit: r.unit || undefined,
          head: r.head || false,
          itemDesc: r.itemDesc || undefined,
          remark: r.remark || undefined,
        })),
      })
      setLoaded(oe)
      setSaveStatus('saved')
      hasChangesRef.current = false
      lastSaveRef.current = {
        header: { ...headerData },
        rows: rows.map((r) => ({ ...r })),
      }
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save OE')
      setSaveStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete OE
  const remove = async () => {
    setError(null)
    const key = headerData.oeNo.trim()
    if (!key) {
      setError('OE Number is required')
      return
    }
    if (!confirm(`Are you sure you want to delete OE ${key}?`)) {
      return
    }
    setIsLoading(true)
    try {
      await deleteOrderEnquiry(key)
      setLoaded(null)
      setRows([])
      setHeaderData({
        oeNo: '',
        oeDate: new Date().toISOString().slice(0, 10),
        custNo: '',
        poNo: '',
        compCode: 'HT',
        status: 0,
        remark: '',
      })
      navigate('/order-enquiry/list')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to delete OE')
    } finally {
      setIsLoading(false)
    }
  }

  // Add row
  const addRow = () => {
    const newRow: OEDetailRow = {
      id: `new-${Date.now()}`,
      lineNo: rows.length + 1,
      itemNo: '',
      qty: 1,
      price: null,
      amount: 0,
      unit: null,
      ctn: null,
      vendorNo: null,
      head: false,
      isNew: true,
      isDirty: true,
    }
    setRows([...rows, newRow])
    hasChangesRef.current = true
  }

  // Handle header data change
  const handleHeaderChange = (data: OEHeaderFormData) => {
    setHeaderData(data)
    if (data.oeNo !== oeNo) {
      setOeNo(data.oeNo)
    }
    hasChangesRef.current = true
  }

  // Handle rows change
  const handleRowsChange = (newRows: OEDetailRow[]) => {
    setRows(newRows)
    hasChangesRef.current = true
  }

  // Save status indicator
  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return 'Saved'
      case 'error':
        return `Error: ${saveError || 'Save failed'}`
      default:
        return ''
    }
  }

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return 'text-blue-600'
      case 'saved':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4 space-y-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Order Enquiry - Entry</h2>
            <div className="flex items-center gap-4">
              {saveStatus !== 'idle' && (
                <span className={`text-sm ${getSaveStatusColor()}`}>
                  {getSaveStatusText()}
                </span>
              )}
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
                <Button
                  variant="destructive"
                  onClick={remove}
                  disabled={isLoading || !loaded}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <OEHeaderForm
            data={headerData}
            onChange={handleHeaderChange}
            disabled={isLoading}
          />
        </div>

        {/* Detail Grid Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <OEDetailGrid
            rows={rows}
            onRowsChange={handleRowsChange}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
