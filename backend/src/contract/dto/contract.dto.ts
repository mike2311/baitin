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

export class ContractDetailDto {
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
  @IsBoolean()
  head?: boolean;

  @IsOptional()
  @IsString()
  descMemo?: string;

  @IsOptional()
  @IsString()
  itemMemo?: string;
}

export class UpsertContractDto {
  @IsString()
  @MaxLength(50)
  contNo: string;

  @IsString()
  @MaxLength(50)
  confNo: string;

  @IsDateString()
  date: string;

  @IsString()
  @MaxLength(50)
  vendorNo: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  payment?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsDateString()
  reqDateFr?: string;

  @IsOptional()
  @IsDateString()
  reqDateTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  curCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  shipTo?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractDetailDto)
  details: ContractDetailDto[];
}
