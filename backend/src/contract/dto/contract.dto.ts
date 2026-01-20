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

export class ContractDetailDto {
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
  @IsBoolean({ message: 'Head must be a boolean' })
  head?: boolean;

  @IsOptional()
  @IsString({ message: 'Description Memo must be a string' })
  descMemo?: string;

  @IsOptional()
  @IsString({ message: 'Item Memo must be a string' })
  itemMemo?: string;
}

export class UpsertContractDto {
  @IsString({ message: 'Contract Number must be a string' })
  @IsNotEmpty({ message: 'Contract Number is required' })
  @MaxLength(50, { message: 'Contract Number cannot exceed 50 characters' })
  contNo: string;

  @IsString({ message: 'Confirmation Number must be a string' })
  @IsNotEmpty({ message: 'Confirmation Number is required' })
  @MaxLength(50, { message: 'Confirmation Number cannot exceed 50 characters' })
  confNo: string;

  @IsDateString({}, { message: 'Date must be a valid date string' })
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  @IsString({ message: 'Vendor Number must be a string' })
  @IsNotEmpty({ message: 'Vendor Number is required' })
  @MaxLength(50, { message: 'Vendor Number cannot exceed 50 characters' })
  vendorNo: string;

  @IsOptional()
  @IsString({ message: 'Payment must be a string' })
  @MaxLength(50, { message: 'Payment cannot exceed 50 characters' })
  payment?: string;

  @IsOptional()
  @IsString({ message: 'Remark must be a string' })
  remark?: string;

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
  @IsString({ message: 'Currency Code must be a string' })
  @MaxLength(20, { message: 'Currency Code cannot exceed 20 characters' })
  curCode?: string;

  @IsOptional()
  @IsString({ message: 'Ship To must be a string' })
  @MaxLength(50, { message: 'Ship To cannot exceed 50 characters' })
  shipTo?: string;

  @IsArray({ message: 'Details must be an array' })
  @IsNotEmpty({ message: 'At least one detail line is required' })
  @ValidateNested({ each: true })
  @Type(() => ContractDetailDto)
  details: ContractDetailDto[];
}
