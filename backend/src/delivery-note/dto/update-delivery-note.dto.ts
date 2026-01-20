import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryNoteDto } from './create-delivery-note.dto';

/**
 * Update Delivery Note DTO
 *
 * Original Logic Reference:
 * - Legacy Form: idn (edit functionality)
 * - Documentation: docs/source/04-forms-and-screens/delivery-note-forms.md
 * - Business Rules:
 *   - All fields optional for partial updates
 *   - dn_no cannot be changed (primary key)
 *   - Status transitions validated
 *
 * Reference: Phase 3 - Delivery Note Module
 */
export class UpdateDeliveryNoteDto extends PartialType(CreateDeliveryNoteDto) {
  // dn_no is not allowed to be updated (primary key)
  dnNo?: never;
}