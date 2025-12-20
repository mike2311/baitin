import { PartialType, OmitType } from '@nestjs/swagger'
import { CreateVendorDto } from './create-vendor.dto'

/**
 * Update Vendor DTO
 * 
 * Reference: Task 03-01 - Vendor Entry Form
 */
export class UpdateVendorDto extends PartialType(
  OmitType(CreateVendorDto, ['vendorNo'] as const),
) {}

