import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { OrderEnquiryHeader } from './entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from './entities/order-enquiry-detail.entity';
import { OrderEnquiryControl } from './entities/order-enquiry-control.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Item } from '../items/entities/item.entity';
import { UpsertOrderEnquiryDto } from './dto/order-enquiry.dto';

/**
 * Order Enquiry Service
 *
 * Implements OE CRUD operations with validation.
 *
 * Original Logic Reference:
 * - Legacy Tables: moehd (OE Header), moe (OE Detail)
 * - Documentation: docs/02-business-processes/order-enquiry-process.md
 *
 * Business Rules:
 * - OE Control must exist before OE creation (except INSP company)
 * - Customer must match OE Control customer (if OE Control exists)
 * - Item must exist
 * - Quantity > 0
 * - Price >= 0
 * - Auto-calculate: amount = qty * price
 * - Auto-calculate header: totalAmount = sum(details.amount)
 *
 * Special Cases:
 * - INSP company: Automatically prefixes OE number with "IN-" and bypasses OE Control check
 *
 * Reference: Task 02-01 - OE Header Form, Task 02-02 - OE Detail Grid
 */
@Injectable()
export class OrderEnquiryService {
  constructor(
    @InjectRepository(OrderEnquiryHeader)
    private readonly headerRepo: Repository<OrderEnquiryHeader>,
    @InjectRepository(OrderEnquiryDetail)
    private readonly detailRepo: Repository<OrderEnquiryDetail>,
    @InjectRepository(OrderEnquiryControl)
    private readonly controlRepo: Repository<OrderEnquiryControl>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
  ) {}

  /**
   * Get OE by OE Number with details
   */
  async get(oeNo: string): Promise<OrderEnquiryHeader> {
    const header = await this.headerRepo.findOne({
      where: { oeNo },
      relations: ['details', 'customer'],
      order: { details: { lineNo: 'ASC' } } as any,
    });

    if (!header) {
      throw new NotFoundException(
        `Order Enquiry not found for OE Number "${oeNo}"`,
      );
    }

    return header;
  }

  /**
   * Create or update OE (upsert pattern)
   */
  async upsert(
    dto: UpsertOrderEnquiryDto,
    userId?: string,
  ): Promise<OrderEnquiryHeader> {
    const oeNo = (dto.oeNo || '').trim();
    if (!oeNo) {
      throw new BadRequestException('OE Number is required');
    }

    if (!dto.custNo?.trim()) {
      throw new BadRequestException('Customer Number is required');
    }

    if (!dto.details?.length) {
      throw new BadRequestException('At least one detail line is required');
    }

    const companyCode = (dto.compCode || '').trim().toUpperCase() || 'HT';

    // Validate OE Control (except INSP)
    const control = await this.validateOeControl(oeNo, companyCode);

    // Validate customer exists
    await this.validateCustomerExists(dto.custNo);

    // Validate customer matches OE Control customer (if OE Control exists)
    if (control && control.custNo !== dto.custNo.trim()) {
      throw new BadRequestException(
        `Customer Number "${dto.custNo}" does not match OE Control customer "${control.custNo}"`,
      );
    }

    // Validate and prepare details
    const detailEntities = await this.prepareDetails(oeNo, dto.details);

    // Calculate totals
    const totalAmount = detailEntities.reduce(
      (sum, d) => sum + Number(d.amount || 0),
      0,
    );

    // Create or update header
    const existing = await this.headerRepo.findOne({ where: { oeNo } });
    const header =
      existing ??
      this.headerRepo.create({
        oeNo,
      } as Partial<OrderEnquiryHeader>);

    header.custNo = dto.custNo.trim();
    header.oeDate = new Date(dto.oeDate);
    header.poNo = dto.poNo?.trim() || null;
    header.status = dto.status ?? 0; // Default to Draft
    header.compCode = companyCode;
    header.remark = dto.remark?.trim() || null;
    header.totalAmount = totalAmount;
    header.userId = userId || header.userId || 'system';

    if (!existing) {
      header.creDate = new Date();
      header.creUser = userId || 'system';
    } else {
      header.modDate = new Date();
      header.modUser = userId || 'system';
    }

    await this.headerRepo.save(header);

    // Delete existing details and save new ones
    await this.detailRepo.delete({ oeNo });
    await this.detailRepo.save(detailEntities);

    return this.get(oeNo);
  }

  /**
   * Delete OE
   */
  async remove(oeNo: string): Promise<void> {
    const header = await this.get(oeNo);
    await this.headerRepo.remove(header);
  }

  /**
   * Search OE records for enquiry list
   */
  async enquiry(params: {
    oeNo?: string;
    custNo?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (params.oeNo) {
      where.oeNo = Like(`%${params.oeNo.trim()}%`);
    }

    if (params.custNo) {
      where.custNo = params.custNo.trim();
    }

    if (params.status !== undefined) {
      where.status = params.status;
    }

    if (params.dateFrom || params.dateTo) {
      if (params.dateFrom && params.dateTo) {
        where.oeDate = Between(
          new Date(params.dateFrom),
          new Date(params.dateTo),
        );
      } else if (params.dateFrom) {
        where.oeDate = MoreThanOrEqual(new Date(params.dateFrom));
      } else if (params.dateTo) {
        where.oeDate = LessThanOrEqual(new Date(params.dateTo));
      }
    }

    const headers = await this.headerRepo.find({
      where,
      relations: ['details', 'customer'],
      order: { oeDate: 'DESC', oeNo: 'DESC' },
      take: Math.min(params.limit ?? 200, 500),
    });

    // Calculate aggregated data
    return headers.map((h) => {
      const totalAmount = (h.details || []).reduce(
        (sum, d) => sum + Number(d.amount || 0),
        0,
      );
      const itemCount = (h.details || []).length;

      return {
        oeNo: h.oeNo,
        oeDate: h.oeDate,
        custNo: h.custNo,
        customerName: h.customer?.ename || h.custNo,
        poNo: h.poNo,
        status: h.status,
        compCode: h.compCode,
        totalAmount,
        itemCount,
      };
    });
  }

  /**
   * Validate OE Control exists (except INSP)
   */
  private async validateOeControl(
    oeNo: string,
    companyCode: string,
  ): Promise<OrderEnquiryControl | null> {
    if (companyCode === 'INSP') {
      return null; // INSP bypasses OE Control check
    }

    const control = await this.controlRepo.findOne({ where: { oeNo } });
    if (!control) {
      throw new BadRequestException(
        `No OE Control record for OE Number "${oeNo}". Create OE Control first (except INSP company).`,
      );
    }

    return control;
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

  /**
   * Prepare and validate detail entities
   */
  private async prepareDetails(
    oeNo: string,
    details: Array<{
      lineNo: number;
      itemNo: string;
      vendorNo?: string;
      qty: number;
      price?: number;
      ctn?: number;
      unit?: string;
      head?: boolean;
      itemDesc?: string;
      remark?: string;
    }>,
  ): Promise<OrderEnquiryDetail[]> {
    // Validate line numbers are unique
    const lineNos = details.map((d) => d.lineNo);
    const uniqueLineNos = new Set(lineNos);
    if (lineNos.length !== uniqueLineNos.size) {
      throw new BadRequestException('Line numbers must be unique');
    }

    // Validate items exist
    const itemNos = details.map((d) => d.itemNo.trim()).filter(Boolean);
    const uniqueItemNos = Array.from(new Set(itemNos));
    if (uniqueItemNos.length > 0) {
      const existingItems = await this.itemRepo.find({
        where: uniqueItemNos.map((itemNo) => ({ itemNo })),
      });
      const existingItemNos = new Set(existingItems.map((i) => i.itemNo));
      const missingItems = uniqueItemNos.filter(
        (itemNo) => !existingItemNos.has(itemNo),
      );
      if (missingItems.length > 0) {
        throw new BadRequestException(
          `Item Number(s) do not exist: ${missingItems.join(', ')}`,
        );
      }
    }

    // Create detail entities with auto-calculated amounts
    return details
      .slice()
      .sort((a, b) => a.lineNo - b.lineNo)
      .map((d) => {
        const qty = Number(d.qty || 0);
        const price = Number(d.price || 0);
        const amount = qty * price;

        return this.detailRepo.create({
          oeNo,
          lineNo: d.lineNo,
          itemNo: d.itemNo.trim(),
          vendorNo: d.vendorNo?.trim() || null,
          qty,
          price: d.price !== undefined ? price : null,
          amount,
          ctn: d.ctn ?? null,
          unit: d.unit?.trim() || null,
          head: d.head ?? false,
          itemDesc: d.itemDesc?.trim() || null,
          remark: d.remark?.trim() || null,
          creDate: new Date(),
          creUser: 'system',
          userId: 'system',
        } as Partial<OrderEnquiryDetail>);
      });
  }
}
