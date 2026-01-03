import { ApiProperty } from '@nestjs/swagger';

/**
 * Item Search Response DTO
 *
 * Used for lookup/type-to-search functionality.
 * Returns minimal item information for selection.
 *
 * Original Logic Reference:
 * - FoxPro: Lookup forms displaying item_no and description
 * - Documentation: docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md
 *
 * UX Requirements:
 * - Display code and description
 * - Type-to-search with < 200ms response
 * - Recently used items shown first (optional)
 *
 * Reference: Task 01-02 - Item Lookup with Type-to-Search
 */
export class ItemSearchResponseDto {
  @ApiProperty({
    description: 'Item code/number',
    example: 'ITEM001',
  })
  code: string;

  @ApiProperty({
    description: 'Item name/short description',
    example: 'Sample Item',
  })
  name: string;

  @ApiProperty({
    description: 'Full description (optional)',
    example: 'This is a detailed description',
    required: false,
  })
  description?: string;
}
