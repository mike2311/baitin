import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  MinLength,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Create Item DTO
 *
 * Original Logic Reference:
 * - FoxPro Form: iitem.scx (Input Item Detail)
 * - Documentation: docs/source/02-business-processes/master-data-management.md lines 9-163
 * - Data Model: docs/source/01-data-architecture/table-details/master-data-tables.md lines 5-49
 *
 * Validation Rules:
 * - item_no must be unique (checked in service)
 * - price must be >= 0
 * - cost must be >= 0
 * - std_code must exist in zstdcode table (checked in service)
 * - origin must exist in zorigin table (checked in service)
 *
 * Reference: Task 01-01 - Item Entry Form
 */
export class CreateItemDto {
  @ApiProperty({
    description: 'Item number (Primary Key)',
    example: 'ITEM001',
  })
  @IsNotEmpty({ message: 'Item Number is required' })
  @IsString()
  @MinLength(1, { message: 'Item Number cannot be empty' })
  itemNo: string;

  @ApiPropertyOptional({
    description: 'Item type/category',
    example: 'PRODUCT',
  })
  @IsOptional()
  @IsString()
  itemType?: string;

  @ApiPropertyOptional({
    description: 'Item creation/update date',
    example: '2025-12-18',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Short item name',
    example: 'Sample Item',
  })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional({
    description: 'Full description (memo field)',
    example: 'This is a detailed description of the item',
  })
  @IsOptional()
  @IsString()
  desp?: string;

  @ApiPropertyOptional({
    description: 'Country of origin',
    example: 'CN',
  })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({
    description: 'Group/class code',
    example: 'GRP001',
  })
  @IsOptional()
  @IsString()
  grpCode?: string;

  @ApiPropertyOptional({
    description: 'Material description',
    example: 'Cotton',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    description: 'UPC barcode number',
    example: '123456789012',
  })
  @IsOptional()
  @IsString()
  upcNo?: string;

  @ApiPropertyOptional({
    description: 'HTC/Harmonized Tariff Code',
    example: '6109.10.00',
  })
  @IsOptional()
  @IsString()
  htcNo?: string;

  @ApiPropertyOptional({
    description: 'Standard code (links to zstdcode)',
    example: 'STD001',
  })
  @IsOptional()
  @IsString()
  stdCode?: string;

  @ApiPropertyOptional({
    description: 'Standard price',
    example: 19.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Price Must Be Positive' })
  price?: number;

  @ApiPropertyOptional({
    description: 'Price currency code',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  priceCur?: string;

  @ApiPropertyOptional({
    description: 'Cost',
    example: 10.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Cost Must Be Positive' })
  cost?: number;

  @ApiPropertyOptional({
    description: 'Pack pieces level 1',
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  packPc1?: number;

  @ApiPropertyOptional({
    description: 'Pack description level 1',
    example: 'Inner Pack',
  })
  @IsOptional()
  @IsString()
  packDesp1?: string;

  @ApiPropertyOptional({
    description: 'Pack pieces level 2',
    example: 24,
  })
  @IsOptional()
  @IsNumber()
  packPc2?: number;

  @ApiPropertyOptional({
    description: 'Pack description level 2',
    example: 'Master Carton',
  })
  @IsOptional()
  @IsString()
  packDesp2?: string;

  @ApiPropertyOptional({
    description: 'Pack pieces level 3',
    example: 48,
  })
  @IsOptional()
  @IsNumber()
  packPc3?: number;

  @ApiPropertyOptional({
    description: 'Pack description level 3',
    example: 'Pallet',
  })
  @IsOptional()
  @IsString()
  packDesp3?: string;

  @ApiPropertyOptional({
    description: 'Pack pieces level 4',
    example: 96,
  })
  @IsOptional()
  @IsNumber()
  packPc4?: number;

  @ApiPropertyOptional({
    description: 'Pack description level 4',
    example: 'Container',
  })
  @IsOptional()
  @IsString()
  packDesp4?: string;

  @ApiPropertyOptional({
    description: 'Weight',
    example: 1.5,
  })
  @IsOptional()
  @IsNumber()
  wt?: number;

  @ApiPropertyOptional({
    description: 'Net weight',
    example: 1.2,
  })
  @IsOptional()
  @IsNumber()
  net?: number;

  @ApiPropertyOptional({
    description: 'Cube measurement',
    example: 0.05,
  })
  @IsOptional()
  @IsNumber()
  cube?: number;

  @ApiPropertyOptional({
    description: 'Dimensions',
    example: '10x10x10',
  })
  @IsOptional()
  @IsString()
  dim?: string;

  @ApiPropertyOptional({
    description: 'Duty rate',
    example: 0.15,
  })
  @IsOptional()
  @IsNumber()
  duty?: number;
}
