import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
} from 'class-validator';

/**
 * Generate Invoice Document DTO
 *
 * Original Logic Reference:
 * - Legacy Forms: ppacklist_new, ppacklist_xls, ppacklist_xls_spencer, pshadvice, pdebitnote
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - Generate packing list, shipment advice, or debit note
 *   - Support customer-specific formats (e.g., Spencer)
 *   - Weight unit conversion (kg to lbs)
 *
 * Reference: Phase 3 - Invoice Document Generation
 */
export enum InvoiceDocumentType {
  PACKING_LIST = 'packing_list',
  PACKING_LIST_SPENCER = 'packing_list_spencer',
  SHIPMENT_ADVICE = 'shipment_advice',
  DEBIT_NOTE = 'debit_note',
  INVOICE = 'invoice',
}

export class GenerateInvoiceDocumentDto {
  @IsNotEmpty({ message: 'At least one invoice number is required' })
  @IsArray()
  @IsString({ each: true })
  invNos: string[]; // Invoice numbers to include in document

  @IsNotEmpty({ message: 'Document type is required' })
  @IsEnum(InvoiceDocumentType)
  documentType: InvoiceDocumentType; // Type of document to generate

  @IsOptional()
  @IsString()
  outputFormat?: 'pdf' | 'excel' | 'html'; // Output format

  @IsOptional()
  @IsString()
  fileName?: string; // Custom file name

  @IsOptional()
  @IsString()
  containerNo?: string; // Filter by container number (for packing list)
}
