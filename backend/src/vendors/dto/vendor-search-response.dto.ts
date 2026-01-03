import { ApiProperty } from '@nestjs/swagger';

/**
 * Vendor Search Response DTO
 *
 * Used for lookup/type-to-search functionality.
 *
 * Reference: Task 03-02 - Vendor Lookup
 */
export class VendorSearchResponseDto {
  @ApiProperty({
    description: 'Vendor code/number',
  })
  code: string;

  @ApiProperty({
    description: 'Vendor name',
  })
  name: string;

  @ApiProperty({
    description: 'Short name',
    required: false,
  })
  description?: string;
}
