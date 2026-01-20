import { apiClient } from './client';

/**
 * Shipping Order API Service
 *
 * Original Logic Reference:
 * - Legacy Form: isetso
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - API client for SO CRUD operations
 *   - Support for creating SO from OC/Contract
 *   - Search and available items functionality
 *
 * Reference: Phase 3 - Shipping Order Module
 */

export interface ShippingOrder {
  soNo: string;
  confNo?: string;
  contNo?: string;
  itemNo: string;
  qty: number;
  ctn?: number;
  shipDate?: string;
  shipMark?: string;
  fobPort?: string;
  poNo?: string;
  ocNo?: string;
  shipTo?: string;
  loadingPort?: string;
  dest?: string;
  remarks?: string;
  userId?: string;
  creUser?: string;
  creDate: string;
  modDate: string;
}

export interface CreateShippingOrderDto {
  soNo: string;
  confNo?: string;
  contNo?: string;
  itemNo: string;
  qty: number;
  ctn?: number;
  shipDate?: string;
  shipMark?: string;
  fobPort?: string;
  poNo?: string;
  ocNo?: string;
  shipTo?: string;
  loadingPort?: string;
  dest?: string;
  remarks?: string;
  userId?: string;
}

export interface CreateShippingOrderFromSourceDto {
  soNo: string;
  sourceType: 'oc' | 'contract';
  sourceNo: string;
  selectedItems: Array<{
    itemNo: string;
    qty: number;
    ctn?: number;
    poNo?: string;
    shipDate?: string;
  }>;
  userId?: string;
}

export interface ShippingOrderSearchResponse {
  soNo: string;
  confNo?: string;
  contNo?: string;
  itemNo: string;
  itemDescription?: string;
  qty: number;
  ctn?: number;
  shipDate?: string;
  shipMark?: string;
  poNo?: string;
  shipTo?: string;
  loadingPort?: string;
  dest?: string;
  creUser?: string;
  creDate: string;
  modDate: string;
}

export interface AvailableItemsForSoResponse {
  confNo?: string;
  contNo?: string;
  itemNo: string;
  itemDescription?: string;
  availableQty: number;
  shippedQty: number;
  remainingQty: number;
  ctn?: number;
  poNo?: string;
  shipDate?: string;
  customerName?: string;
}

export interface ShippingOrderSearchQuery {
  soNo?: string;
  confNo?: string;
  contNo?: string;
  itemNo?: string;
  shipDateFrom?: string;
  shipDateTo?: string;
}

export class ShippingOrderApiService {
  /**
   * Create a shipping order record
   */
  static async create(data: CreateShippingOrderDto): Promise<ShippingOrder> {
    const response = await apiClient.post<ShippingOrder>('/shipping-orders', data);
    return response.data;
  }

  /**
   * Create shipping orders from OC or Contract
   */
  static async createFromSource(data: CreateShippingOrderFromSourceDto): Promise<ShippingOrder[]> {
    const response = await apiClient.post<ShippingOrder[]>('/shipping-orders/from-source', data);
    return response.data;
  }

  /**
   * Get shipping order by SO number
   */
  static async getBySoNo(soNo: string): Promise<ShippingOrder> {
    const response = await apiClient.get<ShippingOrder>(`/shipping-orders/${soNo}`);
    return response.data;
  }

  /**
   * Search shipping orders
   */
  static async search(query?: ShippingOrderSearchQuery): Promise<ShippingOrderSearchResponse[]> {
    const params = new URLSearchParams();
    if (query?.soNo) params.append('soNo', query.soNo);
    if (query?.confNo) params.append('confNo', query.confNo);
    if (query?.contNo) params.append('contNo', query.contNo);
    if (query?.itemNo) params.append('itemNo', query.itemNo);
    if (query?.shipDateFrom) params.append('shipDateFrom', query.shipDateFrom);
    if (query?.shipDateTo) params.append('shipDateTo', query.shipDateTo);

    const queryString = params.toString();
    const url = `/shipping-orders${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ShippingOrderSearchResponse[]>(url);
    return response.data;
  }

  /**
   * Update shipping order
   */
  static async update(soNo: string, data: Partial<CreateShippingOrderDto>): Promise<ShippingOrder> {
    const response = await apiClient.put<ShippingOrder>(`/shipping-orders/${soNo}`, data);
    return response.data;
  }

  /**
   * Delete shipping order
   */
  static async delete(soNo: string): Promise<void> {
    await apiClient.delete(`/shipping-orders/${soNo}`);
  }

  /**
   * Get available items for SO creation from OC or Contract
   */
  static async getAvailableItemsForSo(
    sourceType: 'oc' | 'contract',
    sourceNo: string,
  ): Promise<AvailableItemsForSoResponse[]> {
    const response = await apiClient.get<AvailableItemsForSoResponse[]>(
      `/shipping-orders/available-items/${sourceType}/${sourceNo}`
    );
    return response.data;
  }

  /**
   * Get SO format configuration
   */
  static async getSoFormat(soKey: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/shipping-orders/format/${soKey}`);
    return response.data;
  }

  /**
   * Preview SO document
   */
  static async previewSoDocument(data: {
    soNos: string[];
    formatKey?: string;
    addressType?: 'shipping' | 'loading';
  }): Promise<any> {
    const response = await apiClient.post<any>('/shipping-orders/documents/preview', data);
    return response.data;
  }

  /**
   * Generate SO document
   */
  static async generateSoDocument(data: {
    soNos: string[];
    formatKey?: string;
    outputFormat?: 'pdf' | 'excel' | 'html';
    fileName?: string;
    addressType?: 'shipping' | 'loading';
  }): Promise<Blob> {
    const response = await apiClient.post('/shipping-orders/documents/generate', data, {
      responseType: 'blob', // For file download
    });
    return response.data as Blob;
  }
}

export default ShippingOrderApiService;