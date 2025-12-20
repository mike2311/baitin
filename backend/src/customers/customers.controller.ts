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
import { CustomersService } from './customers.service'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { CustomerSearchResponseDto } from './dto/customer-search-response.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

/**
 * Customers Controller
 * 
 * Implements REST API endpoints for customer master data management.
 * 
 * Reference: Task 02-01 - Customer Entry Form
 */
@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    const userId = req.user?.username || 'system'
    return await this.customersService.create(createCustomerDto, userId)
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('filter') filter?: string,
  ) {
    return await this.customersService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
      filter,
    )
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers for lookup' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    type: [CustomerSearchResponseDto],
  })
  async search(@Query('q') query: string, @Query('limit') limit?: number) {
    return await this.customersService.search(query, limit ? Number(limit) : 20)
  }

  @Get(':custNo')
  @ApiOperation({ summary: 'Get customer by customer number' })
  @ApiParam({
    name: 'custNo',
    description: 'Customer number',
  })
  async findOne(@Param('custNo') custNo: string) {
    return await this.customersService.findOne(custNo)
  }

  @Put(':custNo')
  @ApiOperation({ summary: 'Update customer' })
  @ApiParam({
    name: 'custNo',
    description: 'Customer number',
  })
  async update(
    @Param('custNo') custNo: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Request() req,
  ) {
    const userId = req.user?.username || 'system'
    return await this.customersService.update(custNo, updateCustomerDto, userId)
  }

  @Delete(':custNo')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiParam({
    name: 'custNo',
    description: 'Customer number',
  })
  async remove(@Param('custNo') custNo: string) {
    await this.customersService.remove(custNo)
    return { message: 'Customer deleted successfully' }
  }
}

