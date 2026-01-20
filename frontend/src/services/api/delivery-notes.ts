import { apiClient } from './client';

/**
 * Delivery Note API Service
 *
 * Original Logic Reference:
 * - Legacy Form: idn
 * - Documentation: docs/source/04-forms-and-screens/delivery-note-forms.md
 * - Business Rules:
 *   - API client for DN CRUD operations
 *   - Support for creating DN from SO
 *   - Search and available items functionality
 *
 * Reference: Phase 3 - Delivery Note Module
 */

export interface DeliveryNoteHeader {
  dnNo: string;
  date: string;
  custNo?: string;
  soNo?: string;
  delAddr1?: string;
  delAddr2?: string;
  delAddr3?: string;
  delAddr4?: string;
  delDate?: string;
  loadingStatus: string;
  loadingNo?: string;
  remarks?: string;
  userId?: string;
  creUser?: string;
  creDate: string;
  modDate: string;
}

export interface DeliveryNoteDetail {
  dnNo: string;
  itemNo: string;
  lineNo: number;
  qty: number;
  ctn?: number;
  qctn?: number;
  unit?: string;
  itemDesc?: string;
  poNo?: string;
  shipNo?: string;
  cntrNo?: string;
  refNo?: string;
  ocNo?: string;
  confNo?: string;
  head: boolean;
}

export interface DeliveryNoteBreakdown {
  dnNo: string;
  itemNo: string;
  port: string;
  poNo: string;
  qty?: number;
  delFrom?: string;
  delTo?: string;
}

export interface CreateDeliveryNoteDto {
  dnNo: string;
  date: string;
  custNo?: string;
  soNo?: string;
  delAddr1?: string;
  delAddr2?: string;
  delAddr3?: string;
  delAddr4?: string;
  delDate?: string;
  remarks?: string;
  details: DeliveryNoteDetail[];
  breakdowns?: DeliveryNoteBreakdown[];
  userId?: string;
}

export interface CreateDeliveryNoteFromSoDto {
  dnNo: string;
  date: string;
  soNo: string;
  delAddr1?: string;
  delAddr2?: string;
  delAddr3?: string;
  delAddr4?: string;
  delDate?: string;
  selectedItemNos?: string[];
  copyBreakdowns?: boolean;
  userId?: string;
}

export interface DeliveryNoteSearchResponse {
  dnNo: string;
  date: string;
  custNo?: string;
  customerName?: string;
  soNo?: string;
  delAddr1?: string;
  delAddr2?: string;
  delAddr3?: string;
  delAddr4?: string;
  delDate?: string;
  loadingStatus: string;
  loadingNo?: string;
  itemCount: number;
  totalQty: number;
  creUser?: string;
  creDate: string;
  modDate: string;
}

export interface AvailableItemsForDnResponse {
  soNo: string;
  itemNo: string;
  itemDescription?: string;
  soQty: number;
  deliveredQty: number;
  remainingQty: number;
  ctn?: number;
  poNo?: string;
  shipDate?: string;
  customerName?: string;
}

export interface DeliveryNoteSearchQuery {
  dnNo?: string;
  custNo?: string;
  soNo?: string;
  dateFrom?: string;
  dateTo?: string;
  loadingStatus?: string;
}

export class DeliveryNoteApiService {
  /**
   * Create a delivery note
   */
  static async create(data: CreateDeliveryNoteDto): Promise<DeliveryNoteHeader> {
    const response = await apiClient.post<DeliveryNoteHeader>('/delivery-notes', data);
    return response.data;
  }

  /**
   * Create delivery note from Shipping Order
   */
  static async createFromSo(data: CreateDeliveryNoteFromSoDto): Promise<DeliveryNoteHeader> {
    const response = await apiClient.post<DeliveryNoteHeader>('/delivery-notes/from-so', data);
    return response.data;
  }

  /**
   * Get delivery note by DN number
   */
  static async getByDnNo(dnNo: string): Promise<DeliveryNoteHeader> {
    const response = await apiClient.get<DeliveryNoteHeader>(`/delivery-notes/${dnNo}`);
    return response.data;
  }

  /**
   * Search delivery notes
   */
  static async search(query?: DeliveryNoteSearchQuery): Promise<DeliveryNoteSearchResponse[]> {
    const params = new URLSearchParams();
    if (query?.dnNo) params.append('dnNo', query.dnNo);
    if (query?.custNo) params.append('custNo', query.custNo);
    if (query?.soNo) params.append('soNo', query.soNo);
    if (query?.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query?.dateTo) params.append('dateTo', query.dateTo);
    if (query?.loadingStatus) params.append('loadingStatus', query.loadingStatus);

    const queryString = params.toString();
    const url = `/delivery-notes${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<DeliveryNoteSearchResponse[]>(url);
    return response.data;
  }

  /**
   * Update delivery note
   */
  static async update(dnNo: string, data: Partial<CreateDeliveryNoteDto>): Promise<DeliveryNoteHeader> {
    const response = await apiClient.put<DeliveryNoteHeader>(`/delivery-notes/${dnNo}`, data);
    return response.data;
  }

  /**
   * Update delivery note status
   */
  static async updateStatus(dnNo: string, status: string): Promise<DeliveryNoteHeader> {
    const response = await apiClient.patch<DeliveryNoteHeader>(`/delivery-notes/${dnNo}/status`, { status });
    return response.data;
  }

  /**
   * Delete delivery note
   */
  static async delete(dnNo: string): Promise<void> {
    await apiClient.delete(`/delivery-notes/${dnNo}`);
  }

  /**
   * Get available items for DN creation from SO
   */
  static async getAvailableItemsForDn(soNo: string): Promise<AvailableItemsForDnResponse[]> {
    const response = await apiClient.get<AvailableItemsForDnResponse[]>(
      `/delivery-notes/available-items/${soNo}`
    );
    return response.data;
  }
}

export default DeliveryNoteApiService;