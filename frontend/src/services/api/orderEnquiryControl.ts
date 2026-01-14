import apiClient from './client'

/**
 * Order Enquiry Control API Service
 *
 * Provides API calls for OE Control operations.
 *
 * Original Logic Reference:
 * - Legacy Table: moectrl (DBF)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md lines 44-69
 *
 * Reference: Task 01-01 - OE Control Entry Form
 */

export interface OrderEnquiryControl {
  id?: number
  oeNo: string
  custNo: string
  oeDate: string
  poNo?: string | null
  status?: string | null
  remark?: string | null
  customer?: {
    custNo: string
    ename?: string
    sname?: string
  }
  creDate?: string
  creUser?: string
  modDate?: string
  modUser?: string
}

export interface CreateOrderEnquiryControlDto {
  oeNo: string
  custNo: string
  oeDate: string
  poNo?: string
  status?: string
  remark?: string
}

export interface UpdateOrderEnquiryControlDto {
  custNo?: string
  oeDate?: string
  poNo?: string
  status?: string
  remark?: string
}

export interface OrderEnquiryControlSearchParams {
  oeNo?: string
  custNo?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface OrderEnquiryControlListResponse {
  controls: OrderEnquiryControl[]
  total: number
  page: number
  totalPages: number
}

export async function getOrderEnquiryControl(oeNo: string): Promise<OrderEnquiryControl> {
  const response = await apiClient.get(`/order-enquiry/control/${encodeURIComponent(oeNo)}`)
  return response.data
}

export async function createOrderEnquiryControl(
  data: CreateOrderEnquiryControlDto,
): Promise<OrderEnquiryControl> {
  const response = await apiClient.post('/order-enquiry/control', data)
  return response.data
}

export async function updateOrderEnquiryControl(
  oeNo: string,
  data: UpdateOrderEnquiryControlDto,
): Promise<OrderEnquiryControl> {
  const response = await apiClient.put(`/order-enquiry/control/${encodeURIComponent(oeNo)}`, data)
  return response.data
}

export async function deleteOrderEnquiryControl(oeNo: string): Promise<void> {
  await apiClient.delete(`/order-enquiry/control/${encodeURIComponent(oeNo)}`)
}

export async function searchOrderEnquiryControls(
  params: OrderEnquiryControlSearchParams,
): Promise<OrderEnquiryControlListResponse> {
  const searchParams = new URLSearchParams()
  if (params.oeNo) searchParams.append('oeNo', params.oeNo)
  if (params.custNo) searchParams.append('custNo', params.custNo)
  if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom)
  if (params.dateTo) searchParams.append('dateTo', params.dateTo)
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())

  const response = await apiClient.get(`/order-enquiry/control?${searchParams.toString()}`)
  return response.data
}
