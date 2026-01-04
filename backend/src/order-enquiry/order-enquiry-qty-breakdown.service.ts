import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEnquiryHeader } from './entities/order-enquiry-header.entity';
import { OrderEnquiryQtyBreakdown } from './entities/order-enquiry-qty-breakdown.entity';
import {
  CreateOrderEnquiryQtyBreakdownDto,
  UpdateOrderEnquiryQtyBreakdownDto,
} from './dto/qty-breakdown.dto';

/**
 * Order Enquiry Qty Breakdown Service
 *
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/order-enquiry-process.md (Quantity Breakdown Processing)
 * - Documentation: docs/source/05-business-logic/core-algorithms.md (Quantity Breakdown Algorithm)
 */
@Injectable()
export class OrderEnquiryQtyBreakdownService {
  constructor(
    @InjectRepository(OrderEnquiryQtyBreakdown)
    private readonly repo: Repository<OrderEnquiryQtyBreakdown>,
    @InjectRepository(OrderEnquiryHeader)
    private readonly headerRepo: Repository<OrderEnquiryHeader>,
  ) {}

  async list(oeNo: string, itemNo?: string) {
    if (!oeNo?.trim()) throw new BadRequestException('oeNo is required');
    return this.repo.find({
      where: itemNo ? { oeNo, itemNo } : { oeNo },
      order: { id: 'ASC' },
    });
  }

  async create(dto: CreateOrderEnquiryQtyBreakdownDto, userId?: string) {
    const oeNo = dto.oeNo.trim();
    const itemNo = dto.itemNo.trim();
    await this.ensureHeaderExists(oeNo);

    const entity = this.repo.create({
      oeNo,
      itemNo,
      port: dto.port?.trim() || null,
      poNo: dto.poNo?.trim() || null,
      delFrom: dto.delFrom ? new Date(dto.delFrom) : null,
      delTo: dto.delTo ? new Date(dto.delTo) : null,
      sizeCode: dto.sizeCode?.trim() || null,
      colorCode: dto.colorCode?.trim() || null,
      styleCode: dto.styleCode?.trim() || null,
      qty: dto.qty,
      userId,
      modDate: new Date(),
      modTime: this.hhmmss(new Date()),
    } as Partial<OrderEnquiryQtyBreakdown>);

    return this.repo.save(entity);
  }

  async update(
    id: string,
    dto: UpdateOrderEnquiryQtyBreakdownDto,
    userId?: string,
  ) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing)
      throw new NotFoundException('Qty breakdown record not found');

    const updated = this.repo.merge(existing, {
      port: dto.port !== undefined ? dto.port?.trim() || null : existing.port,
      poNo: dto.poNo !== undefined ? dto.poNo?.trim() || null : existing.poNo,
      delFrom:
        dto.delFrom !== undefined
          ? dto.delFrom
            ? new Date(dto.delFrom)
            : null
          : existing.delFrom,
      delTo:
        dto.delTo !== undefined
          ? dto.delTo
            ? new Date(dto.delTo)
            : null
          : existing.delTo,
      sizeCode:
        dto.sizeCode !== undefined
          ? dto.sizeCode?.trim() || null
          : existing.sizeCode,
      colorCode:
        dto.colorCode !== undefined
          ? dto.colorCode?.trim() || null
          : existing.colorCode,
      styleCode:
        dto.styleCode !== undefined
          ? dto.styleCode?.trim() || null
          : existing.styleCode,
      qty: dto.qty !== undefined ? dto.qty : existing.qty,
      userId: userId ?? existing.userId,
      modDate: new Date(),
      modTime: this.hhmmss(new Date()),
    });

    return this.repo.save(updated);
  }

  async remove(id: string) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing)
      throw new NotFoundException('Qty breakdown record not found');
    await this.repo.remove(existing);
    return { deleted: true };
  }

  private async ensureHeaderExists(oeNo: string) {
    const header = await this.headerRepo.findOne({ where: { oeNo } });
    if (!header) throw new BadRequestException(`OE ${oeNo} not found`);
  }

  private hhmmss(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }
}
