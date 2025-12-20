import { PartialType, OmitType } from '@nestjs/swagger'
import { CreateCustomerDto } from './create-customer.dto'

/**
 * Update Customer DTO
 * 
 * Extends CreateCustomerDto but makes custNo optional since it's in the URL path.
 * All other fields are optional for partial updates.
 * 
 * Reference: Task 02-01 - Customer Entry Form
 */
export class UpdateCustomerDto extends PartialType(
  OmitType(CreateCustomerDto, ['custNo'] as const),
) {}

