import { Injectable } from '@nestjs/common';
import { OrderEnquiryImportFormat } from '../dto/import-order-enquiry.dto';
import { ImportFile } from './types';

/**
 * Detects Order Enquiry import format.
 *
 * Original Logic Reference:
 * - Documentation: docs/source/03-application-modules/order-enquiry-module.md (multiple import formats)
 *
 * Notes:
 * - In legacy FoxPro, the user selects different import programs for each format.
 * - Here we allow explicit format selection; otherwise we infer conservatively from file extension.
 */
@Injectable()
export class ExcelImportFormatDetector {
  detect(
    file: ImportFile,
    explicit?: OrderEnquiryImportFormat,
  ): OrderEnquiryImportFormat {
    if (explicit) return explicit;

    const name = (file.originalName || '').toLowerCase();
    if (name.endsWith('.csv')) return OrderEnquiryImportFormat.CSV_2013;
    if (name.endsWith('.xls') || name.endsWith('.xlsx'))
      return OrderEnquiryImportFormat.XLS_2013;

    // Fallback: treat as STANDARD so parser can attempt best-effort header detection.
    return OrderEnquiryImportFormat.STANDARD;
  }
}
