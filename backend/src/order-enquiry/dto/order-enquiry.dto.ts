import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Order Enquiry Detail DTO
 */
export class OrderEnquiryDetailDto {
  @ApiProperty({
    description: 'Line number',
    example: 1,
  })
  @IsNotEmpty({ message: 'Line number is required' })
  @IsNumber()
  @Min(1, { message: 'Line number must be greater than 0' })
  lineNo: number;

  @ApiProperty({
    description: 'Item number',
    example: 'ITEM001',
  })
  @IsNotEmpty({ message: 'Item number is required' })
  @IsString()
  itemNo: string;

  @ApiPropertyOptional({
    description: 'Vendor number',
    example: 'VEND001',
  })
  @IsOptional()
  @IsString()
  vendorNo?: string;

  @ApiProperty({
    description: 'Quantity',
    example: 100,
  })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber()
  @Min(0.0001, { message: 'Quantity must be greater than 0' })
  qty: number;

  @ApiPropertyOptional({
    description: 'Price',
    example: 10.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price?: number;

  @ApiPropertyOptional({
    description: 'CTN (Carton)',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  ctn?: number;

  @ApiPropertyOptional({
    description: 'Unit',
    example: 'PC',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    description: 'Head flag (for BOM items)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  head?: boolean;

  @ApiPropertyOptional({
    description: 'Item description',
    example: 'Test Item Description',
  })
  @IsOptional()
  @IsString()
  itemDesc?: string;

  @ApiPropertyOptional({
    description: 'Remarks',
    example: 'Test remark',
  })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * Upsert Order Enquiry DTO
 *
 * Original Logic Reference:
 * - Legacy Tables: moehd (OE Header), moe (OE Detail)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md
 *
 * Validation Rules:
 * - oeNo must have OE Control (except INSP company)
 * - Customer must match OE Control customer (if OE Control exists)
 * - Item must exist
 * - Quantity > 0
 * - Price >= 0
 *
 * Reference: Task 02-01 - OE Header Form, Task 02-02 - OE Detail Grid
 */
export class UpsertOrderEnquiryDto {
  @ApiProperty({
    description: 'Order Enquiry Number',
    example: 'OE-001',
  })
  @IsNotEmpty({ message: 'OE Number is required' })
  @IsString()
  oeNo: string;

  @ApiProperty({
    description: 'OE Date',
    example: '2026-01-15',
  })
  @IsNotEmpty({ message: 'OE Date is required' })
  @IsDateString({}, { message: 'OE Date must be a valid date' })
  oeDate: string;

  @ApiProperty({
    description: 'Customer Number',
    example: 'CUST001',
  })
  @IsNotEmpty({ message: 'Customer Number is required' })
  @IsString()
  custNo: string;

  @ApiPropertyOptional({
    description: 'PO Number',
    example: 'PO-12345',
  })
  @IsOptional()
  @IsString()
  poNo?: string;

  @ApiPropertyOptional({
    description: 'Company Code',
    example: 'HT',
  })
  @IsOptional()
  @IsString()
  compCode?: string;

  @ApiPropertyOptional({
    description: 'Status (0=Draft, 1=Posted)',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({
    description: 'Remarks',
    example: 'Initial order enquiry',
  })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({
    description: 'Order Enquiry Details',
    type: [OrderEnquiryDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderEnquiryDetailDto)
  details: OrderEnquiryDetailDto[];
}
