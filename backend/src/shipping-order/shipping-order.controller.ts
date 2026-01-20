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
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { ShippingOrderService } from './shipping-order.service';
import {
  CreateShippingOrderDto,
  CreateShippingOrderFromSourceDto,
} from './dto/create-shipping-order.dto';
import { UpdateShippingOrderDto } from './dto/update-shipping-order.dto';
import { ShippingOrderSearchResponseDto } from './dto/shipping-order-search-response.dto';
import { ShippingOrder } from './entities/shipping-order.entity';

/**
 * Shipping Order Controller
 *
 * Original Logic Reference:
 * - Legacy Forms: isetso, pso
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - REST API for SO CRUD operations
 *   - Support for creating SO from OC/Contract
 *   - Search and filter functionality
 *   - Format configuration access
 *
 * Reference: Phase 3 - Shipping Order Module
 */
@ApiTags('Shipping Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shipping-orders')
export class ShippingOrderController {
  constructor(private readonly shippingOrderService: ShippingOrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a shipping order record' })
  @ApiResponse({
    status: 201,
    description: 'Shipping order created successfully',
    type: ShippingOrder,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Shipping order already exists' })
  create(@Body() createShippingOrderDto: CreateShippingOrderDto) {
    return this.shippingOrderService.create(createShippingOrderDto);
  }

  @Post('from-source')
  @ApiOperation({ summary: 'Create shipping orders from OC or Contract' })
  @ApiResponse({
    status: 201,
    description: 'Shipping orders created successfully',
    type: [ShippingOrder],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid items or quantities',
  })
  createFromSource(
    @Body() createFromSourceDto: CreateShippingOrderFromSourceDto,
  ) {
    return this.shippingOrderService.createFromSource(createFromSourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search shipping orders' })
  @ApiResponse({
    status: 200,
    description: 'Shipping orders retrieved successfully',
    type: [ShippingOrderSearchResponseDto],
  })
  @ApiQuery({ name: 'soNo', required: false, description: 'SO number filter' })
  @ApiQuery({
    name: 'confNo',
    required: false,
    description: 'Order confirmation number filter',
  })
  @ApiQuery({
    name: 'contNo',
    required: false,
    description: 'Contract number filter',
  })
  @ApiQuery({
    name: 'itemNo',
    required: false,
    description: 'Item number filter',
  })
  @ApiQuery({
    name: 'shipDateFrom',
    required: false,
    description: 'Ship date from (ISO date)',
  })
  @ApiQuery({
    name: 'shipDateTo',
    required: false,
    description: 'Ship date to (ISO date)',
  })
  search(
    @Query('soNo') soNo?: string,
    @Query('confNo') confNo?: string,
    @Query('contNo') contNo?: string,
    @Query('itemNo') itemNo?: string,
    @Query('shipDateFrom') shipDateFrom?: string,
    @Query('shipDateTo') shipDateTo?: string,
  ) {
    const query = {
      soNo,
      confNo,
      contNo,
      itemNo,
      shipDateFrom: shipDateFrom ? new Date(shipDateFrom) : undefined,
      shipDateTo: shipDateTo ? new Date(shipDateTo) : undefined,
    };
    return this.shippingOrderService.search(query);
  }

  @Get('available-items/:sourceType/:sourceNo')
  @ApiOperation({
    summary: 'Get available items for SO creation from OC or Contract',
  })
  @ApiResponse({
    status: 200,
    description: 'Available items retrieved successfully',
  })
  @ApiParam({
    name: 'sourceType',
    enum: ['oc', 'contract'],
    description: 'Source type',
  })
  @ApiParam({
    name: 'sourceNo',
    description: 'Source number (conf_no or cont_no)',
  })
  getAvailableItemsForSo(
    @Param('sourceType') sourceType: 'oc' | 'contract',
    @Param('sourceNo') sourceNo: string,
  ) {
    return this.shippingOrderService.getAvailableItemsForSo(
      sourceType,
      sourceNo,
    );
  }

  @Get(':soNo')
  @ApiOperation({ summary: 'Get shipping order by SO number' })
  @ApiResponse({
    status: 200,
    description: 'Shipping order retrieved successfully',
    type: ShippingOrder,
  })
  @ApiResponse({ status: 404, description: 'Shipping order not found' })
  @ApiParam({ name: 'soNo', description: 'Shipping order number' })
  findOne(@Param('soNo') soNo: string) {
    return this.shippingOrderService.findOne(soNo);
  }

  @Put(':soNo')
  @AuditLog('UPDATE_SHIPPING_ORDER')
  @ApiOperation({ summary: 'Update shipping order' })
  @ApiResponse({
    status: 200,
    description: 'Shipping order updated successfully',
    type: ShippingOrder,
  })
  @ApiResponse({ status: 404, description: 'Shipping order not found' })
  @ApiParam({ name: 'soNo', description: 'Shipping order number' })
  update(
    @Param('soNo') soNo: string,
    @Body() updateShippingOrderDto: UpdateShippingOrderDto,
  ) {
    return this.shippingOrderService.update(soNo, updateShippingOrderDto);
  }

  @Delete(':soNo')
  @AuditLog('DELETE_SHIPPING_ORDER')
  @ApiOperation({ summary: 'Delete shipping order' })
  @ApiResponse({
    status: 200,
    description: 'Shipping order deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Shipping order not found' })
  @ApiParam({ name: 'soNo', description: 'Shipping order number' })
  remove(@Param('soNo') soNo: string) {
    return this.shippingOrderService.remove(soNo);
  }

  @Get('format/:soKey')
  @ApiOperation({ summary: 'Get SO format configuration' })
  @ApiResponse({
    status: 200,
    description: 'SO format retrieved successfully',
  })
  @ApiParam({ name: 'soKey', description: 'SO format key (e.g., "GLOBE")' })
  getSoFormat(@Param('soKey') soKey: string) {
    return this.shippingOrderService.getSoFormat(soKey);
  }
}
