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
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemSearchResponseDto } from './dto/item-search-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Items Controller
 *
 * Implements REST API endpoints for item master data management.
 * All endpoints require JWT authentication.
 *
 * Original Logic Reference:
 * - FoxPro Form: iitem.scx (Input Item Detail)
 * - Documentation: docs/source/02-business-processes/master-data-management.md lines 9-163
 *
 * API Endpoints:
 * - GET /api/items - List items with filtering
 * - GET /api/items/search - Search items for lookup
 * - GET /api/items/:itemNo - Get item by number
 * - POST /api/items - Create new item
 * - PUT /api/items/:itemNo - Update existing item
 * - DELETE /api/items/:itemNo - Delete item
 *
 * Reference: Task 01-01 - Item Entry Form
 */
@ApiTags('items')
@Controller('items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /**
   * Create new item
   *
   * Original Logic Reference:
   * - Business Process: docs/source/02-business-processes/master-data-management.md lines 125-137
   *
   * Business Flow:
   * 1. User enters item number
   * 2. System checks uniqueness
   * 3. User enters item details
   * 4. Validates std_code and origin
   * 5. Creates record with audit fields
   *
   * @param createItemDto - Item data
   * @param req - Request object (contains user)
   * @returns Created item
   */
  @Post()
  @ApiOperation({ summary: 'Create new item' })
  @ApiResponse({
    status: 201,
    description: 'Item created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error (e.g., Item Number Already Exists)',
  })
  async create(@Body() createItemDto: CreateItemDto, @Request() req) {
    const userId = req.user?.username || 'system';
    return await this.itemsService.create(createItemDto, userId);
  }

  /**
   * Get all items with filtering and pagination
   *
   * Original Logic Reference:
   * - List views in original system
   * - Documentation: Task 01-03 - Item List with Filtering
   *
   * Features:
   * - Filter by item_no, short_name, std_code
   * - Pagination
   * - Sorting by item_no
   *
   * @param page - Page number (default 1)
   * @param limit - Items per page (default 50)
   * @param filter - Search filter
   * @returns Paginated items
   */
  @Get()
  @ApiOperation({ summary: 'Get all items with filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    type: String,
    description: 'Search filter (item_no, short_name, std_code)',
  })
  @ApiResponse({
    status: 200,
    description: 'Items retrieved successfully',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('filter') filter?: string,
  ) {
    return await this.itemsService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
      filter,
    );
  }

  /**
   * Search items for lookup/type-to-search
   *
   * Original Logic Reference:
   * - Lookup forms in original system
   * - UX Strategy: docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md
   *
   * Features:
   * - Type-to-search with debouncing
   * - Display item_no and short_name
   * - Performance: < 200ms response time
   *
   * @param q - Search query
   * @param limit - Max results (default 20)
   * @returns Search results
   */
  @Get('search')
  @ApiOperation({ summary: 'Search items for lookup' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max results (default 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [ItemSearchResponseDto],
  })
  async search(@Query('q') query: string, @Query('limit') limit?: number) {
    return await this.itemsService.search(query, limit ? Number(limit) : 20);
  }

  /**
   * Get item by item number
   *
   * @param itemNo - Item number
   * @returns Item details
   */
  @Get(':itemNo')
  @ApiOperation({ summary: 'Get item by item number' })
  @ApiParam({
    name: 'itemNo',
    description: 'Item number',
    example: 'ITEM001',
  })
  @ApiResponse({
    status: 200,
    description: 'Item found',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  async findOne(@Param('itemNo') itemNo: string) {
    return await this.itemsService.findOne(itemNo);
  }

  /**
   * Update item
   *
   * Original Logic Reference:
   * - Business Process: docs/source/02-business-processes/master-data-management.md lines 139-148
   *
   * Business Flow:
   * 1. User selects existing item
   * 2. Modifies fields
   * 3. Validates std_code and origin if changed
   * 4. Updates with mod_date and mod_user
   *
   * @param itemNo - Item number
   * @param updateItemDto - Updated item data
   * @param req - Request object (contains user)
   * @returns Updated item
   */
  @Put(':itemNo')
  @ApiOperation({ summary: 'Update item' })
  @ApiParam({
    name: 'itemNo',
    description: 'Item number',
    example: 'ITEM001',
  })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async update(
    @Param('itemNo') itemNo: string,
    @Body() updateItemDto: UpdateItemDto,
    @Request() req,
  ) {
    const userId = req.user?.username || 'system';
    return await this.itemsService.update(itemNo, updateItemDto, userId);
  }

  /**
   * Delete item
   *
   * @param itemNo - Item number
   */
  @Delete(':itemNo')
  @ApiOperation({ summary: 'Delete item' })
  @ApiParam({
    name: 'itemNo',
    description: 'Item number',
    example: 'ITEM001',
  })
  @ApiResponse({
    status: 200,
    description: 'Item deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  async remove(@Param('itemNo') itemNo: string) {
    await this.itemsService.remove(itemNo);
    return { message: 'Item deleted successfully' };
  }
}
