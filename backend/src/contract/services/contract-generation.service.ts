import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractHeader } from '../entities/contract-header.entity';
import { ContractDetail } from '../entities/contract-detail.entity';
import { OrderConfirmationHeader } from '../../order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../../order-confirmation/entities/order-confirmation-detail.entity';
import { BomService } from '../../shared/services/bom.service';

/**
 * Contract Generation Service
 *
 * Generates contract(s) from OC, grouped by `vendor_no`.
 *
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/contract-process.md
 * - Business Rule: One contract per vendor per OC
 * - BOM: Uses same algorithm as OC but applies to contract detail
 */
@Injectable()
export class ContractGenerationService {
  constructor(
    @InjectRepository(ContractHeader)
    private readonly headerRepo: Repository<ContractHeader>,
    @InjectRepository(ContractDetail)
    private readonly detailRepo: Repository<ContractDetail>,
    @InjectRepository(OrderConfirmationHeader)
    private readonly ocHeaderRepo: Repository<OrderConfirmationHeader>,
    @InjectRepository(OrderConfirmationDetail)
    private readonly ocDetailRepo: Repository<OrderConfirmationDetail>,
    private readonly bomService: BomService,
  ) {}

  async generateFromOc(confNoRaw: string, userId?: string) {
    const confNo = (confNoRaw || '').trim();
    if (!confNo) throw new BadRequestException('confNo is required');

    const oc = await this.ocHeaderRepo.findOne({ where: { confNo } });
    if (!oc) throw new BadRequestException(`OC not found: ${confNo}`);

    const ocLines = await this.ocDetailRepo.find({
      where: { confNo },
      order: { lineNo: 'ASC' },
    });
    if (!ocLines.length)
      throw new BadRequestException(`OC has no items: ${confNo}`);

    // Group OC lines by vendor_no (contracts generated per vendor)
    const groups = new Map<string, OrderConfirmationDetail[]>();
    for (const line of ocLines) {
      const vendorNo = (line.vendorNo || '').trim();
      if (!vendorNo) {
        // Legacy cannot group items without vendor_no.
        throw new BadRequestException(
          `OC item missing vendor_no: ${confNo} line ${line.lineNo}`,
        );
      }
      if (!groups.has(vendorNo)) groups.set(vendorNo, []);
      groups.get(vendorNo)!.push(line);
    }

    const created: { vendorNo: string; contNo: string; lines: number }[] = [];

    for (const [vendorNo, vendorLines] of groups.entries()) {
      const contNo = await this.buildUniqueContractNo(confNo, vendorNo);

      const header =
        (await this.headerRepo.findOne({ where: { contNo } })) ??
        this.headerRepo.create({
          contNo,
          confNo,
          date: new Date(),
          vendorNo,
          status: 0,
          userId,
        } as Partial<ContractHeader>);

      header.confNo = confNo;
      header.vendorNo = vendorNo;
      header.date = new Date();
      header.userId = userId ?? header.userId ?? null;
      await this.headerRepo.save(header);

      // Recreate details for idempotency
      await this.detailRepo.delete({ contNo });

      const details: ContractDetail[] = [];
      let lineNo = 1;

      for (const ocLine of vendorLines) {
        // Skip OC BOM sub-items; regenerate from BOM definitions when applicable.
        if (ocLine.head === false) {
          const hasBom = await this.bomService.hasBom(ocLine.itemNo);
          if (hasBom) continue;
        }

        const bomComponents = await this.bomService.getComponents(
          ocLine.itemNo,
        );
        const hasBom = bomComponents.length > 0;

        details.push(
          this.detailRepo.create({
            contNo,
            confNo,
            lineNo,
            itemNo: ocLine.itemNo,
            vendorNo,
            qty: ocLine.qty,
            ctn: ocLine.ctn ?? null,
            // Legacy often uses cost for contract price; fall back to OC price.
            price: ocLine.cost ?? ocLine.price ?? null,
            cost: ocLine.cost ?? null,
            head: hasBom ? true : false,
            descMemo: null,
            itemMemo: null,
          } as Partial<ContractDetail>),
        );
        lineNo += 1;

        if (hasBom) {
          const subQtys = this.bomService.calculateSubItemQtys(
            Number(ocLine.qty),
            bomComponents,
          );
          for (const sub of subQtys) {
            details.push(
              this.detailRepo.create({
                contNo,
                confNo,
                lineNo,
                itemNo: sub.subItemNo,
                vendorNo,
                qty: sub.qty,
                ctn: null,
                price: null,
                cost: null,
                head: false,
                descMemo: null,
                itemMemo: null,
              } as Partial<ContractDetail>),
            );
            lineNo += 1;
          }
        }
      }

      await this.detailRepo.save(details);
      created.push({ vendorNo, contNo, lines: details.length });
    }

    return { confNo, contracts: created.length, created };
  }

  /**
   * Contract number generation
   *
   * The documentation specifies that cont_no is generated from OC and vendor, but does not
   * provide a single canonical string format. We generate a deterministic, unique cont_no
   * using (conf_no + vendor_no) with a numeric suffix if needed.
   */
  private async buildUniqueContractNo(confNo: string, vendorNo: string) {
    const base = `${confNo}-${vendorNo}`;
    const normalized =
      base.length <= 50
        ? base
        : `${confNo}`.slice(0, 35) + '-' + `${vendorNo}`.slice(0, 14);

    let candidate = normalized;
    let i = 1;
    // Ensure uniqueness
    while (await this.headerRepo.findOne({ where: { contNo: candidate } })) {
      i += 1;
      const suffix = `-${i}`;
      const maxBaseLen = 50 - suffix.length;
      candidate =
        (normalized.length > maxBaseLen
          ? normalized.slice(0, maxBaseLen)
          : normalized) + suffix;
    }
    return candidate;
  }
}
