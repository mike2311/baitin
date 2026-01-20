import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';

/**
 * Update Invoice DTO
 *
 * Original Logic Reference:
 * - Legacy Form: iinvhd@ (edit functionality)
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - All fields optional for partial updates
 *   - inv_no cannot be changed (primary key)
 *   - Date range validation maintained
 *
 * Reference: Phase 3 - Invoice Module
 */
export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  // inv_no is not allowed to be updated (primary key)
  invNo?: never;
}
