/**
 * Enquiry Response DTOs
 *
 * Original Logic Reference:
 * - Legacy Forms: Various enquiry forms
 * - Documentation: docs/source/04-forms-and-screens/enquiry-forms.md
 * - Business Rules:
 *   - Formatted response data for enquiries
 *   - Supports various aggregation levels
 *
 * Reference: Phase 3 - Enquiry Module
 */

export class SalesAnalysisResponseDto {
  custNo?: string;
  customerName?: string;
  itemNo?: string;
  itemDescription?: string;
  date?: Date;
  totalQty: number;
  totalAmount: number;
  invoiceCount: number;
  soCount: number;
}

export class ItemEnquiryResponseDto {
  itemNo: string;
  itemDescription?: string;
  stdCode?: string;
  origin?: string;
  price?: number;
  cost?: number;
  totalOrderedQty?: number; // From OEs
  totalConfirmedQty?: number; // From OCs
  totalShippedQty?: number; // From SOs
  totalInvoicedQty?: number; // From Invoices
  lastOrderDate?: Date;
  lastInvoiceDate?: Date;
}

export class SoEnquiryResponseDto {
  soNo: string;
  confNo?: string;
  contNo?: string;
  itemNo: string;
  itemDescription?: string;
  qty: number;
  ctn?: number;
  shipDate?: Date;
  customerName?: string;
  status?: string;
  creDate: Date;
}

export class DnEnquiryResponseDto {
  dnNo: string;
  date: Date;
  custNo?: string;
  customerName?: string;
  soNo?: string;
  itemCount: number;
  totalQty: number;
  loadingStatus: string;
  loadingNo?: string;
  creDate: Date;
}

export class InvoiceEnquiryResponseDto {
  invNo: string;
  date: Date;
  custNo?: string;
  customerName?: string;
  ocNo?: string;
  itemCount: number;
  totalAmount: number;
  plStatus: string;
  creDate: Date;
}
