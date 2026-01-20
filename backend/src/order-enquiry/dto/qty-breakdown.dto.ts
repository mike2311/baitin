import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOrderEnquiryQtyBreakdownDto {
  @IsString({ message: 'Order Enquiry Number must be a string' })
  @IsNotEmpty({ message: 'Order Enquiry Number is required' })
  @MaxLength(50, {
    message: 'Order Enquiry Number cannot exceed 50 characters',
  })
  oeNo: string;

  @IsString({ message: 'Item Number must be a string' })
  @IsNotEmpty({ message: 'Item Number is required' })
  @MaxLength(50, { message: 'Item Number cannot exceed 50 characters' })
  itemNo: string;

  @IsOptional()
  @IsString({ message: 'Port must be a string' })
  @MaxLength(20, { message: 'Port cannot exceed 20 characters' })
  port?: string;

  @IsOptional()
  @IsString({ message: 'PO Number must be a string' })
  @MaxLength(100, { message: 'PO Number cannot exceed 100 characters' })
  poNo?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Delivery From must be a valid date string' })
  delFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Delivery To must be a valid date string' })
  delTo?: string;

  @IsOptional()
  @IsString({ message: 'Size Code must be a string' })
  @MaxLength(20, { message: 'Size Code cannot exceed 20 characters' })
  sizeCode?: string;

  @IsOptional()
  @IsString({ message: 'Color Code must be a string' })
  @MaxLength(20, { message: 'Color Code cannot exceed 20 characters' })
  colorCode?: string;

  @IsOptional()
  @IsString({ message: 'Style Code must be a string' })
  @MaxLength(20, { message: 'Style Code cannot exceed 20 characters' })
  styleCode?: string;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsNotEmpty({ message: 'Quantity is required' })
  @Min(0.0001, { message: 'Quantity must be greater than 0' })
  qty: number;
}

export class UpdateOrderEnquiryQtyBreakdownDto {
  @IsOptional()
  @IsString({ message: 'Port must be a string' })
  @MaxLength(20, { message: 'Port cannot exceed 20 characters' })
  port?: string;

  @IsOptional()
  @IsString({ message: 'PO Number must be a string' })
  @MaxLength(100, { message: 'PO Number cannot exceed 100 characters' })
  poNo?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Delivery From must be a valid date string' })
  delFrom?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Delivery To must be a valid date string' })
  delTo?: string;

  @IsOptional()
  @IsString({ message: 'Size Code must be a string' })
  @MaxLength(20, { message: 'Size Code cannot exceed 20 characters' })
  sizeCode?: string;

  @IsOptional()
  @IsString({ message: 'Color Code must be a string' })
  @MaxLength(20, { message: 'Color Code cannot exceed 20 characters' })
  colorCode?: string;

  @IsOptional()
  @IsString({ message: 'Style Code must be a string' })
  @MaxLength(20, { message: 'Style Code cannot exceed 20 characters' })
  styleCode?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0.0001, { message: 'Quantity must be greater than 0' })
  qty?: number;
}
