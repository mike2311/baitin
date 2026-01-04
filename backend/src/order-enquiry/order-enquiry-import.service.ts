import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEnquiryControl } from './entities/order-enquiry-control.entity';
import { OrderEnquiryDetail } from './entities/order-enquiry-detail.entity';
import { OrderEnquiryHeader } from './entities/order-enquiry-header.entity';
import { OrderEnquiryQtyBreakdown } from './entities/order-enquiry-qty-breakdown.entity';
import { ExcelImportFormatDetector } from './excel-import/excel-import-format-detector';
import { ExcelImportParserRegistry } from './excel-import/excel-import-parser-registry';
import { ImportOrderEnquiryDto } from './dto/import-order-enquiry.dto';
import { ImportFile } from './excel-import/types';
import { BomService } from '../shared/services/bom.service';

/**
 * Order Enquiry Import Service
 *
 * Original Logic Reference:
 * - Documentation: docs/source/02-business-processes/order-enquiry-process.md
 * - Key Rule: OE Control must exist before import, except INSP company which auto-prefixes \"IN-\" and skips OE Control validation.
 */
@Injectable()
export class OrderEnquiryImportService {
  constructor(
    @InjectRepository(OrderEnquiryControl)
    private readonly oeControlRepo: Repository<OrderEnquiryControl>,
    @InjectRepository(OrderEnquiryHeader)
    private readonly oeHeaderRepo: Repository<OrderEnquiryHeader>,
    @InjectRepository(OrderEnquiryDetail)
    private readonly oeDetailRepo: Repository<OrderEnquiryDetail>,
    @InjectRepository(OrderEnquiryQtyBreakdown)
    private readonly qtyBrkRepo: Repository<OrderEnquiryQtyBreakdown>,
    private readonly formatDetector: ExcelImportFormatDetector,
    private readonly parserRegistry: ExcelImportParserRegistry,
    private readonly bomService: BomService,
  ) {}

  async importFile(
    dto: ImportOrderEnquiryDto,
    file: ImportFile,
    userId?: string,
  ) {
    const companyCode = (dto.companyCode || '').trim().toUpperCase();
    if (!companyCode) throw new BadRequestException('companyCode is required');

    const format = this.formatDetector.detect(file, dto.format);
    const parsed = this.parserRegistry.parse(file, companyCode, format);

    // Group by OE number for header/detail creation
    const byOe = new Map<string, typeof parsed.lines>();
    for (const line of parsed.lines) {
      const oeNo = this.normalizeOeNo(line.oeNo, companyCode);
      if (!byOe.has(oeNo)) byOe.set(oeNo, []);
      byOe.get(oeNo)!.push({ ...line, oeNo });
    }

    const created: { oeNo: string; lines: number }[] = [];

    for (const [oeNo, lines] of byOe.entries()) {
      // Validate OE control existence & customer match unless INSP
      const control = await this.validateOeControl(oeNo, companyCode);

      // Ensure header exists
      const header =
        (await this.oeHeaderRepo.findOne({ where: { oeNo } })) ??
        this.oeHeaderRepo.create({
          oeNo,
          custNo: control?.custNo ?? '',
          oeDate: new Date(),
          status: 0,
          compCode: companyCode,
          userId,
        });

      if (!header.custNo) {
        // For non-INSP, control must exist so custNo should be set. For INSP, custNo may exist in file in later enhancements.
        // Phase 2 MVP: require custNo for header creation.
        throw new BadRequestException(
          `Missing customer for OE ${oeNo}. Create OE Control first (except INSP).`,
        );
      }

      await this.oeHeaderRepo.save(header);

      // Recreate details idempotently for this OE (legacy deletes old OE on re-import in some flows)
      await this.oeDetailRepo.delete({ oeNo });
      await this.qtyBrkRepo.delete({ oeNo });

      // Create details and (optional) qty breakdown records
      let lineNo = 1;
      const detailEntities: OrderEnquiryDetail[] = [];
      const brkEntities: OrderEnquiryQtyBreakdown[] = [];

      for (const l of lines) {
        const bomComponents = await this.bomService.getComponents(l.itemNo);
        const hasBom = bomComponents.length > 0;

        // Head item record
        detailEntities.push(
          this.oeDetailRepo.create({
            oeNo,
            lineNo,
            itemNo: l.itemNo,
            custNo: header.custNo,
            qty: l.qty,
            price: l.price ?? null,
            amount:
              l.price !== undefined ? Number(l.qty) * Number(l.price) : null,
            ctn: l.ctn ?? null,
            head: hasBom ? true : false,
            delFrom: l.delFrom ?? null,
            delTo: l.delTo ?? null,
            compCode: companyCode,
            userId,
          } as Partial<OrderEnquiryDetail>),
        );

        // If the line includes port/PO/date range, record it in qty breakdown table.
        if (l.port || l.poNo || l.delFrom || l.delTo) {
          brkEntities.push(
            this.qtyBrkRepo.create({
              oeNo,
              itemNo: l.itemNo,
              port: l.port ?? null,
              poNo: l.poNo ?? null,
              delFrom: l.delFrom ?? null,
              delTo: l.delTo ?? null,
              qty: l.qty,
              userId,
              modDate: new Date(),
              modTime: this.hhmmss(new Date()),
            } as Partial<OrderEnquiryQtyBreakdown>),
          );
        }

        lineNo += 1;

        // BOM sub-items (legacy: head = .F. records following head item)
        if (hasBom) {
          const subQtys = this.bomService.calculateSubItemQtys(
            Number(l.qty),
            bomComponents,
          );
          for (const sub of subQtys) {
            detailEntities.push(
              this.oeDetailRepo.create({
                oeNo,
                lineNo,
                itemNo: sub.subItemNo,
                custNo: header.custNo,
                qty: sub.qty,
                price: null,
                amount: null,
                ctn: null,
                head: false,
                delFrom: l.delFrom ?? null,
                delTo: l.delTo ?? null,
                compCode: companyCode,
                userId,
              } as Partial<OrderEnquiryDetail>),
            );
            lineNo += 1;
          }
        }
      }

      // Basic item existence validation (bulk)
      await this.validateItemsExist(detailEntities.map((d) => d.itemNo));

      await this.oeDetailRepo.save(detailEntities);
      if (brkEntities.length) await this.qtyBrkRepo.save(brkEntities);

      created.push({ oeNo, lines: detailEntities.length });
    }

    return {
      format,
      companyCode,
      importedOes: created.length,
      created,
    };
  }

  private async validateItemsExist(itemNos: string[]) {
    const unique = Array.from(
      new Set(itemNos.map((x) => (x || '').trim()).filter(Boolean)),
    );
    if (unique.length === 0) return;

    // Item repository exists in ItemsModule, but to avoid circular deps here we just validate via query on the order_enquiry_detail FK already in DB.
    // Phase 2 MVP: we validate by ensuring the item exists by querying the `item` table through a raw query.
    // This keeps behavior aligned with docs (item must exist).
    const rows = await this.oeDetailRepo.manager.query(
      `select item_no from public.item where item_no = any($1::varchar[])`,
      [unique],
    );
    const found = new Set(
      (rows as { item_no: string }[]).map((r) => r.item_no),
    );
    const missing = unique.filter((x) => !found.has(x));
    if (missing.length) {
      throw new BadRequestException(
        `Invalid item(s): ${missing.slice(0, 20).join(', ')}`,
      );
    }
  }

  private async validateOeControl(oeNo: string, companyCode: string) {
    if (companyCode === 'INSP') return null;
    const control = await this.oeControlRepo.findOne({ where: { oeNo } });
    if (!control) {
      throw new BadRequestException(`No OE Control record for OE ${oeNo}`);
    }
    return control;
  }

  private normalizeOeNo(raw: string, companyCode: string) {
    const trimmed = (raw || '').trim();
    if (companyCode === 'INSP') {
      return trimmed.startsWith('IN-') ? trimmed : `IN-${trimmed}`;
    }
    return trimmed;
  }

  private hhmmss(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }
}
