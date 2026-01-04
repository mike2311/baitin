import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum OrderEnquiryImportFormat {
  STANDARD = 'STANDARD',
  WALMART = 'WALMART',
  CSV_2013 = 'CSV_2013',
  XLS_2013 = 'XLS_2013',
  MULTI_ITEM_BLOCK = 'MULTI_ITEM_BLOCK',
  NEW_FORMAT = 'NEW_FORMAT',
}

export class ImportOrderEnquiryDto {
  @IsString()
  @MaxLength(10)
  companyCode: string; // HT, BAT, INSP, HFW

  @IsOptional()
  @IsEnum(OrderEnquiryImportFormat)
  format?: OrderEnquiryImportFormat;
}
