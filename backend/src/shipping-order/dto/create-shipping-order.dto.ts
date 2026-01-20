import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsPositive, Min } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Create Shipping Order DTO
 *
 * Original Logic Reference:
 * - Legacy Form: isetso
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - so_no must be unique
 *   - conf_no or cont_no required
 *   - item_no must exist in mitem
 *   - qty > 0
 *   - ship_date optional but validated if provided
 *
 * Reference: Phase 3 - Shipping Order Module
 */
export class CreateShippingOrderDto {
  @IsNotEmpty({ message: 'SO number is required' })
  @IsString()
  soNo: string;

  @IsOptional()
  @IsString()
  confNo?: string; // Order Confirmation number

  @IsOptional()
  @IsString()
  contNo?: string; // Contract number

  @IsNotEmpty({ message: 'Item number is required' })
  @IsString()
  itemNo: string;

  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  qty: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  ctn?: number; // Carton quantity

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  @IsDateString()
  shipDate?: string; // Shipping date

  @IsOptional()
  @IsString()
  shipMark?: string; // Shipping mark

  @IsOptional()
  @IsString()
  fobPort?: string; // FOB port

  @IsOptional()
  @IsString()
  poNo?: string; // Purchase Order number

  @IsOptional()
  @IsString()
  ocNo?: string; // Order Confirmation number

  @IsOptional()
  @IsString()
  shipTo?: string; // Ship to location

  @IsOptional()
  @IsString()
  loadingPort?: string; // Loading port

  @IsOptional()
  @IsString()
  dest?: string; // Destination

  @IsOptional()
  @IsString()
  remarks?: string; // Remarks

  @IsOptional()
  @IsString()
  userId?: string; // User ID
}

/**
 * Create SO from OC/Contract DTO
 *
 * Original Logic Reference:
 * - Legacy Form: isetso (ugrid method)
 * - Business Rules:
 *   - Select items from OC/Contract
 *   - Validate available quantities
 *   - Create SO records automatically
 */
export class CreateShippingOrderFromSourceDto {
  @IsNotEmpty({ message: 'SO number is required' })
  @IsString()
  soNo: string;

  @IsNotEmpty({ message: 'Source type is required' })
  @IsString()
  sourceType: 'oc' | 'contract'; // Source type

  @IsNotEmpty({ message: 'Source number is required' })
  @IsString()
  sourceNo: string; // conf_no or cont_no

  @IsNotEmpty({ message: 'Selected items are required' })
  selectedItems: Array<{
    itemNo: string;
    qty: number;
    ctn?: number;
    poNo?: string;
    shipDate?: string;
  }>;

  @IsOptional()
  @IsString()
  userId?: string; // User ID
}