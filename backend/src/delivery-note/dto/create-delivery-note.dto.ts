import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsPositive, IsArray, ValidateNested, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Create Delivery Note DTO
 *
 * Original Logic Reference:
 * - Legacy Form: idn
 * - Documentation: docs/source/04-forms-and-screens/delivery-note-forms.md
 * - Business Rules:
 *   - dn_no must be unique
 *   - so_no required if creating from SO
 *   - cust_no validated against mcustom
 *   - Items validated against SO quantities
 *
 * Reference: Phase 3 - Delivery Note Module
 */
export class DeliveryNoteDetailDto {
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
  qctn?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  poNo?: string;

  @IsOptional()
  @IsString()
  shipNo?: string;

  @IsOptional()
  @IsString()
  cntrNo?: string;

  @IsOptional()
  @IsString()
  refNo?: string;

  @IsOptional()
  @IsString()
  ocNo?: string;

  @IsOptional()
  @IsString()
  confNo?: string;

  @IsOptional()
  @IsBoolean()
  head?: boolean;
}

export class DeliveryNoteBreakdownDto {
  @IsNotEmpty()
  @IsString()
  itemNo: string;

  @IsNotEmpty()
  @IsString()
  port: string;

  @IsNotEmpty()
  @IsString()
  poNo: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  qty?: number;

  @IsOptional()
  @IsDateString()
  delFrom?: string;

  @IsOptional()
  @IsDateString()
  delTo?: string;
}

export class CreateDeliveryNoteDto {
  @IsNotEmpty({ message: 'DN number is required' })
  @IsString()
  dnNo: string;

  @IsNotEmpty({ message: 'DN date is required' })
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  custNo?: string;

  @IsOptional()
  @IsString()
  soNo?: string; // Required if creating from SO

  @IsOptional()
  @IsString()
  delAddr1?: string;

  @IsOptional()
  @IsString()
  delAddr2?: string;

  @IsOptional()
  @IsString()
  delAddr3?: string;

  @IsOptional()
  @IsString()
  delAddr4?: string;

  @IsOptional()
  @IsDateString()
  delDate?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsNotEmpty({ message: 'At least one detail item is required' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryNoteDetailDto)
  details: DeliveryNoteDetailDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryNoteBreakdownDto)
  breakdowns?: DeliveryNoteBreakdownDto[];

  @IsOptional()
  @IsString()
  userId?: string;
}

/**
 * Create DN from SO DTO
 *
 * Original Logic Reference:
 * - Legacy Form: idn (create from SO)
 * - Business Rules:
 *   - Select SO to create DN from
 *   - Copy items from SO
 *   - Copy breakdowns from OE if available
 */
export class CreateDeliveryNoteFromSoDto {
  @IsNotEmpty({ message: 'DN number is required' })
  @IsString()
  dnNo: string;

  @IsNotEmpty({ message: 'DN date is required' })
  @IsDateString()
  date: string;

  @IsNotEmpty({ message: 'SO number is required' })
  @IsString()
  soNo: string;

  @IsOptional()
  @IsString()
  delAddr1?: string;

  @IsOptional()
  @IsString()
  delAddr2?: string;

  @IsOptional()
  @IsString()
  delAddr3?: string;

  @IsOptional()
  @IsString()
  delAddr4?: string;

  @IsOptional()
  @IsDateString()
  delDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedItemNos?: string[]; // If not provided, all SO items included

  @IsOptional()
  @IsBoolean()
  copyBreakdowns?: boolean; // Copy breakdowns from OE if available

  @IsOptional()
  @IsString()
  userId?: string;
}