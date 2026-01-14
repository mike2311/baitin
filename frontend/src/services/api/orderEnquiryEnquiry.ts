import apiClient from './client'

/**
 * Order Enquiry Enquiry API Service
 *
 * Provides API calls for OE Enquiry search operations.
 *
 * Reference: Task 03-01 - OE List View, Task 03-02 - OE Search and Filter
 */

export interface OrderEnquiryEnquiryResult {
  oeNo: string
  oeDate: string
  custNo: string
  customerName?: string
  poNo?: string | null
  status?: number | null
  compCode?: string | null
  totalAmount?: number | null
  itemCount?: number
}

export interface OrderEnquiryEnquiryParams {
  oeNo?: string
  custNo?: string
  dateFrom?: string
  dateTo?: string
  status?: number
  limit?: number
}

export async function enquireOrderEnquiries(
  params: OrderEnquiryEnquiryParams,
): Promise<OrderEnquiryEnquiryResult[]> {
  const searchParams = new URLSearchParams()
  if (params.oeNo) searchParams.append('oeNo', params.oeNo)
  if (params.custNo) searchParams.append('custNo', params.custNo)
  if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom)
  if (params.dateTo) searchParams.append('dateTo', params.dateTo)
  if (params.status !== undefined) searchParams.append('status', params.status.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())

  const response = await apiClient.get(`/order-enquiry/enquiry?${searchParams.toString()}`)
  return response.data
}
