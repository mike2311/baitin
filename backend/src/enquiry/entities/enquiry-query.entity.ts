/**
 * Enquiry Query Entity (Virtual)
 *
 * This is not a database entity but represents enquiry query structures.
 * Enquiries are read-only views/queries over existing transaction tables.
 *
 * Original Logic Reference:
 * - Legacy Forms: Various enquiry forms (40+ enquiry forms)
 * - Documentation: docs/source/04-forms-and-screens/enquiry-forms.md
 * - Business Rules:
 *   - Read-only queries
 *   - Various filters and aggregations
 *   - Export functionality
 *
 * Reference: Phase 3 - Enquiry Module
 */

export interface SalesAnalysisQuery {
  custNo?: string;
  itemNo?: string;
  dateFrom?: Date;
  dateTo?: Date;
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
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
}

export interface DnEnquiryQuery {
  dnNo?: string;
  custNo?: string;
  soNo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  loadingStatus?: string;
}

export interface InvoiceEnquiryQuery {
  invNo?: string;
  custNo?: string;
  ocNo?: string;
  dateFrom?: Date;
  dateTo?: Date;
}