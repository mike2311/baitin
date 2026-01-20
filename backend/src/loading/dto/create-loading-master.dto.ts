import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsPositive,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Create Loading Master DTO
 *
 * Original Logic Reference:
 * - Legacy Forms: iload, isetla
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - loading_no must be unique
 *   - date required
 *   - Can include multiple DNs
 *
 * Reference: Phase 3 - Loading Module
 */
export class CreateLoadingMasterDto {
  @IsNotEmpty({ message: 'Loading number is required' })
  @IsString()
  loadingNo: string;

  @IsNotEmpty({ message: 'Loading date is required' })
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  vesselName?: string;

  @IsOptional()
  @IsString()
  voyageNo?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalWeight?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalCube?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCartons?: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dnNos?: string[]; // DNs to include in loading

  @IsOptional()
  @IsString()
  userId?: string;
}

/**
 * Create Loading Advice DTO
 *
 * Original Logic Reference:
 * - Legacy Form: isetla
 * - Business Rules:
 *   - Generated from loading master
 *   - Contains item-level loading details
 */
export class LoadingAdviceDetailDto {
  @IsNotEmpty()
  @IsString()
  itemNo: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  qty: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ctn?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cube?: number;

  @IsOptional()
  @IsString()
  containerNo?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateLoadingAdviceDto {
  @IsNotEmpty({ message: 'Loading Advice number is required' })
  @IsString()
  laNo: string;

  @IsNotEmpty({ message: 'Loading Advice date is required' })
  @IsDateString()
  date: string;

  @IsNotEmpty({ message: 'Loading master number is required' })
  @IsString()
  loadingNo: string;

  @IsOptional()
  @IsString()
  vesselName?: string;

  @IsOptional()
  @IsString()
  voyageNo?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsNotEmpty({ message: 'At least one detail item is required' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoadingAdviceDetailDto)
  details: LoadingAdviceDetailDto[];

  @IsOptional()
  @IsString()
  userId?: string;
}
