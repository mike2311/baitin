import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Create Order Enquiry Control DTO
 *
 * Original Logic Reference:
 * - Legacy Table: moectrl (DBF)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md lines 44-69
 * - Business Rule: OE Control must exist before OE creation (except INSP company)
 *
 * Validation Rules:
 * - oeNo must be unique (checked in service)
 * - custNo must exist in customer table (checked in service)
 * - Required fields: oeNo, custNo, oeDate
 *
 * Reference: Task 01-01 - OE Control Entry Form
 */
export class CreateOrderEnquiryControlDto {
  @ApiProperty({
    description: 'Order Enquiry Number (Primary Key)',
    example: 'OE-001',
  })
  @IsNotEmpty({ message: 'OE Number is required' })
  @IsString()
  @MinLength(1, { message: 'OE Number cannot be empty' })
  oeNo: string;

  @ApiProperty({
    description: 'Customer Number',
    example: 'CUST001',
  })
  @IsNotEmpty({ message: 'Customer Number is required' })
  @IsString()
  @MinLength(1, { message: 'Customer Number cannot be empty' })
  custNo: string;

  @ApiProperty({
    description: 'OE Date',
    example: '2026-01-15',
  })
  @IsNotEmpty({ message: 'OE Date is required' })
  @IsDateString({}, { message: 'OE Date must be a valid date' })
  oeDate: string;

  @ApiPropertyOptional({
    description: 'PO Number',
    example: 'PO-12345',
  })
  @IsOptional()
  @IsString()
  poNo?: string;

  @ApiPropertyOptional({
    description: 'Status',
    example: 'Draft',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Remarks',
    example: 'Initial order enquiry',
  })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * Update Order Enquiry Control DTO
 */
export class UpdateOrderEnquiryControlDto {
  @ApiPropertyOptional({
    description: 'Customer Number',
    example: 'CUST001',
  })
  @IsOptional()
  @IsString()
  custNo?: string;

  @ApiPropertyOptional({
    description: 'OE Date',
    example: '2026-01-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'OE Date must be a valid date' })
  oeDate?: string;

  @ApiPropertyOptional({
    description: 'PO Number',
    example: 'PO-12345',
  })
  @IsOptional()
  @IsString()
  poNo?: string;

  @ApiPropertyOptional({
    description: 'Status',
    example: 'Draft',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Remarks',
    example: 'Initial order enquiry',
  })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * Order Enquiry Control Search DTO
 */
export class OrderEnquiryControlSearchDto {
  @ApiPropertyOptional({
    description: 'Search by OE Number (contains)',
    example: 'OE-001',
  })
  @IsOptional()
  @IsString()
  oeNo?: string;

  @ApiPropertyOptional({
    description: 'Search by Customer Number',
    example: 'CUST001',
  })
  @IsOptional()
  @IsString()
  custNo?: string;

  @ApiPropertyOptional({
    description: 'Search from date',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date From must be a valid date' })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Search to date',
    example: '2026-01-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date To must be a valid date' })
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 50,
  })
  @IsOptional()
  limit?: number;
}
