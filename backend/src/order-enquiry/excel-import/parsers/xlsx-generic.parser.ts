import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { OrderEnquiryImportFormat } from '../../dto/import-order-enquiry.dto';
import {
  ImportFile,
  ParsedOrderEnquiryImport,
  ParsedOrderEnquiryLine,
} from '../types';

/**
 * Generic XLS/XLSX parser.
 *
 * Original Logic Reference:
 * - Documentation: docs/source/03-application-modules/order-enquiry-module.md (Standard/Walmart/XLS 2013/Multi-Item Block/New Format)
 *
 * Notes:
 * - Legacy uses separate programs per format; for Phase 2 MVP we provide a best-effort header mapping.
 * - Required fields: OE number, Item number, Quantity.
 */
@Injectable()
export class XlsxGenericParser {
  supports(format: OrderEnquiryImportFormat): boolean {
    return (
      format === OrderEnquiryImportFormat.STANDARD ||
      format === OrderEnquiryImportFormat.WALMART ||
      format === OrderEnquiryImportFormat.XLS_2013 ||
      format === OrderEnquiryImportFormat.MULTI_ITEM_BLOCK ||
      format === OrderEnquiryImportFormat.NEW_FORMAT
    );
  }

  parse(
    file: ImportFile,
    companyCode: string,
    format: OrderEnquiryImportFormat,
  ): ParsedOrderEnquiryImport {
    const wb = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    if (!ws) throw new BadRequestException('No worksheet found in Excel file');

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: '',
    });

    const headerKeys = rows.length ? Object.keys(rows[0]) : [];
    const col = (candidates: string[]) =>
      headerKeys.find((k) =>
        candidates.some((c) => normalize(k).includes(normalize(c))),
      );

    const oeCol = col([
      'oe',
      'oe no',
      'order enquiry',
      'order_enquiry',
      'oe_no',
    ]);
    const itemCol = col([
      'item',
      'item no',
      'item_no',
      'item#',
      'item #',
      'sku',
      'skn',
    ]);
    const qtyCol = col(['qty', 'quantity', 'total qty', 'total_quantity']);
    const priceCol = col(['price', 'unit price', 'unit_price', 'cost']);
    const poCol = col(['po', 'po no', 'po_no', 'purchase order']);
    const portCol = col(['port', 'port code', 'port_code']);
    const delFromCol = col([
      'del from',
      'ship from',
      'delivery from',
      'del_from',
    ]);
    const delToCol = col(['del to', 'ship to', 'delivery to', 'del_to']);

    if (!oeCol || !itemCol || !qtyCol) {
      throw new BadRequestException(
        'Excel file missing required columns (OE, ITEM, QTY). For Phase 2 MVP, include recognizable headers.',
      );
    }

    const lines: ParsedOrderEnquiryLine[] = rows
      .map((r) => {
        const oeNo = String(r[oeCol] ?? '').trim();
        const itemNo = String(r[itemCol] ?? '').trim();
        const qty = Number(r[qtyCol]);
        if (!oeNo || !itemNo || !Number.isFinite(qty)) return null;

        const line: ParsedOrderEnquiryLine = {
          oeNo,
          itemNo,
          qty,
          price: priceCol ? toNumber(r[priceCol]) : undefined,
          poNo: poCol ? String(r[poCol] ?? '').trim() || undefined : undefined,
          port: portCol
            ? String(r[portCol] ?? '').trim() || undefined
            : undefined,
          delFrom: delFromCol ? toDate(r[delFromCol]) : undefined,
          delTo: delToCol ? toDate(r[delToCol]) : undefined,
        };
        return line;
      })
      .filter((x): x is ParsedOrderEnquiryLine => Boolean(x));

    if (lines.length === 0) {
      throw new BadRequestException('No valid OE lines found in Excel file');
    }

    return { format, companyCode, lines };
  }
}

function normalize(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toDate(v: unknown): Date | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (v instanceof Date) return v;
  const n = Number(v);
  // Excel date serials are numbers; xlsx may already convert but we handle just in case.
  if (Number.isFinite(n) && n > 20000) {
    const d = XLSX.SSF.parse_date_code(n);
    if (d) return new Date(Date.UTC(d.y, d.m - 1, d.d));
  }
  const parsed = new Date(String(v));
  return Number.isFinite(parsed.getTime()) ? parsed : undefined;
}
