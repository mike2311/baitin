import apiClient from './client';

/**
 * Enquiry API Service
 *
 * Original Logic Reference:
 * - Legacy Forms: Various enquiry forms
 * - Documentation: docs/source/04-forms-and-screens/enquiry-forms.md
 * - Business Rules:
 *   - API client for read-only enquiries
 *   - Sales analysis and operational enquiries
 *
 * Reference: Phase 3 - Enquiry Module
 */

export interface SalesAnalysisResponse {
  custNo?: string;
  customerName?: string;
  itemNo?: string;
  itemDescription?: string;
  date?: string;
  totalQty: number;
  totalAmount: number;
  invoiceCount: number;
  soCount: number;
}

export interface ItemEnquiryResponse {
  itemNo: string;
  itemDescription?: string;
  stdCode?: string;
  origin?: string;
  price?: number;
  cost?: number;
  totalOrderedQty: number;
  totalConfirmedQty: number;
  totalShippedQty: number;
  totalInvoicedQty: number;
  lastOrderDate?: string;
  lastInvoiceDate?: string;
}

export interface SoEnquiryResponse {
  soNo: string;
  confNo?: string;
  contNo?: string;
  itemNo: string;
  itemDescription?: string;
  qty: number;
  ctn?: number;
  shipDate?: string;
  customerName?: string;
  creDate: string;
}

export interface DnEnquiryResponse {
  dnNo: string;
  date: string;
  custNo?: string;
  customerName?: string;
  soNo?: string;
  itemCount: number;
  totalQty: number;
  loadingStatus: string;
  loadingNo?: string;
  creDate: string;
}

export interface InvoiceEnquiryResponse {
  invNo: string;
  date: string;
  custNo?: string;
  customerName?: string;
  ocNo?: string;
  itemCount: number;
  totalAmount: number;
  plStatus: string;
  creDate: string;
}

export interface SalesAnalysisQuery {
  custNo?: string;
  itemNo?: string;
  dateFrom?: string;
  dateTo?: string;
  groupBy?: 'customer' | 'item' | 'date';
}

export interface ItemEnquiryQuery {
  itemNo?: string;
  itemDescription?: string;
  includeHistory?: boolean;
}

export interface SoEnquiryQuery {
  soNo?: string;
  custNo?: string;
  itemNo?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export interface DnEnquiryQuery {
  dnNo?: string;
  custNo?: string;
  soNo?: string;
  dateFrom?: string;
  dateTo?: string;
  loadingStatus?: string;
}

export interface InvoiceEnquiryQuery {
  invNo?: string;
  custNo?: string;
  ocNo?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class EnquiryApiService {
  /**
   * Sales analysis enquiry
   */
  static async salesAnalysis(query?: SalesAnalysisQuery): Promise<SalesAnalysisResponse[]> {
    const params = new URLSearchParams();
    if (query?.custNo) params.append('custNo', query.custNo);
    if (query?.itemNo) params.append('itemNo', query.itemNo);
    if (query?.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query?.dateTo) params.append('dateTo', query.dateTo);
    if (query?.groupBy) params.append('groupBy', query.groupBy);

    const queryString = params.toString();
    const url = `/enquiries/sales-analysis${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<SalesAnalysisResponse[]>(url);
    return response.data;
  }

  /**
   * Item enquiry
   */
  static async itemEnquiry(query?: ItemEnquiryQuery): Promise<ItemEnquiryResponse[]> {
    const params = new URLSearchParams();
    if (query?.itemNo) params.append('itemNo', query.itemNo);
    if (query?.itemDescription) params.append('itemDescription', query.itemDescription);
    if (query?.includeHistory) params.append('includeHistory', 'true');

    const queryString = params.toString();
    const url = `/enquiries/item${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<ItemEnquiryResponse[]>(url);
    return response.data;
  }

  /**
   * SO enquiry
   */
  static async soEnquiry(query?: SoEnquiryQuery): Promise<SoEnquiryResponse[]> {
    const params = new URLSearchParams();
    if (query?.soNo) params.append('soNo', query.soNo);
    if (query?.custNo) params.append('custNo', query.custNo);
    if (query?.itemNo) params.append('itemNo', query.itemNo);
    if (query?.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query?.dateTo) params.append('dateTo', query.dateTo);
    if (query?.status) params.append('status', query.status);

    const queryString = params.toString();
    const url = `/enquiries/so${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<SoEnquiryResponse[]>(url);
    return response.data;
  }

  /**
   * DN enquiry
   */
  static async dnEnquiry(query?: DnEnquiryQuery): Promise<DnEnquiryResponse[]> {
    const params = new URLSearchParams();
    if (query?.dnNo) params.append('dnNo', query.dnNo);
    if (query?.custNo) params.append('custNo', query.custNo);
    if (query?.soNo) params.append('soNo', query.soNo);
    if (query?.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query?.dateTo) params.append('dateTo', query.dateTo);
    if (query?.loadingStatus) params.append('loadingStatus', query.loadingStatus);

    const queryString = params.toString();
    const url = `/enquiries/dn${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<DnEnquiryResponse[]>(url);
    return response.data;
  }

  /**
   * Invoice enquiry
   */
  static async invoiceEnquiry(query?: InvoiceEnquiryQuery): Promise<InvoiceEnquiryResponse[]> {
    const params = new URLSearchParams();
    if (query?.invNo) params.append('invNo', query.invNo);
    if (query?.custNo) params.append('custNo', query.custNo);
    if (query?.ocNo) params.append('ocNo', query.ocNo);
    if (query?.dateFrom) params.append('dateFrom', query.dateFrom);
    if (query?.dateTo) params.append('dateTo', query.dateTo);

    const queryString = params.toString();
    const url = `/enquiries/invoice${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<InvoiceEnquiryResponse[]>(url);
    return response.data;
  }
}

export default EnquiryApiService;