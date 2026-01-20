/**
 * SO Document Response DTOs
 *
 * Original Logic Reference:
 * - Legacy Form: pso (Print Shipping Order)
 * - Business Rules:
 *   - Document generation results
 *   - Preview data
 *   - Export file information
 *
 * Reference: Phase 3 - SO Document Generation
 */

export class SoDocumentPreviewResponseDto {
  soNos: string[];
  formatKey?: string;
  data: Array<{
    soNo: string;
    date: Date;
    custNo?: string;
    customerName?: string;
    customerAddress?: {
      addr1?: string;
      addr2?: string;
      addr3?: string;
      addr4?: string;
    };
    forwarderAddress?: {
      addr1?: string;
      addr2?: string;
      addr3?: string;
      addr4?: string;
    };
    items: Array<{
      itemNo: string;
      itemDescription?: string;
      qty: number;
      ctn?: number;
      shipMark?: string;
      poNo?: string;
      shipTo?: string;
      loadingPort?: string;
      dest?: string;
      fobPort?: string;
    }>;
    vessel?: string;
    discharge?: string;
    loading?: string;
    delivery?: string;
    paymentTerms?: string;
    bl?: string;
    status?: string;
    shipDate?: Date;
    collect?: string;
    amend?: string;
    tel?: string;
    fax?: string;
    contact?: string;
    remarks?: string;
  }>;
}

export class SoDocumentGenerationResponseDto {
  soNos: string[];
  formatKey?: string;
  fileName: string;
  fileUrl?: string; // URL to download generated document
  fileSize: number;
  format: 'pdf' | 'excel' | 'html';
  generatedAt: Date;
  fileBuffer: Buffer; // File buffer for download
}
