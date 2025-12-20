import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import { Vendor } from './entities/vendor.entity'
import { CreateVendorDto } from './dto/create-vendor.dto'
import { UpdateVendorDto } from './dto/update-vendor.dto'
import { VendorSearchResponseDto } from './dto/vendor-search-response.dto'

/**
 * Vendor Service
 * 
 * Implements vendor master data CRUD operations.
 * 
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/master-data-management.md lines 291-363
 * - Validation: docs/04-forms-and-screens/validation-catalog.md lines 68-74
 * 
 * Business Rules:
 * - vendor_no must be unique
 * - type must be 1 (Vendor) or 2 (Maker)
 * 
 * Reference: Task 03-01 - Vendor Entry Form
 */
@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto, userId: string): Promise<Vendor> {
    // Validate vendor number uniqueness
    await this.validateVendorNumberUniqueness(createVendorDto.vendorNo)

    // Create vendor with audit fields
    const vendor = this.vendorRepository.create({
      ...createVendorDto,
      creDate: new Date(),
      creUser: userId,
      userId: userId,
    })

    return await this.vendorRepository.save(vendor)
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    filter?: string,
    type?: number,
  ): Promise<{ vendors: Vendor[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit

    let where: any = {}
    if (filter) {
      where = [
        { vendorNo: Like(`%${filter}%`) },
        { ename: Like(`%${filter}%`) },
        { sname: Like(`%${filter}%`) },
      ]
    }
    if (type !== undefined) {
      if (Array.isArray(where)) {
        where = where.map(w => ({ ...w, type }))
      } else {
        where.type = type
      }
    }

    const [vendors, total] = await this.vendorRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { vendorNo: 'ASC' },
    })

    return {
      vendors,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(vendorNo: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { vendorNo },
    })

    if (!vendor) {
      throw new NotFoundException(`Vendor Number "${vendorNo}" Not Found`)
    }

    return vendor
  }

  async update(
    vendorNo: string,
    updateVendorDto: UpdateVendorDto,
    userId: string,
  ): Promise<Vendor> {
    const vendor = await this.findOne(vendorNo)

    // Update vendor with audit fields
    Object.assign(vendor, updateVendorDto)
    vendor.modDate = new Date()
    vendor.modUser = userId

    return await this.vendorRepository.save(vendor)
  }

  async remove(vendorNo: string): Promise<void> {
    const vendor = await this.findOne(vendorNo)
    await this.vendorRepository.remove(vendor)
  }

  async search(
    query: string,
    limit: number = 20,
  ): Promise<VendorSearchResponseDto[]> {
    const vendors = await this.vendorRepository.find({
      where: [
        { vendorNo: Like(`%${query}%`) },
        { ename: Like(`%${query}%`) },
        { sname: Like(`%${query}%`) },
      ],
      take: limit,
      order: { vendorNo: 'ASC' },
    })

    return vendors.map((vendor) => ({
      code: vendor.vendorNo,
      name: vendor.ename || vendor.vendorNo,
      description: vendor.sname,
    }))
  }

  /**
   * Validates vendor number uniqueness
   * 
   * Business Rule:
   * - vendor_no must be unique in vendor table
   * 
   * @param vendorNo - Vendor number to validate
   * @throws BadRequestException if vendor already exists
   */
  private async validateVendorNumberUniqueness(vendorNo: string): Promise<void> {
    const existing = await this.vendorRepository.findOne({
      where: { vendorNo },
    })

    if (existing) {
      throw new BadRequestException('Vendor Number Already Exists')
    }
  }
}

