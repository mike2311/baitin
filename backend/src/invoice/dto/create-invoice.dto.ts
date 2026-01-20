import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsPositive, IsArray, ValidateNested, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Create Invoice DTO
 *
 * Original Logic Reference:
 * - Legacy Form: iinvhd@
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - inv_no must be unique
 *   - cust_no validated against mcustom
 *   - oc_no validated if provided
 *   - Date range validation (both empty or both filled, To >= From)
 *
 * Reference: Phase 3 - Invoice Module
 */
export class InvoiceDetailDto {
  @IsNotEmpty()
  @IsString()
  itemNo: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  qty: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ctn?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  qctn?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  net?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  wt?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cube?: number;

  @IsOptional()
  @IsString()
  dim?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  despMemo?: string;

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
  @IsString()
  soNo?: string;

  @IsOptional()
  @IsBoolean()
  head?: boolean;
}

export class CreateInvoiceDto {
  @IsNotEmpty({ message: 'Invoice number is required' })
  @IsString()
  invNo: string;

  @IsNotEmpty({ message: 'Invoice date is required' })
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  custNo?: string;

  @IsOptional()
  @IsString()
  ocNo?: string;

  @IsOptional()
  @IsString()
  ship?: string;

  @IsOptional()
  @IsDateString()
  delDate?: string;

  @IsOptional()
  @IsString()
  loadingPort?: string;

  @IsOptional()
  @IsString()
  dest?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsDateString()
  invDtFrDate?: string; // Invoice date from (for container/ref selection)

  @IsOptional()
  @IsDateString()
  invDtToDate?: string; // Invoice date to (for container/ref selection)

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceDetailDto)
  details?: InvoiceDetailDto[]; // Optional - can be added via detail screen

  @IsOptional()
  @IsString()
  userId?: string;
}

/**
 * Create Invoice from SO/DN DTO
 *
 * Original Logic Reference:
 * - Legacy Form: iinvhd@ (create from SO/DN)
 * - Business Rules:
 *   - Select SO or DN to create invoice from
 *   - Copy items from source
 *   - Validate quantities
 */
export class CreateInvoiceFromSourceDto {
  @IsNotEmpty({ message: 'Invoice number is required' })
  @IsString()
  invNo: string;

  @IsNotEmpty({ message: 'Invoice date is required' })
  @IsDateString()
  date: string;

  @IsNotEmpty({ message: 'Source type is required' })
  @IsString()
  sourceType: 'so' | 'dn'; // Source type

  @IsNotEmpty({ message: 'Source number is required' })
  @IsString()
  sourceNo: string; // so_no or dn_no

  @IsOptional()
  @IsDateString()
  delDate?: string;

  @IsOptional()
  @IsString()
  ship?: string;

  @IsOptional()
  @IsString()
  loadingPort?: string;

  @IsOptional()
  @IsString()
  dest?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedItemNos?: string[]; // If not provided, all items included

  @IsOptional()
  @IsString()
  userId?: string;
}

/**
 * Select Invoice Items by Container/Ref DTO
 *
 * Original Logic Reference:
 * - Legacy Form: iinvdt2@ (container selection)
 * - Business Rules:
 *   - Select items by container number and ref_no
 *   - Date range filtering (inv_dt_fr_date, inv_dt_to_date)
 *   - Complex container/ref matching logic
 */
export class SelectInvoiceItemsByContainerDto {
  @IsNotEmpty()
  @IsString()
  invNo: string;

  @IsOptional()
  @IsString()
  cntrNo?: string; // Container number

  @IsOptional()
  @IsString()
  refNo?: string; // Reference number

  @IsOptional()
  @IsDateString()
  invDtFrDate?: string; // Invoice date from

  @IsOptional()
  @IsDateString()
  invDtToDate?: string; // Invoice date to

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedItemNos?: string[]; // Items to include
}