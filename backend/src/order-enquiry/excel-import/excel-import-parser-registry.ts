import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderEnquiryImportFormat } from '../dto/import-order-enquiry.dto';
import { Csv2013Parser } from './parsers/csv-2013.parser';
import { XlsxGenericParser } from './parsers/xlsx-generic.parser';
import { ImportFile, ParsedOrderEnquiryImport } from './types';

export interface OrderEnquiryImportParser {
  supports(format: OrderEnquiryImportFormat): boolean;
  parse(
    file: ImportFile,
    companyCode: string,
    format: OrderEnquiryImportFormat,
  ): ParsedOrderEnquiryImport;
}

@Injectable()
export class ExcelImportParserRegistry {
  constructor(
    private readonly csv2013: Csv2013Parser,
    private readonly xlsxGeneric: XlsxGenericParser,
  ) {}

  get(format: OrderEnquiryImportFormat): OrderEnquiryImportParser {
    // For Phase 2 MVP we implement:
    // - CSV_2013 via Csv2013Parser
    // - XLS_2013 and other XLSX-based layouts via XlsxGenericParser (best-effort header mapping)
    if (this.csv2013.supports(format)) return this.csv2013;
    if (this.xlsxGeneric.supports(format)) return this.xlsxGeneric;
    throw new BadRequestException(`Unsupported import format: ${format}`);
  }

  parse(
    file: ImportFile,
    companyCode: string,
    format: OrderEnquiryImportFormat,
  ): ParsedOrderEnquiryImport {
    return this.get(format).parse(file, companyCode, format);
  }
}
