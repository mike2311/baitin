import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { OrderEnquiryControl } from './entities/order-enquiry-control.entity';
import { Customer } from '../customers/entities/customer.entity';
import {
  CreateOrderEnquiryControlDto,
  UpdateOrderEnquiryControlDto,
  OrderEnquiryControlSearchDto,
} from './dto/order-enquiry-control.dto';

/**
 * Order Enquiry Control Service
 *
 * Implements OE Control CRUD operations with validation.
 *
 * Original Logic Reference:
 * - Legacy Table: moectrl (DBF)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md lines 44-69
 * - Business Rule: OE Control must exist before OE creation (except INSP company)
 *
 * Business Rules:
 * - oeNo must be unique
 * - custNo must exist in customer table
 * - Required for OE import (except INSP)
 *
 * Special Cases:
 * - INSP company: Automatically prefixes OE number with "IN-" and bypasses OE Control check
 *
 * Reference: Task 01-01 - OE Control Entry Form
 */
@Injectable()
export class OrderEnquiryControlService {
  constructor(
    @InjectRepository(OrderEnquiryControl)
    private readonly controlRepo: Repository<OrderEnquiryControl>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  /**
   * Create OE Control record
   */
  async create(
    dto: CreateOrderEnquiryControlDto,
    userId?: string,
  ): Promise<OrderEnquiryControl> {
    const oeNo = (dto.oeNo || '').trim();
    if (!oeNo) {
      throw new BadRequestException('OE Number is required');
    }

    // Validate OE Number uniqueness
    await this.validateOeNoUniqueness(oeNo);

    // Validate customer exists
    await this.validateCustomerExists(dto.custNo);

    // Create OE Control with audit fields
    const control = this.controlRepo.create({
      oeNo,
      custNo: dto.custNo.trim(),
      oeDate: new Date(dto.oeDate),
      poNo: dto.poNo?.trim() || null,
      status: dto.status?.trim() || null,
      remark: dto.remark?.trim() || null,
      creDate: new Date(),
      creUser: userId || 'system',
      userId: userId || 'system',
    } as Partial<OrderEnquiryControl>);

    return await this.controlRepo.save(control);
  }

  /**
   * Get OE Control by OE Number
   */
  async findOne(oeNo: string): Promise<OrderEnquiryControl> {
    const control = await this.controlRepo.findOne({
      where: { oeNo },
      relations: ['customer'],
    });

    if (!control) {
      throw new NotFoundException(
        `OE Control not found for OE Number "${oeNo}"`,
      );
    }

    return control;
  }

  /**
   * Update OE Control
   */
  async update(
    oeNo: string,
    dto: UpdateOrderEnquiryControlDto,
    userId?: string,
  ): Promise<OrderEnquiryControl> {
    const control = await this.findOne(oeNo);

    // Validate customer exists if provided
    if (dto.custNo) {
      await this.validateCustomerExists(dto.custNo);
      control.custNo = dto.custNo.trim();
    }

    if (dto.oeDate) {
      control.oeDate = new Date(dto.oeDate);
    }

    if (dto.poNo !== undefined) {
      control.poNo = dto.poNo?.trim() || null;
    }

    if (dto.status !== undefined) {
      control.status = dto.status?.trim() || null;
    }

    if (dto.remark !== undefined) {
      control.remark = dto.remark?.trim() || null;
    }

    // Update audit fields
    control.modDate = new Date();
    control.modUser = userId || 'system';

    return await this.controlRepo.save(control);
  }

  /**
   * Delete OE Control
   */
  async remove(oeNo: string): Promise<void> {
    const control = await this.findOne(oeNo);
    await this.controlRepo.remove(control);
  }

  /**
   * Search OE Control records
   */
  async search(searchDto: OrderEnquiryControlSearchDto): Promise<{
    controls: OrderEnquiryControl[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (searchDto.oeNo) {
      where.oeNo = Like(`%${searchDto.oeNo.trim()}%`);
    }

    if (searchDto.custNo) {
      where.custNo = searchDto.custNo.trim();
    }

    if (searchDto.dateFrom || searchDto.dateTo) {
      if (searchDto.dateFrom && searchDto.dateTo) {
        where.oeDate = Between(
          new Date(searchDto.dateFrom),
          new Date(searchDto.dateTo),
        );
      } else if (searchDto.dateFrom) {
        where.oeDate = MoreThanOrEqual(new Date(searchDto.dateFrom));
      } else if (searchDto.dateTo) {
        where.oeDate = LessThanOrEqual(new Date(searchDto.dateTo));
      }
    }

    const [controls, total] = await this.controlRepo.findAndCount({
      where,
      relations: ['customer'],
      skip,
      take: limit,
      order: { oeDate: 'DESC', oeNo: 'ASC' },
    });

    return {
      controls,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Validate OE Number uniqueness
   */
  private async validateOeNoUniqueness(oeNo: string): Promise<void> {
    const existing = await this.controlRepo.findOne({
      where: { oeNo },
    });

    if (existing) {
      throw new BadRequestException('OE Number Already Exists');
    }
  }

  /**
   * Validate customer exists
   */
  private async validateCustomerExists(custNo: string): Promise<void> {
    const customer = await this.customerRepo.findOne({
      where: { custNo: custNo.trim() },
    });

    if (!customer) {
      throw new BadRequestException(
        `Customer Number "${custNo}" does not exist`,
      );
    }
  }
}
