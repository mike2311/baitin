import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderConfirmationDetailDto {
  @IsInt({ message: 'Line Number must be an integer' })
  @IsNotEmpty({ message: 'Line Number is required' })
  @Min(1, { message: 'Line Number must be at least 1' })
  lineNo: number;

  @IsString({ message: 'Item Number must be a string' })
  @IsNotEmpty({ message: 'Item Number is required' })
  @MaxLength(50, { message: 'Item Number cannot exceed 50 characters' })
  itemNo: string;

  @IsOptional()
  @IsString({ message: 'Vendor Number must be a string' })
  @MaxLength(50, { message: 'Vendor Number cannot exceed 50 characters' })
  vendorNo?: string;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsNotEmpty({ message: 'Quantity is required' })
  @Min(0.0001, { message: 'Quantity must be greater than 0' })
  qty: number;

  @IsOptional()
  @IsInt({ message: 'Carton must be an integer' })
  @Min(0, { message: 'Carton cannot be negative' })
  ctn?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Cost must be a number' })
  @Min(0, { message: 'Cost cannot be negative' })
  cost?: number;

  @IsOptional()
  @IsString({ message: 'PO Number must be a string' })
  @MaxLength(100, { message: 'PO Number cannot exceed 100 characters' })
  poNo?: string;

  @IsOptional()
  @IsBoolean({ message: 'Head must be a boolean' })
  head?: boolean;
}

export class UpsertOrderConfirmationDto {
  @IsString({ message: 'Confirmation Number must be a string' })
  @IsNotEmpty({ message: 'Confirmation Number is required' })
  @MaxLength(50, { message: 'Confirmation Number cannot exceed 50 characters' })
  confNo: string;

  @IsOptional()
  @IsString({ message: 'Order Enquiry Number must be a string' })
  @MaxLength(50, {
    message: 'Order Enquiry Number cannot exceed 50 characters',
  })
  oeNo?: string;

  @IsDateString({}, { message: 'Date must be a valid date string' })
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  @IsString({ message: 'Customer Number must be a string' })
  @IsNotEmpty({ message: 'Customer Number is required' })
  @MaxLength(50, { message: 'Customer Number cannot exceed 50 characters' })
  custNo: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Required Date From must be a valid date string' },
  )
  reqDateFr?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Required Date To must be a valid date string' })
  reqDateTo?: string;

  @IsOptional()
  @IsString({ message: 'Company Code must be a string' })
  @MaxLength(10, { message: 'Company Code cannot exceed 10 characters' })
  compCode?: string;

  @IsArray({ message: 'Details must be an array' })
  @IsNotEmpty({ message: 'At least one detail line is required' })
  @ValidateNested({ each: true })
  @Type(() => OrderConfirmationDetailDto)
  details: OrderConfirmationDetailDto[];
}
