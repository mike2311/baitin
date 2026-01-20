/**
 * Invoice Item Validation DTO
 *
 * Original Logic Reference:
 * - Legacy Form: iinvdt2@ (Txtbox5.Valid, Txtbox4.Valid)
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - Quantity validation against SO
 *   - Carton validation against SO
 *   - Override confirmation required for mismatches
 *
 * Reference: Phase 3 - Invoice Module
 */
export class ValidateInvoiceItemDto {
  invNo: string;
  itemNo: string;
  confNo?: string;
  qty: number;
  ctn?: number;
  originalQty?: number; // Original qty before change
  originalCtn?: number; // Original ctn before change
}

export class InvoiceItemValidationResult {
  isValid: boolean;
  requiresOverride: boolean;
  validationType?: 'qty' | 'carton';
  message?: string;
  soQty?: number;
  soCtn?: number;
}

/**
 * Invoice Date Range Validation DTO
 *
 * Original Logic Reference:
 * - Legacy Form: iinvdt2@ (Txtbox5.Valid for dates)
 * - Business Rules:
 *   - Both empty or both filled
 *   - To date >= From date
 */
export class ValidateInvoiceDateRangeDto {
  invDtFrDate?: string;
  invDtToDate?: string;
}

export class InvoiceDateRangeValidationResult {
  isValid: boolean;
  message?: string;
}