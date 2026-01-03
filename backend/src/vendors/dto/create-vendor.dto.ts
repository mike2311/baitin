import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Create Vendor DTO
 *
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/master-data-management.md lines 291-363
 * - Data Model: docs/source/01-data-architecture/table-details/master-data-tables.md lines 179-212
 *
 * Validation Rules:
 * - vendor_no must be unique (checked in service)
 * - type must be 1 (Vendor) or 2 (Maker)
 *
 * Reference: Task 03-01 - Vendor Entry Form
 */
export class CreateVendorDto {
  @ApiProperty({
    description: 'Vendor number (Primary Key)',
    example: 'VEN001',
  })
  @IsNotEmpty({ message: 'Vendor Number is required' })
  @IsString()
  @MinLength(1, { message: 'Vendor Number cannot be empty' })
  vendorNo: string;

  @ApiPropertyOptional({
    description: 'English name',
    example: 'XYZ Manufacturing Ltd',
  })
  @IsOptional()
  @IsString()
  ename?: string;

  @ApiPropertyOptional({
    description: 'Short name',
    example: 'XYZ',
  })
  @IsOptional()
  @IsString()
  sname?: string;

  @ApiPropertyOptional({
    description: 'Address line 1',
  })
  @IsOptional()
  @IsString()
  addr1?: string;

  @ApiPropertyOptional({
    description: 'Address line 2',
  })
  @IsOptional()
  @IsString()
  addr2?: string;

  @ApiPropertyOptional({
    description: 'Address line 3',
  })
  @IsOptional()
  @IsString()
  addr3?: string;

  @ApiPropertyOptional({
    description: 'Address line 4',
  })
  @IsOptional()
  @IsString()
  addr4?: string;

  @ApiPropertyOptional({
    description: 'Contact name',
  })
  @IsOptional()
  @IsString()
  contName?: string;

  @ApiPropertyOptional({
    description: 'Telephone',
  })
  @IsOptional()
  @IsString()
  tel?: string;

  @ApiPropertyOptional({
    description: 'Telephone 2',
  })
  @IsOptional()
  @IsString()
  tel2?: string;

  @ApiPropertyOptional({
    description: 'Fax',
  })
  @IsOptional()
  @IsString()
  fax?: string;

  @ApiPropertyOptional({
    description: 'Fax 2',
  })
  @IsOptional()
  @IsString()
  fax2?: string;

  @ApiPropertyOptional({
    description: 'Vendor type: 1=Vendor, 2=Maker',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Type must be 1 (Vendor) or 2 (Maker)' })
  @Max(2, { message: 'Type must be 1 (Vendor) or 2 (Maker)' })
  type?: number;
}
