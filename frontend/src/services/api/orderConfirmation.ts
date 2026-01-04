import apiClient from './client'

export async function postOeToOc(input: { companyCode: string; oeNos: string[] }) {
  const res = await apiClient.post<{ posted: number; results: Array<{ oeNo: string; confNo: string; lines: number }> }>(
    '/order-confirmation/post',
    input
  )
  return res.data
}

export type OrderConfirmationDetail = {
  id: string
  lineNo: number
  itemNo: string
  vendorNo?: string | null
  qty: number
  ctn?: number | null
  price?: number | null
  cost?: number | null
  poNo?: string | null
  head?: boolean | null
}

export type OrderConfirmation = {
  confNo: string
  oeNo?: string | null
  date: string
  custNo: string
  reqDateFr?: string | null
  reqDateTo?: string | null
  compCode?: string | null
  details: OrderConfirmationDetail[]
}

export async function getOrderConfirmation(confNo: string) {
  const res = await apiClient.get<OrderConfirmation>(`/order-confirmation/${encodeURIComponent(confNo)}`)
  return res.data
}

export async function upsertOrderConfirmation(input: {
  confNo: string
  oeNo?: string
  date: string
  custNo: string
  reqDateFr?: string
  reqDateTo?: string
  compCode?: string
  details: Array<{
    lineNo: number
    itemNo: string
    vendorNo?: string
    qty: number
    ctn?: number
    price?: number
    cost?: number
    poNo?: string
    head?: boolean
  }>
}) {
  const res = await apiClient.post<OrderConfirmation>('/order-confirmation', input)
  return res.data
}

export async function deleteOrderConfirmation(confNo: string) {
  const res = await apiClient.delete<{ deleted: boolean }>(`/order-confirmation/${encodeURIComponent(confNo)}`)
  return res.data
}

export async function enquireOrderConfirmations(params: {
  confNo?: string
  custNo?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}) {
  const res = await apiClient.get<
    Array<{ confNo: string; oeNo?: string | null; date: string; custNo: string; compCode?: string | null; lines: number }>
  >('/order-confirmation/enquiry', { params })
  return res.data
}

export async function getOrderConfirmationReport(confNo: string) {
  const res = await apiClient.get<any>(`/order-confirmation/${encodeURIComponent(confNo)}/report`)
  return res.data
}


