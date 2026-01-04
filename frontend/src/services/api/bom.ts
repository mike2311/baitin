import apiClient from './client'

export type ProductBomRow = {
  id: string
  itemNo: string
  subItemNo: string
  qty: number
  unit?: string | null
}

export async function listBom(itemNo: string) {
  const res = await apiClient.get<ProductBomRow[]>('/bom', { params: { itemNo } })
  return res.data
}

export async function createBomRow(input: { itemNo: string; subItemNo: string; qty: number; unit?: string }) {
  const res = await apiClient.post<ProductBomRow>('/bom', input)
  return res.data
}

export async function updateBomRow(id: string, input: { qty?: number; unit?: string }) {
  const res = await apiClient.put<ProductBomRow>(`/bom/${id}`, input)
  return res.data
}

export async function deleteBomRow(id: string) {
  const res = await apiClient.delete<{ deleted: boolean }>(`/bom/${id}`)
  return res.data
}


