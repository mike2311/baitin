import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderConfirmationDetailDto {
  @IsInt()
  @Min(1)
  lineNo: number;

  @IsString()
  @MaxLength(50)
  itemNo: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  vendorNo?: string;

  @IsNumber()
  @Min(0.0001)
  qty: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  ctn?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  poNo?: string;

  @IsOptional()
  @IsBoolean()
  head?: boolean;
}

export class UpsertOrderConfirmationDto {
  @IsString()
  @MaxLength(50)
  confNo: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  oeNo?: string;

  @IsDateString()
  date: string;

  @IsString()
  @MaxLength(50)
  custNo: string;

  @IsOptional()
  @IsDateString()
  reqDateFr?: string;

  @IsOptional()
  @IsDateString()
  reqDateTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  compCode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderConfirmationDetailDto)
  details: OrderConfirmationDetailDto[];
}
