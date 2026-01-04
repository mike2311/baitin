import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOrderEnquiryQtyBreakdownDto {
  @IsString()
  @MaxLength(50)
  oeNo: string;

  @IsString()
  @MaxLength(50)
  itemNo: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  port?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  poNo?: string;

  @IsOptional()
  @IsDateString()
  delFrom?: string;

  @IsOptional()
  @IsDateString()
  delTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  sizeCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  colorCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  styleCode?: string;

  @IsNumber()
  @Min(0.0001)
  qty: number;
}

export class UpdateOrderEnquiryQtyBreakdownDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  port?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  poNo?: string;

  @IsOptional()
  @IsDateString()
  delFrom?: string;

  @IsOptional()
  @IsDateString()
  delTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  sizeCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  colorCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  styleCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  qty?: number;
}
