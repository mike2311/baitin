import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderEnquiryControlService } from './order-enquiry-control.service';
import {
  CreateOrderEnquiryControlDto,
  UpdateOrderEnquiryControlDto,
  OrderEnquiryControlSearchDto,
} from './dto/order-enquiry-control.dto';

/**
 * Order Enquiry Control Controller
 *
 * Implements REST API endpoints for OE Control management.
 *
 * Original Logic Reference:
 * - Legacy Table: moectrl (DBF)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md lines 44-69
 * - Business Rule: OE Control must exist before OE creation (except INSP company)
 *
 * Reference: Task 01-01 - OE Control Entry Form
 */
@ApiTags('order-enquiry-control')
@Controller('order-enquiry/control')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderEnquiryControlController {
  constructor(
    private readonly controlService: OrderEnquiryControlService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new OE Control record' })
  @ApiResponse({
    status: 201,
    description: 'OE Control created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async create(
    @Body() createDto: CreateOrderEnquiryControlDto,
    @Request() req,
  ) {
    const userId = req.user?.username || req.user?.userId || 'system';
    return await this.controlService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Search OE Control records' })
  @ApiResponse({
    status: 200,
    description: 'List of OE Control records',
  })
  async search(@Query() searchDto: OrderEnquiryControlSearchDto) {
    return await this.controlService.search(searchDto);
  }

  @Get(':oeNo')
  @ApiOperation({ summary: 'Get OE Control by OE Number' })
  @ApiParam({
    name: 'oeNo',
    description: 'Order Enquiry Number',
  })
  @ApiResponse({
    status: 200,
    description: 'OE Control record',
  })
  @ApiResponse({
    status: 404,
    description: 'OE Control not found',
  })
  async findOne(@Param('oeNo') oeNo: string) {
    return await this.controlService.findOne(oeNo);
  }

  @Put(':oeNo')
  @ApiOperation({ summary: 'Update OE Control record' })
  @ApiParam({
    name: 'oeNo',
    description: 'Order Enquiry Number',
  })
  @ApiResponse({
    status: 200,
    description: 'OE Control updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'OE Control not found',
  })
  async update(
    @Param('oeNo') oeNo: string,
    @Body() updateDto: UpdateOrderEnquiryControlDto,
    @Request() req,
  ) {
    const userId = req.user?.username || req.user?.userId || 'system';
    return await this.controlService.update(oeNo, updateDto, userId);
  }

  @Delete(':oeNo')
  @ApiOperation({ summary: 'Delete OE Control record' })
  @ApiParam({
    name: 'oeNo',
    description: 'Order Enquiry Number',
  })
  @ApiResponse({
    status: 200,
    description: 'OE Control deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'OE Control not found',
  })
  async remove(@Param('oeNo') oeNo: string) {
    await this.controlService.remove(oeNo);
    return { message: 'OE Control deleted successfully' };
  }
}
