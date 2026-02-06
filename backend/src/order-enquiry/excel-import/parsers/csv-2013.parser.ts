import { BadRequestException, Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { OrderEnquiryImportFormat } from '../../dto/import-order-enquiry.dto';
import {
  ImportFile,
  ParsedOrderEnquiryImport,
  ParsedOrderEnquiryLine,
} from '../types';

/**
 * CSV 2013 Parser (legacy: uoexls_2013.prg CSV path)
 *
 * Original Logic Reference:
 * - Documentation: docs/source/03-application-modules/order-enquiry-module.md (CSV Format (2013))
 *
 * Notes:
 * - Legacy supports dynamic field detection; Phase 2 MVP parser uses header-based mapping.
 * - Expected columns (case-insensitive): OE_NO, ITEM_NO, QTY, PRICE, PO_NO, PORT, DEL_FROM, DEL_TO.
 */
@Injectable()
export class Csv2013Parser {
  supports(format: OrderEnquiryImportFormat): boolean {
    return format === OrderEnquiryImportFormat.CSV_2013;
  }

  parse(
    file: ImportFile,
    companyCode: string,
    format: OrderEnquiryImportFormat,
  ): ParsedOrderEnquiryImport {
    const text = file.buffer.toString('utf8');
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    const lines: ParsedOrderEnquiryLine[] = records.map((r) => {
      const get = (key: string, alternatives: string[] = []) => {
        const allKeys = [key, ...alternatives];
        const foundKey = Object.keys(r).find((k) => {
          const kLower = k
            .trim()
            .toLowerCase()
            .replace(/[_\s-]/g, '');
          return allKeys.some((searchKey) => {
            const searchLower = searchKey.toLowerCase().replace(/[_\s-]/g, '');
            return (
              kLower === searchLower ||
              kLower.includes(searchLower) ||
              searchLower.includes(kLower)
            );
          });
        });
        return foundKey ? (r[foundKey] ?? '').trim() : '';
      };

      const oeNo = get('oe_no', [
        'oe number',
        'oe',
        'order enquiry number',
        'order enquiry',
      ]);
      const itemNo = get('item_no', [
        'item number',
        'item',
        'item code',
        'itemcode',
      ]);
      const qty = Number(get('qty', ['quantity', 'qty', 'qty.', 'qty_']));

      if (!oeNo || !itemNo || !Number.isFinite(qty)) {
        throw new BadRequestException(
          'CSV_2013 missing required fields (oe_no, item_no, qty)',
        );
      }

      const priceStr = get('price', [
        'unit price',
        'price',
        'unitprice',
        'unit_price',
      ]);
      const delFromStr = get('del_from', [
        'delivery from',
        'deliveryfrom',
        'del from',
        'delivery date from',
      ]);
      const delToStr = get('del_to', [
        'delivery to',
        'deliveryto',
        'del to',
        'delivery date to',
      ]);

      const line: ParsedOrderEnquiryLine = {
        oeNo,
        itemNo,
        qty,
        price: priceStr ? Number(priceStr) : undefined,
        poNo: get('po_no') || undefined,
        port: get('port') || undefined,
        delFrom: delFromStr ? new Date(delFromStr) : undefined,
        delTo: delToStr ? new Date(delToStr) : undefined,
      };

      return line;
    });

    return { format, companyCode, lines };
  }
}
