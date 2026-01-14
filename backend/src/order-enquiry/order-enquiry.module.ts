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
import { OrderEnquiryControlController } from './order-enquiry-control.controller';
import { OrderEnquiryControlService } from './order-enquiry-control.service';
import { OrderEnquiryController } from './order-enquiry.controller';
import { OrderEnquiryService } from './order-enquiry.service';
import { ExcelImportFormatDetector } from './excel-import/excel-import-format-detector';
import { ExcelImportParserRegistry } from './excel-import/excel-import-parser-registry';
import { Csv2013Parser } from './excel-import/parsers/csv-2013.parser';
import { XlsxGenericParser } from './excel-import/parsers/xlsx-generic.parser';
import { BomService } from '../shared/services/bom.service';
import { Customer } from '../customers/entities/customer.entity';
import { Item } from '../items/entities/item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEnquiryControl,
      OrderEnquiryHeader,
      OrderEnquiryDetail,
      OrderEnquiryQtyBreakdown,
      ProductBom,
      Customer,
      Item,
    ]),
  ],
  controllers: [
    OrderEnquiryImportController,
    OrderEnquiryQtyBreakdownController,
    OrderEnquiryControlController,
    OrderEnquiryController,
  ],
  providers: [
    OrderEnquiryImportService,
    OrderEnquiryQtyBreakdownService,
    OrderEnquiryControlService,
    OrderEnquiryService,
    BomService,
    ExcelImportFormatDetector,
    ExcelImportParserRegistry,
    Csv2013Parser,
    XlsxGenericParser,
  ],
  exports: [OrderEnquiryImportService],
})
export class OrderEnquiryModule {}
