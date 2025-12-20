import apiClient from './client'

/**
 * Vendor API Service
 * 
 * Provides API calls for vendor master data operations.
 * 
 * Reference: Task 03-01 - Vendor Entry Form
 */

export interface Vendor {
  id?: number
  vendorNo: string
  ename?: string
  sname?: string
  addr1?: string
  addr2?: string
  addr3?: string
  addr4?: string
  contName?: string
  tel?: string
  tel2?: string
  fax?: string
  fax2?: string
  type?: number // 1=Vendor, 2=Maker
  creDate?: string
  creUser?: string
  modDate?: string
  modUser?: string
}

export interface CreateVendorDto extends Omit<Vendor, 'id' | 'creDate' | 'creUser' | 'modDate' | 'modUser'> {}
export interface UpdateVendorDto extends Partial<Omit<CreateVendorDto, 'vendorNo'>> {}

export interface VendorSearchResult {
  code: string
  name: string
  description?: string
}

export interface VendorListResponse {
  vendors: Vendor[]
  total: number
  page: number
  totalPages: number
}

export async function getVendors(
  page: number = 1,
  limit: number = 50,
  filter?: string,
  type?: number,
): Promise<VendorListResponse> {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
  if (filter) params.append('filter', filter)
  if (type !== undefined) params.append('type', type.toString())
  const response = await apiClient.get(`/vendors?${params.toString()}`)
  return response.data
}

export async function searchVendors(query: string, limit: number = 20): Promise<VendorSearchResult[]> {
  const params = new URLSearchParams({ q: query, limit: limit.toString() })
  const response = await apiClient.get(`/vendors/search?${params.toString()}`)
  return response.data
}

export async function getVendor(vendorNo: string): Promise<Vendor> {
  const response = await apiClient.get(`/vendors/${encodeURIComponent(vendorNo)}`)
  return response.data
}

export async function createVendor(data: CreateVendorDto): Promise<Vendor> {
  const response = await apiClient.post('/vendors', data)
  return response.data
}

export async function updateVendor(vendorNo: string, data: UpdateVendorDto): Promise<Vendor> {
  const response = await apiClient.put(`/vendors/${encodeURIComponent(vendorNo)}`, data)
  return response.data
}

export async function deleteVendor(vendorNo: string): Promise<void> {
  await apiClient.delete(`/vendors/${encodeURIComponent(vendorNo)}`)
}

