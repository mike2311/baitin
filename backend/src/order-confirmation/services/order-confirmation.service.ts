import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { OrderConfirmationHeader } from '../entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../entities/order-confirmation-detail.entity';
import { UpsertOrderConfirmationDto } from '../dto/order-confirmation.dto';

/**
 * Order Confirmation CRUD Service
 *
 * Original Logic Reference:
 * - FoxPro Form: `iordhd` (Input Order Confirmation)
 * - Documentation: docs/source/04-forms-and-screens/order-confirmation-forms.md (Manual OC Entry)
 */
@Injectable()
export class OrderConfirmationService {
  constructor(
    @InjectRepository(OrderConfirmationHeader)
    private readonly headerRepo: Repository<OrderConfirmationHeader>,
    @InjectRepository(OrderConfirmationDetail)
    private readonly detailRepo: Repository<OrderConfirmationDetail>,
  ) {}

  async get(confNo: string) {
    const header = await this.headerRepo.findOne({
      where: { confNo },
      relations: ['details'],
      order: { details: { lineNo: 'ASC' } } as any,
    });
    if (!header) throw new NotFoundException('OC not found');
    return header;
  }

  async upsert(dto: UpsertOrderConfirmationDto, userId?: string) {
    const confNo = dto.confNo.trim();
    if (!confNo) throw new BadRequestException('confNo is required');
    if (!dto.custNo?.trim())
      throw new BadRequestException('custNo is required');
    if (!dto.details?.length)
      throw new BadRequestException('details are required');

    const existing = await this.headerRepo.findOne({ where: { confNo } });
    const header =
      existing ??
      this.headerRepo.create({
        confNo,
      } as Partial<OrderConfirmationHeader>);

    header.oeNo = dto.oeNo?.trim() || null;
    header.date = new Date(dto.date);
    header.custNo = dto.custNo.trim();
    header.reqDateFr = dto.reqDateFr ? new Date(dto.reqDateFr) : null;
    header.reqDateTo = dto.reqDateTo ? new Date(dto.reqDateTo) : null;
    header.compCode = dto.compCode?.trim() || header.compCode || null;
    header.userId = userId ?? header.userId ?? null;

    await this.headerRepo.save(header);

    await this.detailRepo.delete({ confNo });
    const details = dto.details
      .slice()
      .sort((a, b) => a.lineNo - b.lineNo)
      .map((d) =>
        this.detailRepo.create({
          confNo,
          lineNo: d.lineNo,
          oeNo: dto.oeNo?.trim() || null,
          itemNo: d.itemNo.trim(),
          vendorNo: d.vendorNo?.trim() || null,
          qty: d.qty,
          ctn: d.ctn ?? null,
          price: d.price ?? null,
          cost: d.cost ?? null,
          poNo: d.poNo?.trim() || null,
          head: d.head ?? false,
          delFrom: null,
          delTo: null,
        } as Partial<OrderConfirmationDetail>),
      );

    await this.detailRepo.save(details);

    return this.get(confNo);
  }

  async remove(confNo: string) {
    const header = await this.headerRepo.findOne({ where: { confNo } });
    if (!header) throw new NotFoundException('OC not found');
    await this.headerRepo.remove(header);
    return { deleted: true };
  }

  async enquiry(params: {
    confNo?: string;
    custNo?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    const where: any = {};
    if (params.confNo) {
      where.confNo = params.confNo.trim();
    }
    if (params.custNo) {
      where.custNo = params.custNo.trim();
    }
    if (params.dateFrom || params.dateTo) {
      if (params.dateFrom && params.dateTo) {
        where.date = Between(
          new Date(params.dateFrom),
          new Date(params.dateTo),
        );
      } else if (params.dateFrom) {
        where.date = MoreThanOrEqual(new Date(params.dateFrom));
      } else if (params.dateTo) {
        where.date = LessThanOrEqual(new Date(params.dateTo));
      }
    }

    const rows = await this.headerRepo.find({
      where,
      relations: ['details'],
      order: { date: 'DESC', confNo: 'DESC' },
      take: Math.min(params.limit ?? 200, 500),
    });

    // Filter by ILIKE patterns if provided (post-query for confNo/custNo)
    let filtered = rows;
    if (params.confNo && !where.confNo) {
      const pattern = params.confNo.trim().toLowerCase();
      filtered = filtered.filter((h) =>
        h.confNo?.toLowerCase().includes(pattern),
      );
    }
    if (params.custNo && !where.custNo) {
      const pattern = params.custNo.trim().toLowerCase();
      filtered = filtered.filter((h) =>
        h.custNo?.toLowerCase().includes(pattern),
      );
    }

    return filtered.map((h) => ({
      confNo: h.confNo,
      oeNo: h.oeNo,
      date: h.date,
      custNo: h.custNo,
      compCode: h.compCode,
      lines: h.details?.length ?? 0,
    }));
  }

  async report(confNo: string) {
    const oc = await this.get(confNo);
    const totalQty = (oc.details || []).reduce(
      (sum, d) => sum + Number(d.qty || 0),
      0,
    );
    const totalAmount = (oc.details || []).reduce(
      (sum, d) => sum + Number(d.qty || 0) * Number(d.price || 0),
      0,
    );
    return {
      header: {
        confNo: oc.confNo,
        oeNo: oc.oeNo,
        date: oc.date,
        custNo: oc.custNo,
        compCode: oc.compCode,
      },
      details: (oc.details || []).map((d) => ({
        lineNo: d.lineNo,
        itemNo: d.itemNo,
        vendorNo: d.vendorNo,
        qty: d.qty,
        ctn: d.ctn,
        price: d.price,
        amount: d.price ? Number(d.qty) * Number(d.price) : null,
        head: d.head,
      })),
      totals: { totalQty, totalAmount },
    };
  }
}
