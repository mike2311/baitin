import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ContractHeader } from '../entities/contract-header.entity';
import { ContractDetail } from '../entities/contract-detail.entity';
import { UpsertContractDto } from '../dto/contract.dto';

/**
 * Contract CRUD Service
 *
 * Original Logic Reference:
 * - FoxPro Form: `isetcont@@_2018` / `iconthd_2018`
 * - Documentation: docs/source/04-forms-and-screens/contract-forms.md (date validation rules)
 */
@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(ContractHeader)
    private readonly headerRepo: Repository<ContractHeader>,
    @InjectRepository(ContractDetail)
    private readonly detailRepo: Repository<ContractDetail>,
  ) {}

  async get(contNo: string) {
    const header = await this.headerRepo.findOne({
      where: { contNo },
      relations: ['details'],
      order: { details: { lineNo: 'ASC' } } as any,
    });
    if (!header) throw new NotFoundException('Contract not found');
    return header;
  }

  async upsert(dto: UpsertContractDto, userId?: string) {
    const contNo = dto.contNo.trim();
    if (!contNo) throw new BadRequestException('contNo is required');
    if (!dto.confNo?.trim())
      throw new BadRequestException('confNo is required');
    if (!dto.vendorNo?.trim())
      throw new BadRequestException('vendorNo is required');
    if (!dto.details?.length)
      throw new BadRequestException('details are required');

    this.validateReqDate(dto.reqDateFr, dto.reqDateTo);

    const existing = await this.headerRepo.findOne({ where: { contNo } });
    const header =
      existing ??
      this.headerRepo.create({
        contNo,
      } as Partial<ContractHeader>);

    header.confNo = dto.confNo.trim();
    header.date = new Date(dto.date);
    header.vendorNo = dto.vendorNo.trim();
    header.payment = dto.payment?.trim() || null;
    header.remark = dto.remark ?? null;
    header.reqDateFr = dto.reqDateFr ? new Date(dto.reqDateFr) : null;
    header.reqDateTo = dto.reqDateTo ? new Date(dto.reqDateTo) : null;
    header.curCode = dto.curCode?.trim() || null;
    header.shipTo = dto.shipTo?.trim() || null;
    header.userId = userId ?? header.userId ?? null;
    await this.headerRepo.save(header);

    await this.detailRepo.delete({ contNo });
    const details = dto.details
      .slice()
      .sort((a, b) => a.lineNo - b.lineNo)
      .map((d) =>
        this.detailRepo.create({
          contNo,
          confNo: dto.confNo.trim(),
          lineNo: d.lineNo,
          itemNo: d.itemNo.trim(),
          vendorNo: d.vendorNo?.trim() || header.vendorNo,
          qty: d.qty,
          ctn: d.ctn ?? null,
          price: d.price ?? null,
          cost: d.cost ?? null,
          head: d.head ?? false,
          descMemo: d.descMemo ?? null,
          itemMemo: d.itemMemo ?? null,
        } as Partial<ContractDetail>),
      );

    await this.detailRepo.save(details);
    return this.get(contNo);
  }

  async remove(contNo: string) {
    const header = await this.headerRepo.findOne({ where: { contNo } });
    if (!header) throw new NotFoundException('Contract not found');
    await this.headerRepo.remove(header);
    return { deleted: true };
  }

  async enquiry(params: {
    contNo?: string;
    confNo?: string;
    vendorNo?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) {
    const where: any = {};
    if (params.contNo) {
      where.contNo = params.contNo.trim();
    }
    if (params.confNo) {
      where.confNo = params.confNo.trim();
    }
    if (params.vendorNo) {
      where.vendorNo = params.vendorNo.trim();
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
      order: { date: 'DESC', contNo: 'DESC' },
      take: Math.min(params.limit ?? 200, 500),
    });

    // Filter by ILIKE patterns if provided (post-query for contNo/confNo/vendorNo)
    let filtered = rows;
    if (params.contNo && !where.contNo) {
      const pattern = params.contNo.trim().toLowerCase();
      filtered = filtered.filter((h) =>
        h.contNo?.toLowerCase().includes(pattern),
      );
    }
    if (params.confNo && !where.confNo) {
      const pattern = params.confNo.trim().toLowerCase();
      filtered = filtered.filter((h) =>
        h.confNo?.toLowerCase().includes(pattern),
      );
    }
    if (params.vendorNo && !where.vendorNo) {
      const pattern = params.vendorNo.trim().toLowerCase();
      filtered = filtered.filter((h) =>
        h.vendorNo?.toLowerCase().includes(pattern),
      );
    }

    return filtered.map((h) => ({
      contNo: h.contNo,
      confNo: h.confNo,
      date: h.date,
      vendorNo: h.vendorNo,
      lines: h.details?.length ?? 0,
    }));
  }

  async report(contNo: string) {
    const c = await this.get(contNo);
    const totalQty = (c.details || []).reduce(
      (sum, d) => sum + Number(d.qty || 0),
      0,
    );
    const totalAmount = (c.details || []).reduce(
      (sum, d) => sum + Number(d.qty || 0) * Number(d.price || 0),
      0,
    );
    return {
      header: {
        contNo: c.contNo,
        confNo: c.confNo,
        date: c.date,
        vendorNo: c.vendorNo,
        payment: c.payment,
        reqDateFr: c.reqDateFr,
        reqDateTo: c.reqDateTo,
        curCode: c.curCode,
        shipTo: c.shipTo,
      },
      details: (c.details || []).map((d) => ({
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

  private validateReqDate(reqDateFr?: string, reqDateTo?: string) {
    // Mirrors contract-forms.md date validation rules:
    // - both empty or both filled
    // - to >= from
    const hasFrom = Boolean(reqDateFr);
    const hasTo = Boolean(reqDateTo);
    if (hasFrom !== hasTo) {
      throw new BadRequestException('Invalid Date !');
    }
    if (hasFrom && hasTo) {
      const from = new Date(reqDateFr!);
      const to = new Date(reqDateTo!);
      if (to.getTime() < from.getTime()) {
        throw new BadRequestException('Invalid Date !');
      }
    }
  }
}
