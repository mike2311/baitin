import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeliveryNoteService } from './delivery-note.service';
import { CreateDeliveryNoteDto, CreateDeliveryNoteFromSoDto } from './dto/create-delivery-note.dto';
import { UpdateDeliveryNoteDto } from './dto/update-delivery-note.dto';
import { DeliveryNoteSearchResponseDto } from './dto/delivery-note-search-response.dto';
import { DeliveryNoteHeader } from './entities/delivery-note-header.entity';

/**
 * Delivery Note Controller
 *
 * Original Logic Reference:
 * - Legacy Forms: idn, idnbrk
 * - Documentation: docs/source/04-forms-and-screens/delivery-note-forms.md
 * - Business Rules:
 *   - REST API for DN CRUD operations
 *   - Support for creating DN from SO
 *   - Search and filter functionality
 *   - Status management
 *
 * Reference: Phase 3 - Delivery Note Module
 */
@ApiTags('Delivery Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery-notes')
export class DeliveryNoteController {
  constructor(private readonly deliveryNoteService: DeliveryNoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a delivery note' })
  @ApiResponse({
    status: 201,
    description: 'Delivery note created successfully',
    type: DeliveryNoteHeader,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Delivery note already exists' })
  create(@Body() createDeliveryNoteDto: CreateDeliveryNoteDto) {
    return this.deliveryNoteService.create(createDeliveryNoteDto);
  }

  @Post('from-so')
  @ApiOperation({ summary: 'Create delivery note from Shipping Order' })
  @ApiResponse({
    status: 201,
    description: 'Delivery note created successfully',
    type: DeliveryNoteHeader,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid items or quantities' })
  createFromSo(@Body() createFromSoDto: CreateDeliveryNoteFromSoDto) {
    return this.deliveryNoteService.createFromSo(createFromSoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search delivery notes' })
  @ApiResponse({
    status: 200,
    description: 'Delivery notes retrieved successfully',
    type: [DeliveryNoteSearchResponseDto],
  })
  @ApiQuery({ name: 'dnNo', required: false, description: 'DN number filter' })
  @ApiQuery({ name: 'custNo', required: false, description: 'Customer number filter' })
  @ApiQuery({ name: 'soNo', required: false, description: 'Shipping order number filter' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Date from (ISO date)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Date to (ISO date)' })
  @ApiQuery({ name: 'loadingStatus', required: false, description: 'Loading status filter' })
  search(
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
    return this.deliveryNoteService.search(query);
  }

  @Get('available-items/:soNo')
  @ApiOperation({ summary: 'Get available items for DN creation from SO' })
  @ApiResponse({
    status: 200,
    description: 'Available items retrieved successfully',
  })
  @ApiParam({ name: 'soNo', description: 'Shipping Order number' })
  getAvailableItemsForDn(@Param('soNo') soNo: string) {
    return this.deliveryNoteService.getAvailableItemsForDn(soNo);
  }

  @Get(':dnNo')
  @ApiOperation({ summary: 'Get delivery note by DN number' })
  @ApiResponse({
    status: 200,
    description: 'Delivery note retrieved successfully',
    type: DeliveryNoteHeader,
  })
  @ApiResponse({ status: 404, description: 'Delivery note not found' })
  @ApiParam({ name: 'dnNo', description: 'Delivery Note number' })
  findOne(@Param('dnNo') dnNo: string) {
    return this.deliveryNoteService.findOne(dnNo);
  }

  @Put(':dnNo')
  @ApiOperation({ summary: 'Update delivery note' })
  @ApiResponse({
    status: 200,
    description: 'Delivery note updated successfully',
    type: DeliveryNoteHeader,
  })
  @ApiResponse({ status: 404, description: 'Delivery note not found' })
  @ApiParam({ name: 'dnNo', description: 'Delivery Note number' })
  update(
    @Param('dnNo') dnNo: string,
    @Body() updateDeliveryNoteDto: UpdateDeliveryNoteDto,
  ) {
    return this.deliveryNoteService.update(dnNo, updateDeliveryNoteDto);
  }

  @Patch(':dnNo/status')
  @ApiOperation({ summary: 'Update delivery note status' })
  @ApiResponse({
    status: 200,
    description: 'Delivery note status updated successfully',
    type: DeliveryNoteHeader,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiParam({ name: 'dnNo', description: 'Delivery Note number' })
  updateStatus(
    @Param('dnNo') dnNo: string,
    @Body('status') status: string,
  ) {
    return this.deliveryNoteService.updateStatus(dnNo, status);
  }

  @Delete(':dnNo')
  @ApiOperation({ summary: 'Delete delivery note' })
  @ApiResponse({ status: 200, description: 'Delivery note deleted successfully' })
  @ApiResponse({ status: 404, description: 'Delivery note not found' })
  @ApiParam({ name: 'dnNo', description: 'Delivery Note number' })
  remove(@Param('dnNo') dnNo: string) {
    return this.deliveryNoteService.remove(dnNo);
  }
}