import { OrderEnquiryImportFormat } from '../dto/import-order-enquiry.dto';

export type ParsedOrderEnquiryLine = {
  oeNo: string;
  itemNo: string;
  qty: number;
  price?: number;
  ctn?: number;
  poNo?: string;
  delFrom?: Date;
  delTo?: Date;
  port?: string;
};

export type ParsedOrderEnquiryImport = {
  format: OrderEnquiryImportFormat;
  companyCode: string;
  lines: ParsedOrderEnquiryLine[];
};

export type ImportFile = {
  originalName: string;
  buffer: Buffer;
};
