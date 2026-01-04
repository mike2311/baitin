import apiClient from './client'

export type OrderEnquiryQtyBreakdown = {
  id: string
  oeNo: string
  itemNo: string
  port?: string | null
  poNo?: string | null
  delFrom?: string | null
  delTo?: string | null
  sizeCode?: string | null
  colorCode?: string | null
  styleCode?: string | null
  qty: number
  userId?: string | null
  modDate?: string | null
  modTime?: string | null
}

export async function listQtyBreakdowns(params: { oeNo: string; itemNo?: string }) {
  const res = await apiClient.get<OrderEnquiryQtyBreakdown[]>('/order-enquiry/qty-breakdown', { params })
  return res.data
}

export async function createQtyBreakdown(input: Omit<OrderEnquiryQtyBreakdown, 'id'>) {
  const res = await apiClient.post<OrderEnquiryQtyBreakdown>('/order-enquiry/qty-breakdown', input)
  return res.data
}

export async function updateQtyBreakdown(id: string, input: Partial<Omit<OrderEnquiryQtyBreakdown, 'id' | 'oeNo' | 'itemNo'>>) {
  const res = await apiClient.put<OrderEnquiryQtyBreakdown>(`/order-enquiry/qty-breakdown/${id}`, input)
  return res.data
}

export async function deleteQtyBreakdown(id: string) {
  const res = await apiClient.delete<{ deleted: boolean }>(`/order-enquiry/qty-breakdown/${id}`)
  return res.data
}


