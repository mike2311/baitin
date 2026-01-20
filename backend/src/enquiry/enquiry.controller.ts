import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnquiryService } from './enquiry.service';
import {
  SalesAnalysisResponseDto,
  ItemEnquiryResponseDto,
  SoEnquiryResponseDto,
  DnEnquiryResponseDto,
  InvoiceEnquiryResponseDto,
} from './dto/enquiry-response.dto';

/**
 * Enquiry Controller
 *
 * Original Logic Reference:
 * - Legacy Forms: Various enquiry forms (40+ enquiry forms)
 * - Documentation: docs/source/04-forms-and-screens/enquiry-forms.md
 * - Business Rules:
 *   - REST API for read-only enquiries
 *   - Various filters and aggregations
 *   - Sales analysis support
 *
 * Reference: Phase 3 - Enquiry Module
 */
@ApiTags('Enquiries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enquiries')
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  @Get('sales-analysis')
  @ApiOperation({ summary: 'Sales analysis enquiry' })
  @ApiResponse({
    status: 200,
    description: 'Sales analysis retrieved successfully',
    type: [SalesAnalysisResponseDto],
  })
  @ApiQuery({ name: 'custNo', required: false, description: 'Customer number filter' })
  @ApiQuery({ name: 'itemNo', required: false, description: 'Item number filter' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Date from (ISO date)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Date to (ISO date)' })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['customer', 'item', 'date'], description: 'Group by option' })
  salesAnalysis(
    @Query('custNo') custNo?: string,
    @Query('itemNo') itemNo?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('groupBy') groupBy?: 'customer' | 'item' | 'date',
  ) {
    const query = {
      custNo,
      itemNo,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      groupBy: groupBy || 'date',
    };
    return this.enquiryService.salesAnalysis(query);
  }

  @Get('item')
  @ApiOperation({ summary: 'Item enquiry' })
  @ApiResponse({
    status: 200,
    description: 'Item enquiry retrieved successfully',
    type: [ItemEnquiryResponseDto],
  })
  @ApiQuery({ name: 'itemNo', required: false, description: 'Item number filter' })
  @ApiQuery({ name: 'itemDescription', required: false, description: 'Item description filter' })
  @ApiQuery({ name: 'includeHistory', required: false, description: 'Include order/invoice history' })
  itemEnquiry(
    @Query('itemNo') itemNo?: string,
    @Query('itemDescription') itemDescription?: string,
    @Query('includeHistory') includeHistory?: boolean,
  ) {
    const query = {
      itemNo,
      itemDescription,
      includeHistory: includeHistory === true,
    };
    return this.enquiryService.itemEnquiry(query);
  }

  @Get('so')
  @ApiOperation({ summary: 'Shipping Order enquiry' })
  @ApiResponse({
    status: 200,
    description: 'SO enquiry retrieved successfully',
    type: [SoEnquiryResponseDto],
  })
  @ApiQuery({ name: 'soNo', required: false, description: 'SO number filter' })
  @ApiQuery({ name: 'custNo', required: false, description: 'Customer number filter' })
  @ApiQuery({ name: 'itemNo', required: false, description: 'Item number filter' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Date from (ISO date)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Date to (ISO date)' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter' })
  soEnquiry(
    @Query('soNo') soNo?: string,
    @Query('custNo') custNo?: string,
    @Query('itemNo') itemNo?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
  ) {
    const query = {
      soNo,
      custNo,
      itemNo,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      status,
    };
    return this.enquiryService.soEnquiry(query);
  }

  @Get('dn')
  @ApiOperation({ summary: 'Delivery Note enquiry' })
  @ApiResponse({
    status: 200,
    description: 'DN enquiry retrieved successfully',
    type: [DnEnquiryResponseDto],
  })
  @ApiQuery({ name: 'dnNo', required: false, description: 'DN number filter' })
  @ApiQuery({ name: 'custNo', required: false, description: 'Customer number filter' })
  @ApiQuery({ name: 'soNo', required: false, description: 'SO number filter' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Date from (ISO date)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Date to (ISO date)' })
  @ApiQuery({ name: 'loadingStatus', required: false, description: 'Loading status filter' })
  dnEnquiry(
    @Query('dnNo') dnNo?: string,
    @Query('custNo') custNo?: string,
    @Query('soNo') soNo?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('loadingStatus') loadingStatus?: string,
  ) {
    const query = {
      dnNo,
      custNo,
      soNo,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      loadingStatus,
    };
    return this.enquiryService.dnEnquiry(query);
  }

  @Get('invoice')
  @ApiOperation({ summary: 'Invoice enquiry' })
  @ApiResponse({
    status: 200,
    description: 'Invoice enquiry retrieved successfully',
    type: [InvoiceEnquiryResponseDto],
  })
  @ApiQuery({ name: 'invNo', required: false, description: 'Invoice number filter' })
  @ApiQuery({ name: 'custNo', required: false, description: 'Customer number filter' })
  @ApiQuery({ name: 'ocNo', required: false, description: 'Order confirmation number filter' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Date from (ISO date)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Date to (ISO date)' })
  invoiceEnquiry(
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
    return this.enquiryService.invoiceEnquiry(query);
  }
}