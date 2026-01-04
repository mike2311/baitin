import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEnquiryControl } from './entities/order-enquiry-control.entity';
import { OrderEnquiryDetail } from './entities/order-enquiry-detail.entity';
import { OrderEnquiryHeader } from './entities/order-enquiry-header.entity';
import { OrderEnquiryQtyBreakdown } from './entities/order-enquiry-qty-breakdown.entity';
import { ProductBom } from './entities/product-bom.entity';
import { OrderEnquiryImportController } from './order-enquiry-import.controller';
import { OrderEnquiryImportService } from './order-enquiry-import.service';
import { OrderEnquiryQtyBreakdownController } from './order-enquiry-qty-breakdown.controller';
import { OrderEnquiryQtyBreakdownService } from './order-enquiry-qty-breakdown.service';
import { ExcelImportFormatDetector } from './excel-import/excel-import-format-detector';
import { ExcelImportParserRegistry } from './excel-import/excel-import-parser-registry';
import { Csv2013Parser } from './excel-import/parsers/csv-2013.parser';
import { XlsxGenericParser } from './excel-import/parsers/xlsx-generic.parser';
import { BomService } from '../shared/services/bom.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEnquiryControl,
      OrderEnquiryHeader,
      OrderEnquiryDetail,
      OrderEnquiryQtyBreakdown,
      ProductBom,
    ]),
  ],
  controllers: [
    OrderEnquiryImportController,
    OrderEnquiryQtyBreakdownController,
  ],
  providers: [
    OrderEnquiryImportService,
    OrderEnquiryQtyBreakdownService,
    BomService,
    ExcelImportFormatDetector,
    ExcelImportParserRegistry,
    Csv2013Parser,
    XlsxGenericParser,
  ],
  exports: [OrderEnquiryImportService],
})
export class OrderEnquiryModule {}
