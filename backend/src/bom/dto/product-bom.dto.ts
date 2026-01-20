import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductBomDto {
  @IsString({ message: 'Item Number must be a string' })
  @IsNotEmpty({ message: 'Item Number is required' })
  @MaxLength(50, { message: 'Item Number cannot exceed 50 characters' })
  itemNo: string;

  @IsString({ message: 'Sub Item Number must be a string' })
  @IsNotEmpty({ message: 'Sub Item Number is required' })
  @MaxLength(50, { message: 'Sub Item Number cannot exceed 50 characters' })
  subItemNo: string;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsNotEmpty({ message: 'Quantity is required' })
  @Min(0.0001, { message: 'Quantity must be greater than 0' })
  qty: number;

  @IsOptional()
  @IsString({ message: 'Unit must be a string' })
  @MaxLength(20, { message: 'Unit cannot exceed 20 characters' })
  unit?: string;
}

export class UpdateProductBomDto {
  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0.0001, { message: 'Quantity must be greater than 0' })
  qty?: number;

  @IsOptional()
  @IsString({ message: 'Unit must be a string' })
  @MaxLength(20, { message: 'Unit cannot exceed 20 characters' })
  unit?: string;
}
