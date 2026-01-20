import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ValidateInvoiceItemDto,
  InvoiceItemValidationResult,
  ValidateInvoiceDateRangeDto,
  InvoiceDateRangeValidationResult,
} from './dto/validate-invoice-item.dto';

/**
 * Invoice Validation Service
 *
 * Original Logic Reference:
 * - Legacy Form: iinvdt2@ (validation methods)
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - Quantity mismatch validation with override prompt
 *   - Carton mismatch validation with override prompt
 *   - Date range validation (both empty or both filled, To >= From)
 *
 * Reference: Phase 3 - Invoice Module
 */
@Injectable()
export class InvoiceValidationService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Validate invoice item quantity against SO
   *
   * Original Logic Reference:
   * - Legacy Form: iinvdt2@ (Txtbox5.Valid)
   * - Business Rules:
   *   - Check if qty matches SO qty
   *   - Return validation result with override requirement
   */
  async validateInvoiceItemQty(validateDto: ValidateInvoiceItemDto): Promise<InvoiceItemValidationResult> {
    if (!validateDto.confNo) {
      // No SO to validate against
      return { isValid: true, requiresOverride: false };
    }

    // Get SO quantity for this item
    const soQuery = `
      SELECT qty, ctn
      FROM shipping_order
      WHERE conf_no = $1 AND item_no = $2
      LIMIT 1
    `;
    const soResults = await this.dataSource.query(soQuery, [validateDto.confNo, validateDto.itemNo]);

    if (soResults.length === 0) {
      // No SO found - allow
      return { isValid: true, requiresOverride: false };
    }

    const soQty = parseFloat(soResults[0].qty);
    const soCtn = soResults[0].ctn ? parseFloat(soResults[0].ctn) : undefined;

    // Check if quantity changed
    if (validateDto.originalQty !== undefined && validateDto.qty === validateDto.originalQty) {
      // No change - valid
      return { isValid: true, requiresOverride: false };
    }

    // Check if quantity matches SO
    if (Math.abs(validateDto.qty - soQty) > 0.01) {
      // Mismatch - requires override confirmation
      return {
        isValid: false,
        requiresOverride: true,
        validationType: 'qty',
        message: `Qty. not Match With Shipping Order Qty.! Continue?`,
        soQty,
        soCtn,
      };
    }

    return { isValid: true, requiresOverride: false, soQty, soCtn };
  }

  /**
   * Validate invoice item carton against SO
   *
   * Original Logic Reference:
   * - Legacy Form: iinvdt2@ (Txtbox4.Valid)
   * - Business Rules:
   *   - Check if ctn matches SO ctn
   *   - Return validation result with override requirement
   */
  async validateInvoiceItemCarton(validateDto: ValidateInvoiceItemDto): Promise<InvoiceItemValidationResult> {
    if (!validateDto.confNo || validateDto.ctn === undefined) {
      // No SO to validate against or no carton specified
      return { isValid: true, requiresOverride: false };
    }

    // Get SO carton for this item
    const soQuery = `
      SELECT ctn
      FROM shipping_order
      WHERE conf_no = $1 AND item_no = $2
      LIMIT 1
    `;
    const soResults = await this.dataSource.query(soQuery, [validateDto.confNo, validateDto.itemNo]);

    if (soResults.length === 0) {
      // No SO found - allow
      return { isValid: true, requiresOverride: false };
    }

    const soCtn = soResults[0].ctn ? parseFloat(soResults[0].ctn) : undefined;

    // Check if carton changed
    if (validateDto.originalCtn !== undefined && validateDto.ctn === validateDto.originalCtn) {
      // No change - valid
      return { isValid: true, requiresOverride: false };
    }

    // Check if carton matches SO
    if (soCtn !== undefined && Math.abs(validateDto.ctn - soCtn) > 0.01) {
      // Mismatch - requires override confirmation
      return {
        isValid: false,
        requiresOverride: true,
        validationType: 'carton',
        message: `Carton no not Match With Shipping Order Carton no.! Continue?`,
        soCtn,
      };
    }

    return { isValid: true, requiresOverride: false, soCtn };
  }

  /**
   * Validate invoice date range
   *
   * Original Logic Reference:
   * - Legacy Form: iinvdt2@ (Txtbox5.Valid for dates)
   * - Business Rules:
   *   - Both empty or both filled
   *   - To date >= From date
   */
  validateInvoiceDateRange(validateDto: ValidateInvoiceDateRangeDto): InvoiceDateRangeValidationResult {
    const frDate = validateDto.invDtFrDate;
    const toDate = validateDto.invDtToDate;

    // Rule 1: Both empty or both filled
    if ((!frDate && toDate) || (frDate && !toDate)) {
      return {
        isValid: false,
        message: 'Invalid Date ! Both invoice date from and to must be empty or both filled',
      };
    }

    // Rule 2: If both filled, To date >= From date
    if (frDate && toDate) {
      const fromDate = new Date(frDate);
      const toDateObj = new Date(toDate);

      if (toDateObj < fromDate) {
        return {
          isValid: false,
          message: 'Invalid Date ! Invoice date to must be greater than or equal to invoice date from',
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate invoice item with override confirmation
   *
   * Combined validation for qty and carton with override handling
   */
  async validateInvoiceItemWithOverride(
    validateDto: ValidateInvoiceItemDto,
    overrideConfirmed: boolean = false,
  ): Promise<InvoiceItemValidationResult> {
    // Validate quantity
    const qtyValidation = await this.validateInvoiceItemQty(validateDto);
    if (qtyValidation.requiresOverride && !overrideConfirmed) {
      return qtyValidation;
    }

    // Validate carton
    const ctnValidation = await this.validateInvoiceItemCarton(validateDto);
    if (ctnValidation.requiresOverride && !overrideConfirmed) {
      return ctnValidation;
    }

    // Both valid or overridden
    return { isValid: true, requiresOverride: false };
  }
}