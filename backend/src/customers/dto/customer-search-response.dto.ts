import { ApiProperty } from '@nestjs/swagger';

/**
 * Customer Search Response DTO
 *
 * Used for lookup/type-to-search functionality.
 *
 * Reference: Task 02-02 - Customer Lookup
 */
export class CustomerSearchResponseDto {
  @ApiProperty({
    description: 'Customer code/number',
    example: 'CUST001',
  })
  code: string;

  @ApiProperty({
    description: 'Customer name',
    example: 'ABC Company Ltd',
  })
  name: string;

  @ApiProperty({
    description: 'Short name',
    example: 'ABC',
    required: false,
  })
  description?: string;
}
