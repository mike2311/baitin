/**
 * Invoice Search Response DTO
 *
 * Original Logic Reference:
 * - Legacy Form: einvoice
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - Returns formatted invoice data for lookup/search
 *   - Includes customer information for display
 *   - Supports pagination for large result sets
 *
 * Reference: Phase 3 - Invoice Module
 */
export class InvoiceSearchResponseDto {
  invNo: string;
  date: Date;
  custNo?: string;
  customerName?: string; // From mcustom.ename
  ocNo?: string;
  ship?: string;
  delDate?: Date;
  itemCount: number; // Number of items in invoice
  totalAmount: number; // Total invoice amount
  plStatus: string; // Packing List status
  plShStatus: string; // Packing List Ship Mark status
  creUser?: string;
  creDate: Date;
  modDate: Date;
}

/**
 * Invoice Detail Response DTO
 *
 * For viewing invoice details with all items.
 */
export class InvoiceDetailResponseDto {
  header: InvoiceSearchResponseDto;
  items: Array<{
    itemNo: string;
    itemDescription?: string;
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
    lineNo: number;
  }>;
}

/**
 * Available Items for Invoice Creation Response
 *
 * Original Logic Reference:
 * - Legacy Form: iinvdt2@ (container selection)
 * - Business Rules:
 *   - Shows SO/DN items available for invoice
 *   - Filtered by container/ref if provided
 *   - Calculates already invoiced quantities
 */
export class AvailableItemsForInvoiceResponseDto {
  sourceType: 'so' | 'dn';
  sourceNo: string;
  itemNo: string;
  itemDescription?: string;
  sourceQty: number; // Quantity in SO/DN
  invoicedQty: number; // Already in invoices
  remainingQty: number; // Available for new invoice
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

/**
 * Container/Ref Selection Response
 *
 * Original Logic Reference:
 * - Legacy Form: iinvdt2@ (getcntrno method)
 * - Business Rules:
 *   - Returns available containers and ref numbers
 *   - Used for filtering invoice items
 */
export class ContainerRefSelectionResponseDto {
  cntrNo: string;
  refNo: string;
  itemCount: number; // Number of items in this container/ref
  totalQty: number; // Total quantity
}