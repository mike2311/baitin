/**
 * Invoice Document Response DTOs
 *
 * Original Logic Reference:
 * - Legacy Forms: ppacklist_new, ppacklist_xls_spencer, pshadvice, pdebitnote
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - Document generation results
 *   - Preview data
 *   - Export file information
 *
 * Reference: Phase 3 - Invoice Document Generation
 */

export class InvoiceDocumentPreviewResponseDto {
  invNos: string[];
  documentType: string;
  data: Array<{
    invNo: string;
    date: Date;
    custNo?: string;
    customerName?: string;
    customerAddress?: {
      addr1?: string;
      addr2?: string;
      addr3?: string;
      addr4?: string;
    };
    items: Array<{
      itemNo: string;
      itemName?: string;
      itemDescription?: string;
      sknNo?: string;
      qty: number;
      ctn?: number;
      qctn?: number;
      net?: number;
      wt?: number;
      cube?: number;
      dim?: string;
      outerDim?: string; // ol x ow x oh
      innerDim?: string; // il x iw x ih
      shipMark?: string;
      poNo?: string;
      cntrNo?: string;
      unit?: string;
      head: boolean; // BOM head item
      headItem?: string; // Parent item for BOM sub-items
    }>;
    confNo?: string;
    ship?: string;
    loading?: string;
    dest?: string;
    delDate?: Date;
    covering?: string;
    totalCartons?: number;
    totalQty?: number;
    totalNet?: number;
    totalWt?: number;
    totalCube?: number;
  }>;
}

export class InvoiceDocumentGenerationResponseDto {
  invNos: string[];
  documentType: string;
  fileName: string;
  fileUrl?: string; // URL to download generated document
  fileSize: number;
  format: 'pdf' | 'excel' | 'html';
  generatedAt: Date;
  fileBuffer: Buffer; // File buffer for download
}
