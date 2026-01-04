import apiClient from './client'

export async function generateContractsFromOc(confNo: string) {
  const res = await apiClient.post<{ confNo: string; contracts: number; created: Array<{ vendorNo: string; contNo: string; lines: number }> }>(
    '/contract/generate',
    { confNo }
  )
  return res.data
}

export type ContractDetail = {
  id: string
  lineNo: number
  itemNo: string
  vendorNo?: string | null
  qty: number
  ctn?: number | null
  price?: number | null
  cost?: number | null
  head?: boolean | null
  descMemo?: string | null
  itemMemo?: string | null
}

export type Contract = {
  contNo: string
  confNo: string
  date: string
  vendorNo: string
  payment?: string | null
  remark?: string | null
  reqDateFr?: string | null
  reqDateTo?: string | null
  curCode?: string | null
  shipTo?: string | null
  details: ContractDetail[]
}

export async function getContract(contNo: string) {
  const res = await apiClient.get<Contract>(`/contract/${encodeURIComponent(contNo)}`)
  return res.data
}

export async function upsertContract(input: {
  contNo: string
  confNo: string
  date: string
  vendorNo: string
  payment?: string
  remark?: string
  reqDateFr?: string
  reqDateTo?: string
  curCode?: string
  shipTo?: string
  details: Array<{
    lineNo: number
    itemNo: string
    vendorNo?: string
    qty: number
    ctn?: number
    price?: number
    cost?: number
    head?: boolean
    descMemo?: string
    itemMemo?: string
  }>
}) {
  const res = await apiClient.post<Contract>('/contract', input)
  return res.data
}

export async function deleteContract(contNo: string) {
  const res = await apiClient.delete<{ deleted: boolean }>(`/contract/${encodeURIComponent(contNo)}`)
  return res.data
}

export async function enquireContracts(params: {
  contNo?: string
  confNo?: string
  vendorNo?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}) {
  const res = await apiClient.get<Array<{ contNo: string; confNo: string; date: string; vendorNo: string; lines: number }>>('/contract/enquiry', {
    params,
  })
  return res.data
}

export async function getContractReport(contNo: string) {
  const res = await apiClient.get<any>(`/contract/${encodeURIComponent(contNo)}/report`)
  return res.data
}


