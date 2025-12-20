import apiClient from './client'

/**
 * Customer API Service
 * 
 * Provides API calls for customer master data operations.
 * 
 * Reference: Task 02-01 - Customer Entry Form
 */

export interface Customer {
  id?: number
  custNo: string
  ename?: string
  sname?: string
  cname?: string
  addr1?: string
  addr2?: string
  addr3?: string
  addr4?: string
  contName?: string
  tel?: string
  tel2?: string
  fax?: string
  fax2?: string
  email?: string
  showSubItemDetail?: boolean
  creDate?: string
  creUser?: string
  modDate?: string
  modUser?: string
}

export interface CreateCustomerDto extends Omit<Customer, 'id' | 'creDate' | 'creUser' | 'modDate' | 'modUser'> {}
export interface UpdateCustomerDto extends Partial<Omit<CreateCustomerDto, 'custNo'>> {}

export interface CustomerSearchResult {
  code: string
  name: string
  description?: string
}

export interface CustomerListResponse {
  customers: Customer[]
  total: number
  page: number
  totalPages: number
}

export async function getCustomers(
  page: number = 1,
  limit: number = 50,
  filter?: string,
): Promise<CustomerListResponse> {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
  if (filter) params.append('filter', filter)
  const response = await apiClient.get(`/customers?${params.toString()}`)
  return response.data
}

export async function searchCustomers(query: string, limit: number = 20): Promise<CustomerSearchResult[]> {
  const params = new URLSearchParams({ q: query, limit: limit.toString() })
  const response = await apiClient.get(`/customers/search?${params.toString()}`)
  return response.data
}

export async function getCustomer(custNo: string): Promise<Customer> {
  const response = await apiClient.get(`/customers/${encodeURIComponent(custNo)}`)
  return response.data
}

export async function createCustomer(data: CreateCustomerDto): Promise<Customer> {
  const response = await apiClient.post('/customers', data)
  return response.data
}

export async function updateCustomer(custNo: string, data: UpdateCustomerDto): Promise<Customer> {
  const response = await apiClient.put(`/customers/${encodeURIComponent(custNo)}`, data)
  return response.data
}

export async function deleteCustomer(custNo: string): Promise<void> {
  await apiClient.delete(`/customers/${encodeURIComponent(custNo)}`)
}

