import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto';

/**
 * Update Item DTO
 *
 * Extends CreateItemDto but makes itemNo optional since it's in the URL path.
 * All other fields are optional for partial updates.
 *
 * Original Logic Reference:
 * - FoxPro Form: iitem.scx (Update flow)
 * - Documentation: docs/source/02-business-processes/master-data-management.md lines 139-148
 *
 * Business Logic:
 * - User selects existing item via lookup
 * - Modifies fields
 * - Validates changes (std_code, origin)
 * - Updates mod_date and mod_user
 *
 * Reference: Task 01-01 - Item Entry Form
 */
export class UpdateItemDto extends PartialType(
  OmitType(CreateItemDto, ['itemNo'] as const),
) {}
