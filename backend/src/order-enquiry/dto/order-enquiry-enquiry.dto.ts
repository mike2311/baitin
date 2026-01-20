import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Order Enquiry Enquiry DTO
 *
 * Search parameters for OE Enquiry List.
 *
 * Reference: Task 03-02 - OE Search and Filter
 */
export class OrderEnquiryEnquiryDto {
  @ApiPropertyOptional({
    description: 'Search by OE Number (contains)',
    example: 'OE-001',
  })
  @IsOptional()
  @IsString()
  oeNo?: string;

  @ApiPropertyOptional({
    description: 'Search by Customer Number',
    example: 'CUST001',
  })
  @IsOptional()
  @IsString()
  custNo?: string;

  @ApiPropertyOptional({
    description: 'Search from date',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date From must be a valid date' })
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Search to date',
    example: '2026-01-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date To must be a valid date' })
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (0=Draft, 1=Posted)',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({
    description: 'Limit number of results',
    example: 200,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}
