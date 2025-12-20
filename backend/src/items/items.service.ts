import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like, In } from 'typeorm'
import { Item } from './entities/item.entity'
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { ItemSearchResponseDto } from './dto/item-search-response.dto'
import { Zstdcode } from '../reference/entities/zstdcode.entity'
import { Zorigin } from '../reference/entities/zorigin.entity'

/**
 * Item Service
 * 
 * Implements item master data CRUD operations with validation logic
 * preserved from the original FoxPro system.
 * 
 * Original Logic Reference:
 * - FoxPro Form: iitem.scx (Input Item Detail)
 * - Documentation: docs/source/02-business-processes/master-data-management.md lines 9-163
 * - Validation: docs/04-forms-and-screens/validation-catalog.md lines 42-56
 * 
 * Business Rules (MUST PRESERVE):
 * - item_no must be unique
 * - std_code must exist in zstdcode table (if provided)
 * - origin must exist in zorigin table (if provided)
 * - price and cost must be >= 0 (validated in DTO)
 * 
 * Audit Fields:
 * - Create: cre_date, cre_user, user_id
 * - Update: mod_date, mod_user
 * 
 * Reference: Task 01-01 - Item Entry Form
 */
@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Zstdcode)
    private readonly zstdcodeRepository: Repository<Zstdcode>,
    @InjectRepository(Zorigin)
    private readonly zoriginRepository: Repository<Zorigin>,
  ) {}

  /**
   * Create new item
   * 
   * Original Logic Reference:
   * - Business Process: docs/source/02-business-processes/master-data-management.md lines 125-137
   * 
   * Business Flow:
   * 1. Check if item_no already exists
   * 2. Validate std_code against zstdcode table
   * 3. Validate origin against zorigin table
   * 4. Create record with audit fields
   * 
   * @param createItemDto - Item data
   * @param userId - Current user ID
   * @returns Created item
   */
  async create(createItemDto: CreateItemDto, userId: string): Promise<Item> {
    // Validate item_no uniqueness
    await this.validateItemNumberUniqueness(createItemDto.itemNo)

    // Validate std_code if provided
    if (createItemDto.stdCode) {
      await this.validateStandardCode(createItemDto.stdCode)
    }

    // Validate origin if provided
    if (createItemDto.origin) {
      await this.validateOrigin(createItemDto.origin)
    }

    // Create item with audit fields
    const item = this.itemRepository.create({
      ...createItemDto,
      creDate: new Date(),
      creUser: userId,
      userId: userId,
    })

    return await this.itemRepository.save(item)
  }

  /**
   * Find all items with optional filtering
   * 
   * Original Logic Reference:
   * - List views in original system
   * - Documentation: Task 01-03 - Item List with Filtering
   * 
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @param filter - Search filter
   * @returns Paginated items
   */
  async findAll(
    page: number = 1,
    limit: number = 50,
    filter?: string,
  ): Promise<{ items: Item[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit

    const where = filter
      ? [
          { itemNo: Like(`%${filter}%`) },
          { shortName: Like(`%${filter}%`) },
          { stdCode: Like(`%${filter}%`) },
        ]
      : {}

    const [items, total] = await this.itemRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { itemNo: 'ASC' },
    })

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Find item by item number
   * 
   * @param itemNo - Item number
   * @returns Item
   * @throws NotFoundException if item not found
   */
  async findOne(itemNo: string): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { itemNo },
    })

    if (!item) {
      throw new NotFoundException(`Item Number "${itemNo}" Not Found`)
    }

    return item
  }

  /**
   * Update item
   * 
   * Original Logic Reference:
   * - Business Process: docs/source/02-business-processes/master-data-management.md lines 139-148
   * 
   * Business Flow:
   * 1. Load existing item
   * 2. Validate changes (std_code, origin)
   * 3. Update with mod_date and mod_user
   * 
   * @param itemNo - Item number
   * @param updateItemDto - Updated item data
   * @param userId - Current user ID
   * @returns Updated item
   */
  async update(
    itemNo: string,
    updateItemDto: UpdateItemDto,
    userId: string,
  ): Promise<Item> {
    const item = await this.findOne(itemNo)

    // Validate std_code if changed
    if (updateItemDto.stdCode && updateItemDto.stdCode !== item.stdCode) {
      await this.validateStandardCode(updateItemDto.stdCode)
    }

    // Validate origin if changed
    if (updateItemDto.origin && updateItemDto.origin !== item.origin) {
      await this.validateOrigin(updateItemDto.origin)
    }

    // Update item with audit fields
    Object.assign(item, updateItemDto)
    item.modDate = new Date()
    item.modUser = userId

    return await this.itemRepository.save(item)
  }

  /**
   * Delete item
   * 
   * @param itemNo - Item number
   */
  async remove(itemNo: string): Promise<void> {
    const item = await this.findOne(itemNo)
    await this.itemRepository.remove(item)
  }

  /**
   * Search items for lookup/type-to-search
   * 
   * Original Logic Reference:
   * - Lookup forms in original system
   * - UX Strategy: docs/modernization-strategy/06-ux-ui-strategy/ux-ui-strategy.md
   * 
   * Performance Requirement:
   * - Response time < 200ms
   * 
   * @param query - Search query
   * @param limit - Max results (default 20)
   * @returns Search results
   */
  async search(
    query: string,
    limit: number = 20,
  ): Promise<ItemSearchResponseDto[]> {
    const items = await this.itemRepository.find({
      where: [
        { itemNo: Like(`%${query}%`) },
        { shortName: Like(`%${query}%`) },
      ],
      take: limit,
      order: { itemNo: 'ASC' },
    })

    return items.map((item) => ({
      code: item.itemNo,
      name: item.shortName || item.itemNo,
      description: item.desp,
    }))
  }

  /**
   * Validates item number uniqueness
   * 
   * Original Logic Reference:
   * - FoxPro Form: iitem.scx (Txtbox1.Valid)
   * - Validation: docs/04-forms-and-screens/validation-catalog.md lines 42-56
   * 
   * Business Rule:
   * - item_no must be unique in item table
   * 
   * Validation Flow:
   * 1. SELECT item WHERE item_no = ?
   * 2. If exists: Error "Item Number Already Exists"
   * 
   * @param itemNo - Item number to validate
   * @throws BadRequestException if item already exists
   */
  private async validateItemNumberUniqueness(itemNo: string): Promise<void> {
    const existing = await this.itemRepository.findOne({
      where: { itemNo },
    })

    if (existing) {
      throw new BadRequestException('Item Number Already Exists')
    }
  }

  /**
   * Validates standard code against zstdcode table
   * 
   * Original Logic Reference:
   * - FoxPro: Validation against zstdcode table
   * - Validation: docs/04-forms-and-screens/validation-catalog.md lines 42-56
   * 
   * Business Rule:
   * - If std_code provided, must exist in zstdcode table
   * 
   * @param stdCode - Standard code to validate
   * @throws BadRequestException if standard code invalid
   */
  private async validateStandardCode(stdCode: string): Promise<void> {
    const exists = await this.zstdcodeRepository.findOne({
      where: { stdCode: stdCode },
    })

    if (!exists) {
      throw new BadRequestException('Invalid Standard Code')
    }
  }

  /**
   * Validates origin against zorigin table
   * 
   * Original Logic Reference:
   * - FoxPro: Validation against zorigin table
   * - Validation: docs/04-forms-and-screens/validation-catalog.md lines 42-56
   * 
   * Business Rule:
   * - If origin provided, must exist in zorigin table
   * 
   * @param origin - Origin code to validate
   * @throws BadRequestException if origin invalid
   */
  private async validateOrigin(origin: string): Promise<void> {
    const exists = await this.zoriginRepository.findOne({
      where: { origin: origin },
    })

    if (!exists) {
      throw new BadRequestException('Invalid Origin')
    }
  }
}

