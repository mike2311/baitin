import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoiceValidationService } from './invoice-validation.service';
import { ValidateInvoiceItemDto, ValidateInvoiceDateRangeDto } from './dto/validate-invoice-item.dto';
import { InvoiceItemValidationResult, InvoiceDateRangeValidationResult } from './dto/validate-invoice-item.dto';

/**
 * Invoice Validation Controller
 *
 * Original Logic Reference:
 * - Legacy Form: iinvdt2@ (validation methods)
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - REST API for invoice validation
 *   - Returns validation results with override requirements
 *
 * Reference: Phase 3 - Invoice Module
 */
@ApiTags('Invoice Validation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices/validation')
export class InvoiceValidationController {
  constructor(private readonly validationService: InvoiceValidationService) {}

  @Post('item-qty')
  @ApiOperation({ summary: 'Validate invoice item quantity against SO' })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    type: InvoiceItemValidationResult,
  })
  validateItemQty(@Body() validateDto: ValidateInvoiceItemDto) {
    return this.validationService.validateInvoiceItemQty(validateDto);
  }

  @Post('item-carton')
  @ApiOperation({ summary: 'Validate invoice item carton against SO' })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    type: InvoiceItemValidationResult,
  })
  validateItemCarton(@Body() validateDto: ValidateInvoiceItemDto) {
    return this.validationService.validateInvoiceItemCarton(validateDto);
  }

  @Post('date-range')
  @ApiOperation({ summary: 'Validate invoice date range' })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    type: InvoiceDateRangeValidationResult,
  })
  validateDateRange(@Body() validateDto: ValidateInvoiceDateRangeDto) {
    return this.validationService.validateInvoiceDateRange(validateDto);
  }

  @Post('item-with-override')
  @ApiOperation({ summary: 'Validate invoice item with override confirmation' })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    type: InvoiceItemValidationResult,
  })
  validateItemWithOverride(
    @Body('validateDto') validateDto: ValidateInvoiceItemDto,
    @Body('overrideConfirmed') overrideConfirmed: boolean = false,
  ) {
    return this.validationService.validateInvoiceItemWithOverride(validateDto, overrideConfirmed);
  }
}