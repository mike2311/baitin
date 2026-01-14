import apiClient from './client'

/**
 * Order Enquiry API Service
 *
 * Provides API calls for Order Enquiry operations.
 *
 * Original Logic Reference:
 * - Legacy Tables: moehd (OE Header), moe (OE Detail)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md
 *
 * Reference: Task 02-01 - OE Header Form, Task 02-02 - OE Detail Grid
 */

export interface OrderEnquiryDetail {
  id?: string
  lineNo: number
  itemNo: string
  vendorNo?: string | null
  qty: number
  price?: number | null
  amount?: number | null
  ctn?: number | null
  unit?: string | null
  head?: boolean | null
  itemDesc?: string | null
  remark?: string | null
}

export interface OrderEnquiry {
  oeNo: string
  custNo: string
  oeDate: string
  poNo?: string | null
  status?: number | null
  compCode?: string | null
  remark?: string | null
  totalAmount?: number | null
  details: OrderEnquiryDetail[]
  customer?: {
    custNo: string
    ename?: string
    sname?: string
  }
}

export interface UpsertOrderEnquiryDto {
  oeNo: string
  oeDate: string
  custNo: string
  poNo?: string
  compCode?: string
  status?: number
  remark?: string
  details: Array<{
    lineNo: number
    itemNo: string
    vendorNo?: string
    qty: number
    price?: number
    ctn?: number
    unit?: string
    head?: boolean
    itemDesc?: string
    remark?: string
  }>
}

export async function getOrderEnquiry(oeNo: string): Promise<OrderEnquiry> {
  const response = await apiClient.get(`/order-enquiry/${encodeURIComponent(oeNo)}`)
  return response.data
}

export async function upsertOrderEnquiry(
  data: UpsertOrderEnquiryDto,
): Promise<OrderEnquiry> {
  const response = await apiClient.post('/order-enquiry', data)
  return response.data
}

export async function deleteOrderEnquiry(oeNo: string): Promise<void> {
  await apiClient.delete(`/order-enquiry/${encodeURIComponent(oeNo)}`)
}
