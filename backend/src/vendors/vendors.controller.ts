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
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger'
import { VendorsService } from './vendors.service'
import { CreateVendorDto } from './dto/create-vendor.dto'
import { UpdateVendorDto } from './dto/update-vendor.dto'
import { VendorSearchResponseDto } from './dto/vendor-search-response.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

/**
 * Vendors Controller
 * 
 * Implements REST API endpoints for vendor master data management.
 * 
 * Reference: Task 03-01 - Vendor Entry Form
 */
@ApiTags('vendors')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new vendor' })
  async create(@Body() createVendorDto: CreateVendorDto, @Request() req) {
    const userId = req.user?.username || 'system'
    return await this.vendorsService.create(createVendorDto, userId)
  }

  @Get()
  @ApiOperation({ summary: 'Get all vendors with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'filter', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: Number })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('filter') filter?: string,
    @Query('type') type?: number,
  ) {
    return await this.vendorsService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
      filter,
      type ? Number(type) : undefined,
    )
  }

  @Get('search')
  @ApiOperation({ summary: 'Search vendors for lookup' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    type: [VendorSearchResponseDto],
  })
  async search(@Query('q') query: string, @Query('limit') limit?: number) {
    return await this.vendorsService.search(query, limit ? Number(limit) : 20)
  }

  @Get(':vendorNo')
  @ApiOperation({ summary: 'Get vendor by vendor number' })
  @ApiParam({ name: 'vendorNo', description: 'Vendor number' })
  async findOne(@Param('vendorNo') vendorNo: string) {
    return await this.vendorsService.findOne(vendorNo)
  }

  @Put(':vendorNo')
  @ApiOperation({ summary: 'Update vendor' })
  @ApiParam({ name: 'vendorNo', description: 'Vendor number' })
  async update(
    @Param('vendorNo') vendorNo: string,
    @Body() updateVendorDto: UpdateVendorDto,
    @Request() req,
  ) {
    const userId = req.user?.username || 'system'
    return await this.vendorsService.update(vendorNo, updateVendorDto, userId)
  }

  @Delete(':vendorNo')
  @ApiOperation({ summary: 'Delete vendor' })
  @ApiParam({ name: 'vendorNo', description: 'Vendor number' })
  async remove(@Param('vendorNo') vendorNo: string) {
    await this.vendorsService.remove(vendorNo)
    return { message: 'Vendor deleted successfully' }
  }
}

