import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEnquiryHeader } from '../../order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from '../../order-enquiry/entities/order-enquiry-detail.entity';
import { OrderConfirmationHeader } from '../entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../entities/order-confirmation-detail.entity';
import { PostOeToOcDto } from '../dto/post-oe-to-oc.dto';
import { BomService } from '../../shared/services/bom.service';

/**
 * Post OE to OC Service
 *
 * Implements the legacy posting logic from OE → OC (mordhd/morddt).
 *
 * Original Logic Reference:
 * - FoxPro: `uordcont.prg` (procedures `umordhd`, `umorddt`)
 * - Documentation: docs/source/04-forms-and-screens/order-confirmation-forms.md (umordhd/umorddt)
 * - Documentation: docs/source/02-business-processes/order-confirmation-process.md
 *
 * Numbering Rules (exact):
 * - HT:  "HT-OC/" + oe_no
 * - BAT: "BTL-" + oe_no
 * - HFW: "HFW-OC/" + ALLTRIM(STRTRAN(oe_no, "HFW", "   "))
 * - INSP:"IN-OC/" + oe_no
 */
@Injectable()
export class PostOeToOcService {
  constructor(
    @InjectRepository(OrderEnquiryHeader)
    private readonly oeHeaderRepo: Repository<OrderEnquiryHeader>,
    @InjectRepository(OrderEnquiryDetail)
    private readonly oeDetailRepo: Repository<OrderEnquiryDetail>,
    @InjectRepository(OrderConfirmationHeader)
    private readonly ocHeaderRepo: Repository<OrderConfirmationHeader>,
    @InjectRepository(OrderConfirmationDetail)
    private readonly ocDetailRepo: Repository<OrderConfirmationDetail>,
    private readonly bomService: BomService,
  ) {}

  async post(dto: PostOeToOcDto, userId?: string) {
    const companyCode = (dto.companyCode || '').trim().toUpperCase();
    const oeNos = (dto.oeNos || [])
      .map((x) => String(x || '').trim())
      .filter(Boolean);
    if (!companyCode) throw new BadRequestException('companyCode is required');
    if (!oeNos.length) throw new BadRequestException('oeNos is required');

    const results: { oeNo: string; confNo: string; lines: number }[] = [];

    for (const oeNo of oeNos) {
      const oeHeader = await this.oeHeaderRepo.findOne({ where: { oeNo } });
      if (!oeHeader) throw new BadRequestException(`OE not found: ${oeNo}`);
      if (oeHeader.status === 1)
        throw new BadRequestException(`OE already posted: ${oeNo}`);

      const oeLinesAll = await this.oeDetailRepo.find({
        where: { oeNo },
        order: { lineNo: 'ASC' },
      });
      if (!oeLinesAll.length)
        throw new BadRequestException(`OE has no items: ${oeNo}`);

      // Match company context (legacy uses w_password)
      if (
        oeHeader.compCode &&
        oeHeader.compCode.trim().toUpperCase() !== companyCode
      ) {
        throw new BadRequestException(`OE company mismatch for ${oeNo}`);
      }

      const confNo = this.buildConfNo(companyCode, oeNo);

      // Create or update header (umordhd)
      const ocHeader =
        (await this.ocHeaderRepo.findOne({ where: { confNo } })) ??
        this.ocHeaderRepo.create({
          confNo,
        } as Partial<OrderConfirmationHeader>);

      ocHeader.oeNo = oeNo;
      ocHeader.date = oeHeader.oeDate ?? new Date();
      ocHeader.custNo = oeHeader.custNo;
      ocHeader.reqDateFr = null;
      ocHeader.reqDateTo = null;
      ocHeader.status = 0;
      ocHeader.compCode = companyCode;
      ocHeader.userId = userId;
      await this.ocHeaderRepo.save(ocHeader);

      // Recreate details (umorddt pattern)
      await this.ocDetailRepo.delete({ confNo });

      const ocDetails: OrderConfirmationDetail[] = [];
      let lineNo = 1;

      for (const oeLine of oeLinesAll) {
        // Skip BOM sub-items from OE, and regenerate from BOM definitions during posting (legacy behavior).
        if (oeLine.head === false) {
          const hasBom = await this.bomService.hasBom(oeLine.itemNo);
          if (hasBom) {
            continue;
          }
        }

        const bomComponents = await this.bomService.getComponents(
          oeLine.itemNo,
        );
        const hasBom = bomComponents.length > 0;

        ocDetails.push(
          this.ocDetailRepo.create({
            confNo,
            lineNo,
            oeNo,
            itemNo: oeLine.itemNo,
            vendorNo: oeLine.vendorNo ?? null,
            qty: oeLine.qty,
            ctn: oeLine.ctn ?? null,
            price: oeLine.price ?? null,
            cost: oeLine.cost ?? null,
            poNo: oeHeader.poNo ?? null,
            head: hasBom ? true : false,
            delFrom: oeLine.delFrom ?? null,
            delTo: oeLine.delTo ?? null,
          } as Partial<OrderConfirmationDetail>),
        );
        lineNo += 1;

        if (hasBom) {
          const subQtys = this.bomService.calculateSubItemQtys(
            Number(oeLine.qty),
            bomComponents,
          );
          for (const sub of subQtys) {
            ocDetails.push(
              this.ocDetailRepo.create({
                confNo,
                lineNo,
                oeNo,
                itemNo: sub.subItemNo,
                vendorNo: oeLine.vendorNo ?? null,
                qty: sub.qty,
                ctn: null,
                price: null,
                cost: null,
                poNo: oeHeader.poNo ?? null,
                head: false,
                delFrom: oeLine.delFrom ?? null,
                delTo: oeLine.delTo ?? null,
              } as Partial<OrderConfirmationDetail>),
            );
            lineNo += 1;
          }
        }
      }

      await this.ocDetailRepo.save(ocDetails);

      // Update OE status to Posted
      oeHeader.status = 1;
      await this.oeHeaderRepo.save(oeHeader);

      results.push({ oeNo, confNo, lines: ocDetails.length });
    }

    return { posted: results.length, results };
  }

  private buildConfNo(companyCode: string, oeNo: string) {
    const woeno = oeNo;
    switch (companyCode) {
      case 'HT':
        return `HT-OC/${woeno}`;
      case 'BAT':
        return `BTL-${woeno}`;
      case 'HFW': {
        const stripped = woeno.split('HFW').join('   ').trim();
        return `HFW-OC/${stripped}`;
      }
      case 'INSP':
        return `IN-OC/${woeno}`;
      default:
        throw new BadRequestException(
          `Unsupported companyCode: ${companyCode}`,
        );
    }
  }
}
