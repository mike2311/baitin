import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  MinLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Create Customer DTO
 * 
 * Original Logic Reference:
 * - FoxPro: Customer entry form
 * - Documentation: docs/source/02-business-processes/master-data-management.md lines 164-290
 * - Data Model: docs/source/01-data-architecture/table-details/master-data-tables.md lines 136-177
 * 
 * Validation Rules:
 * - cust_no must be unique (checked in service)
 * - Customer name required
 * 
 * Reference: Task 02-01 - Customer Entry Form
 */
export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer number (Primary Key)',
    example: 'CUST001',
  })
  @IsNotEmpty({ message: 'Customer Number is required' })
  @IsString()
  @MinLength(1, { message: 'Customer Number cannot be empty' })
  custNo: string

  @ApiPropertyOptional({
    description: 'English name',
    example: 'ABC Company Ltd',
  })
  @IsOptional()
  @IsString()
  ename?: string

  @ApiPropertyOptional({
    description: 'Short name',
    example: 'ABC',
  })
  @IsOptional()
  @IsString()
  sname?: string

  @ApiPropertyOptional({
    description: 'Chinese name',
    example: '甲乙公司',
  })
  @IsOptional()
  @IsString()
  cname?: string

  @ApiPropertyOptional({
    description: 'Address line 1',
    example: '123 Main Street',
  })
  @IsOptional()
  @IsString()
  addr1?: string

  @ApiPropertyOptional({
    description: 'Address line 2',
    example: 'Suite 100',
  })
  @IsOptional()
  @IsString()
  addr2?: string

  @ApiPropertyOptional({
    description: 'Address line 3',
    example: 'New York, NY 10001',
  })
  @IsOptional()
  @IsString()
  addr3?: string

  @ApiPropertyOptional({
    description: 'Address line 4',
    example: 'USA',
  })
  @IsOptional()
  @IsString()
  addr4?: string

  @ApiPropertyOptional({
    description: 'Contact name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  contName?: string

  @ApiPropertyOptional({
    description: 'Telephone',
    example: '+1-212-555-1234',
  })
  @IsOptional()
  @IsString()
  tel?: string

  @ApiPropertyOptional({
    description: 'Telephone 2',
    example: '+1-212-555-5678',
  })
  @IsOptional()
  @IsString()
  tel2?: string

  @ApiPropertyOptional({
    description: 'Fax',
    example: '+1-212-555-9999',
  })
  @IsOptional()
  @IsString()
  fax?: string

  @ApiPropertyOptional({
    description: 'Fax 2',
    example: '+1-212-555-8888',
  })
  @IsOptional()
  @IsString()
  fax2?: string

  @ApiPropertyOptional({
    description: 'Email',
    example: 'contact@abccompany.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string

  @ApiPropertyOptional({
    description: 'Show sub item detail flag',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  showSubItemDetail?: boolean
}

