import {
  Controller,
  Get,
  Post,
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
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderEnquiryService } from './order-enquiry.service';
import { UpsertOrderEnquiryDto } from './dto/order-enquiry.dto';
import { OrderEnquiryEnquiryDto } from './dto/order-enquiry-enquiry.dto';

/**
 * Order Enquiry Controller
 *
 * Implements REST API endpoints for OE Entry management.
 *
 * Original Logic Reference:
 * - Legacy Tables: moehd (OE Header), moe (OE Detail)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md
 * - Business Rule: OE Control must exist before OE creation (except INSP company)
 *
 * Reference: Task 02-01 - OE Header Form, Task 02-02 - OE Detail Grid
 */
@ApiTags('order-enquiry')
@Controller('order-enquiry')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderEnquiryController {
  constructor(private readonly oeService: OrderEnquiryService) {}

  @Get('enquiry')
  @ApiOperation({ summary: 'Search Order Enquiries' })
  @ApiQuery({
    name: 'oeNo',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'custNo',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of Order Enquiries with aggregated data',
  })
  async enquiry(@Query() query: OrderEnquiryEnquiryDto) {
    return await this.oeService.enquiry({
      oeNo: query.oeNo,
      custNo: query.custNo,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      status: query.status,
      limit: query.limit,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create or update Order Enquiry' })
  @ApiResponse({
    status: 201,
    description: 'Order Enquiry created/updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async upsert(@Body() dto: UpsertOrderEnquiryDto, @Request() req) {
    const userId = req.user?.username || req.user?.userId || 'system';
    return await this.oeService.upsert(dto, userId);
  }

  @Get(':oeNo')
  @ApiOperation({ summary: 'Get Order Enquiry by OE Number' })
  @ApiParam({
    name: 'oeNo',
    description: 'Order Enquiry Number',
  })
  @ApiResponse({
    status: 200,
    description: 'Order Enquiry record with details',
  })
  @ApiResponse({
    status: 404,
    description: 'Order Enquiry not found',
  })
  async findOne(@Param('oeNo') oeNo: string) {
    return await this.oeService.get(oeNo);
  }

  @Delete(':oeNo')
  @ApiOperation({ summary: 'Delete Order Enquiry' })
  @ApiParam({
    name: 'oeNo',
    description: 'Order Enquiry Number',
  })
  @ApiResponse({
    status: 200,
    description: 'Order Enquiry deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order Enquiry not found',
  })
  async remove(@Param('oeNo') oeNo: string) {
    await this.oeService.remove(oeNo);
    return { message: 'Order Enquiry deleted successfully' };
  }
}
