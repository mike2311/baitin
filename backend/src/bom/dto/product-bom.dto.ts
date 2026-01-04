import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductBomDto {
  @IsString()
  @MaxLength(50)
  itemNo: string;

  @IsString()
  @MaxLength(50)
  subItemNo: string;

  @IsNumber()
  @Min(0.0001)
  qty: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;
}

export class UpdateProductBomDto {
  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  qty?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;
}
