import apiClient from './client'

/**
 * Item API Service
 * 
 * Provides API calls for item master data operations.
 * 
 * Original Logic Reference:
 * - FoxPro Form: iitem.scx (Input Item Detail)
 * - Documentation: docs/source/02-business-processes/master-data-management.md lines 9-163
 * 
 * API Endpoints:
 * - GET /api/items - List items
 * - GET /api/items/search - Search items
 * - GET /api/items/:itemNo - Get item
 * - POST /api/items - Create item
 * - PUT /api/items/:itemNo - Update item
 * - DELETE /api/items/:itemNo - Delete item
 * 
 * Reference: Task 01-01 - Item Entry Form
 */

export interface Item {
  id?: number
  itemNo: string
  itemType?: string
  date?: string
  shortName?: string
  desp?: string
  origin?: string
  grpCode?: string
  material?: string
  upcNo?: string
  htcNo?: string
  stdCode?: string
  price?: number
  priceCur?: string
  cost?: number
  packPc1?: number
  packDesp1?: string
  packPc2?: number
  packDesp2?: string
  packPc3?: number
  packDesp3?: string
  packPc4?: number
  packDesp4?: string
  wt?: number
  net?: number
  cube?: number
  dim?: string
  duty?: number
  creDate?: string
  creUser?: string
  modDate?: string
  modUser?: string
}

export interface CreateItemDto {
  itemNo: string
  itemType?: string
  date?: string
  shortName?: string
  desp?: string
  origin?: string
  grpCode?: string
  material?: string
  upcNo?: string
  htcNo?: string
  stdCode?: string
  price?: number
  priceCur?: string
  cost?: number
  packPc1?: number
  packDesp1?: string
  packPc2?: number
  packDesp2?: string
  packPc3?: number
  packDesp3?: string
  packPc4?: number
  packDesp4?: string
  wt?: number
  net?: number
  cube?: number
  dim?: string
  duty?: number
}

export interface UpdateItemDto extends Partial<Omit<CreateItemDto, 'itemNo'>> {}

export interface ItemSearchResult {
  code: string
  name: string
  description?: string
}

export interface ItemListResponse {
  items: Item[]
  total: number
  page: number
  totalPages: number
}

/**
 * Get all items with filtering and pagination
 */
export async function getItems(
  page: number = 1,
  limit: number = 50,
  filter?: string,
): Promise<ItemListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })
  if (filter) {
    params.append('filter', filter)
  }
  const response = await apiClient.get(`/items?${params.toString()}`)
  return response.data
}

/**
 * Search items for lookup (type-to-search)
 */
export async function searchItems(query: string, limit: number = 20): Promise<ItemSearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  })
  const response = await apiClient.get(`/items/search?${params.toString()}`)
  return response.data
}

/**
 * Get item by item number
 */
export async function getItem(itemNo: string): Promise<Item> {
  const response = await apiClient.get(`/items/${encodeURIComponent(itemNo)}`)
  return response.data
}

/**
 * Create new item
 */
export async function createItem(data: CreateItemDto): Promise<Item> {
  const response = await apiClient.post('/items', data)
  return response.data
}

/**
 * Update existing item
 */
export async function updateItem(itemNo: string, data: UpdateItemDto): Promise<Item> {
  const response = await apiClient.put(`/items/${encodeURIComponent(itemNo)}`, data)
  return response.data
}

/**
 * Delete item
 */
export async function deleteItem(itemNo: string): Promise<void> {
  await apiClient.delete(`/items/${encodeURIComponent(itemNo)}`)
}

