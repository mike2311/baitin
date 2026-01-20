import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoiceService } from './invoice.service';
import {
  CreateInvoiceDto,
  CreateInvoiceFromSourceDto,
  SelectInvoiceItemsByContainerDto,
} from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceSearchResponseDto } from './dto/invoice-search-response.dto';
import { InvoiceHeader } from './entities/invoice-header.entity';

/**
 * Invoice Controller
 *
 * Original Logic Reference:
 * - Legacy Forms: iinvhd@, iinvdt2@
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - REST API for invoice CRUD operations
 *   - Support for creating invoice from SO/DN
 *   - Container/ref-driven item selection
 *   - Search and filter functionality
 *
 * Reference: Phase 3 - Invoice Module
 */
@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create an invoice' })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
    type: InvoiceHeader,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Invoice already exists' })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Post('from-source')
  @ApiOperation({ summary: 'Create invoice from SO or DN' })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
    type: InvoiceHeader,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid items or quantities',
  })
  createFromSource(@Body() createFromSourceDto: CreateInvoiceFromSourceDto) {
    return this.invoiceService.createFromSource(createFromSourceDto);
  }

  @Post('select-items-by-container')
  @ApiOperation({ summary: 'Select invoice items by container/ref' })
  @ApiResponse({
    status: 201,
    description: 'Invoice items selected successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  selectItemsByContainer(@Body() selectDto: SelectInvoiceItemsByContainerDto) {
    return this.invoiceService.selectItemsByContainer(selectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search invoices' })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
    type: [InvoiceSearchResponseDto],
  })
  @ApiQuery({
    name: 'invNo',
    required: false,
    description: 'Invoice number filter',
  })
  @ApiQuery({
    name: 'custNo',
    required: false,
    description: 'Customer number filter',
  })
  @ApiQuery({
    name: 'ocNo',
    required: false,
    description: 'Order confirmation number filter',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Date from (ISO date)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Date to (ISO date)',
  })
  search(
    @Query('invNo') invNo?: string,
    @Query('custNo') custNo?: string,
    @Query('ocNo') ocNo?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const query = {
      invNo,
      custNo,
      ocNo,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };
    return this.invoiceService.search(query);
  }

  @Get('available-items/:sourceType/:sourceNo')
  @ApiOperation({
    summary: 'Get available items for invoice creation from SO or DN',
  })
  @ApiResponse({
    status: 200,
    description: 'Available items retrieved successfully',
  })
  @ApiParam({
    name: 'sourceType',
    enum: ['so', 'dn'],
    description: 'Source type',
  })
  @ApiParam({ name: 'sourceNo', description: 'Source number (so_no or dn_no)' })
  @ApiQuery({
    name: 'cntrNo',
    required: false,
    description: 'Container number filter',
  })
  @ApiQuery({
    name: 'refNo',
    required: false,
    description: 'Reference number filter',
  })
  getAvailableItemsForInvoice(
    @Param('sourceType') sourceType: 'so' | 'dn',
    @Param('sourceNo') sourceNo: string,
    @Query('cntrNo') cntrNo?: string,
    @Query('refNo') refNo?: string,
  ) {
    return this.invoiceService.getAvailableItemsForInvoice(
      sourceType,
      sourceNo,
      cntrNo,
      refNo,
    );
  }

  @Get('container-ref-selection/:invNo')
  @ApiOperation({ summary: 'Get container/ref selection options' })
  @ApiResponse({
    status: 200,
    description: 'Container/ref options retrieved successfully',
  })
  @ApiParam({ name: 'invNo', description: 'Invoice number' })
  @ApiQuery({
    name: 'invDtFrDate',
    required: false,
    description: 'Invoice date from (ISO date)',
  })
  @ApiQuery({
    name: 'invDtToDate',
    required: false,
    description: 'Invoice date to (ISO date)',
  })
  getContainerRefSelection(
    @Param('invNo') invNo: string,
    @Query('invDtFrDate') invDtFrDate?: string,
    @Query('invDtToDate') invDtToDate?: string,
  ) {
    return this.invoiceService.getContainerRefSelection(
      invNo,
      invDtFrDate,
      invDtToDate,
    );
  }

  @Get(':invNo')
  @ApiOperation({ summary: 'Get invoice by invoice number' })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully',
    type: InvoiceHeader,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiParam({ name: 'invNo', description: 'Invoice number' })
  findOne(@Param('invNo') invNo: string) {
    return this.invoiceService.findOne(invNo);
  }

  @Put(':invNo')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully',
    type: InvoiceHeader,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiParam({ name: 'invNo', description: 'Invoice number' })
  update(
    @Param('invNo') invNo: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.update(invNo, updateInvoiceDto);
  }

  @Delete(':invNo')
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiParam({ name: 'invNo', description: 'Invoice number' })
  remove(@Param('invNo') invNo: string) {
    return this.invoiceService.remove(invNo);
  }
}
