import { PartialType } from '@nestjs/mapped-types';
import { CreateShippingOrderDto } from './create-shipping-order.dto';

/**
 * Update Shipping Order DTO
 *
 * Original Logic Reference:
 * - Legacy Form: isetso (edit functionality)
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - All fields optional for partial updates
 *   - so_no cannot be changed (primary key)
 *   - Validation rules same as create
 *
 * Reference: Phase 3 - Shipping Order Module
 */
export class UpdateShippingOrderDto extends PartialType(CreateShippingOrderDto) {
  // so_no is not allowed to be updated (primary key)
  soNo?: never;
}