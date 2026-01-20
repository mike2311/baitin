import { apiClient } from './client';

/**
 * Invoice API Service
 *
 * Original Logic Reference:
 * - Legacy Form: iinvhd@, iinvdt2@
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - API client for invoice CRUD operations
 *   - Support for creating invoice from SO/DN
 *   - Container/ref-driven item selection
 *   - Validation with override prompts
 *
 * Reference: Phase 3 - Invoice Module
 */

export interface InvoiceHeader {
  invNo: string;
  date: string;
  custNo?: string;
  ocNo?: string;
  ship?: string;
  delDate?: string;
  loadingPort?: string;
  dest?: string;
  paymentTerms?: string;
  remarks?: string;
  plStatus: string;
  plShStatus: string;
  userId?: string;
  creUser?: string;
  creDate: string;
  modDate: string;
}

export interface InvoiceDetail {
  invNo: string;
  itemNo: string;
  lineNo: number;
  qty: number;
  price?: number;
  amount?: number;
  ctn?: number;
  qctn?: number;
  net?: number;
  wt?: number;
  cube?: number;
  dim?: string;
  unit?: string;
  despMemo?: string;
  poNo?: string;
  shipNo?: string;
  cntrNo?: string;
  refNo?: string;
  ocNo?: string;
  confNo?: string;
  soNo?: string;
  head: boolean;
}

export interface CreateInvoiceDto {
  invNo: string;
  date: string;
  custNo?: string;
  ocNo?: string;
  ship?: string;
  delDate?: string;
  loadingPort?: string;
  dest?: string;
  paymentTerms?: string;
  remarks?: string;
  invDtFrDate?: string;
  invDtToDate?: string;
  details?: InvoiceDetail[];
  userId?: string;
}

export interface CreateInvoiceFromSourceDto {
  invNo: string;
  date: string;
  sourceType: 'so' | 'dn';
  sourceNo: string;
  delDate?: string;
  ship?: string;
  loadingPort?: string;
  dest?: string;
  selectedItemNos?: string[];
  userId?: string;
}

export interface SelectInvoiceItemsByContainerDto {
  invNo: string;
  cntrNo?: string;
  refNo?: string;
  invDtFrDate?: string;
  invDtToDate?: string;
  selectedItemNos?: string[];
}

export interface InvoiceSearchResponse {
  invNo: string;
  date: string;
  custNo?: string;
  customerName?: string;
  ocNo?: string;
  ship?: string;
  delDate?: string;
  itemCount: number;
  totalAmount: number;
  plStatus: string;
  plShStatus: string;
  creUser?: string;
  creDate: string;
  modDate: string;
}

export interface AvailableItemsForInvoiceResponse {
  sourceType: 'so' | 'dn';
  sourceNo: string;
  itemNo: string;
  itemDescription?: string;
  sourceQty: number;
  invoicedQty: number;
  remainingQty: number;
  ctn?: number;
  poNo?: string;
  shipNo?: string;
  cntrNo?: string;
  refNo?: string;
  ocNo?: string;
  confNo?: string;
  soNo?: string;
  customerName?: string;
}

export interface InvoiceItemValidationResult {
  isValid: boolean;
  requiresOverride: boolean;
  validationType?: 'qty' | 'carton';
  message?: string;
  soQty?: number;
  soCtn?: number;
}

export interface InvoiceDateRangeValidationResult {
  isValid: boolean;
  message?: string;
}

export interface InvoiceSearchQuery {
  invNo?: string;
  custNo?: string;
  ocNo?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class InvoiceApiService {
  /**
   * Create an invoice
   */
  static async create(data: CreateInvoiceDto): Promise<InvoiceHeader> {
    const response = await apiClient.post<InvoiceHeader>('/invoices', data);
    return response.data;
  }

  /**
   * Create invoice from SO or DN
   */
  static async createFromSource(data: CreateInvoiceFromSourceDto): Promise<InvoiceHeader> {
    const response = await apiClient.post<InvoiceHeader>('/invoices/from-source', data);
    return response.data;
  }

  /**
   * Get invoice by invoice number
   */
  static async getByInvNo(invNo: string): Promise<InvoiceHeader> {
    const response = await apiClient.get<InvoiceHeader>(`/invoices/${invNo}`);
    return response.data;
  }

  /**
   * Search invoices
   */
  static async search(query?: InvoiceSearchQuery): Promise<InvoiceSearchResponse[]> {
    const params = new URLSearchParams();
    if (query?.invNo) params.append('invNo', query.invNo);
    if (query?.custNo) params.append('custNo', query.custNo);
    if (query?.ocNo) params.append('ocNo', query.ocNo);
    if (query?.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query?.dateTo) params.append('dateTo', query.dateTo);

    const queryString = params.toString();
    const url = `/invoices${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<InvoiceSearchResponse[]>(url);
    return response.data;
  }

  /**
   * Update invoice
   */
  static async update(invNo: string, data: Partial<CreateInvoiceDto>): Promise<InvoiceHeader> {
    const response = await apiClient.put<InvoiceHeader>(`/invoices/${invNo}`, data);
    return response.data;
  }

  /**
   * Delete invoice
   */
  static async delete(invNo: string): Promise<void> {
    await apiClient.delete(`/invoices/${invNo}`);
  }

  /**
   * Get available items for invoice creation from SO or DN
   */
  static async getAvailableItemsForInvoice(
    sourceType: 'so' | 'dn',
    sourceNo: string,
    cntrNo?: string,
    refNo?: string,
  ): Promise<AvailableItemsForInvoiceResponse[]> {
    const params = new URLSearchParams();
    if (cntrNo) params.append('cntrNo', cntrNo);
    if (refNo) params.append('refNo', refNo);

    const queryString = params.toString();
    const url = `/invoices/available-items/${sourceType}/${sourceNo}${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<AvailableItemsForInvoiceResponse[]>(url);
    return response.data;
  }

  /**
   * Select invoice items by container/ref
   */
  static async selectItemsByContainer(data: SelectInvoiceItemsByContainerDto): Promise<InvoiceDetail[]> {
    const response = await apiClient.post<InvoiceDetail[]>('/invoices/select-items-by-container', data);
    return response.data;
  }

  /**
   * Get container/ref selection options
   */
  static async getContainerRefSelection(
    invNo: string,
    invDtFrDate?: string,
    invDtToDate?: string,
  ): Promise<any[]> {
    const params = new URLSearchParams();
    if (invDtFrDate) params.append('invDtFrDate', invDtFrDate);
    if (invDtToDate) params.append('invDtToDate', invDtToDate);

    const queryString = params.toString();
    const url = `/invoices/container-ref-selection/${invNo}${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<any[]>(url);
    return response.data;
  }

  /**
   * Validate invoice item quantity
   */
  static async validateItemQty(data: {
    invNo: string;
    itemNo: string;
    confNo?: string;
    qty: number;
    originalQty?: number;
  }): Promise<InvoiceItemValidationResult> {
    const response = await apiClient.post<InvoiceItemValidationResult>('/invoices/validation/item-qty', data);
    return response.data;
  }

  /**
   * Validate invoice item carton
   */
  static async validateItemCarton(data: {
    invNo: string;
    itemNo: string;
    confNo?: string;
    ctn: number;
    originalCtn?: number;
  }): Promise<InvoiceItemValidationResult> {
    const response = await apiClient.post<InvoiceItemValidationResult>('/invoices/validation/item-carton', data);
    return response.data;
  }

  /**
   * Validate invoice date range
   */
  static async validateDateRange(data: {
    invDtFrDate?: string;
    invDtToDate?: string;
  }): Promise<InvoiceDateRangeValidationResult> {
    const response = await apiClient.post<InvoiceDateRangeValidationResult>('/invoices/validation/date-range', data);
    return response.data;
  }

  /**
   * Preview invoice document
   */
  static async previewInvoiceDocument(data: {
    invNos: string[];
    documentType: 'packing_list' | 'packing_list_spencer' | 'shipment_advice' | 'debit_note' | 'invoice';
    containerNo?: string;
  }): Promise<any> {
    const response = await apiClient.post<any>('/invoices/documents/preview', data);
    return response.data;
  }

  /**
   * Generate invoice document
   */
  static async generateInvoiceDocument(data: {
    invNos: string[];
    documentType: 'packing_list' | 'packing_list_spencer' | 'shipment_advice' | 'debit_note' | 'invoice';
    outputFormat?: 'pdf' | 'excel' | 'html';
    fileName?: string;
    containerNo?: string;
  }): Promise<Blob> {
    const response = await apiClient.post('/invoices/documents/generate', data, {
      responseType: 'blob',
    });
    return response.data as Blob;
  }
}

export default InvoiceApiService;