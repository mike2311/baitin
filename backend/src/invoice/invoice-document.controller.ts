import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { InvoiceDocumentService } from './invoice-document.service';
import { GenerateInvoiceDocumentDto } from './dto/generate-invoice-document.dto';
import { InvoiceDocumentPreviewResponseDto } from './dto/invoice-document-response.dto';

/**
 * Invoice Document Controller
 *
 * Original Logic Reference:
 * - Legacy Forms: ppacklist_new, ppacklist_xls_spencer, pshadvice, pdebitnote
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - REST API for invoice document generation
 *   - Packing list, shipment advice, debit note
 *   - Customer-specific formats (Spencer)
 *
 * Reference: Phase 3 - Invoice Document Generation
 */
@ApiTags('Invoice Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices/documents')
export class InvoiceDocumentController {
  constructor(private readonly documentService: InvoiceDocumentService) {}

  @Post('preview')
  @ApiOperation({ summary: 'Preview invoice document data' })
  @ApiResponse({
    status: 200,
    description: 'Invoice document preview retrieved successfully',
    type: InvoiceDocumentPreviewResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Invoices not found' })
  previewInvoiceDocument(@Body() generateDto: GenerateInvoiceDocumentDto) {
    return this.documentService.previewInvoiceDocument(generateDto);
  }

  @Post('generate')
  @AuditLog('GENERATE_INVOICE_DOCUMENT')
  @ApiOperation({ summary: 'Generate invoice document file' })
  @ApiResponse({
    status: 200,
    description: 'Invoice document generated successfully (file download)',
    content: {
      'application/pdf': { schema: { type: 'string', format: 'binary' } },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Invoices not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid format' })
  async generateInvoiceDocument(
    @Body() generateDto: GenerateInvoiceDocumentDto,
    @Res() res: Response,
  ) {
    const result =
      await this.documentService.generateInvoiceDocument(generateDto);

    // Set headers for file download
    const contentType =
      generateDto.outputFormat === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.fileName}"`,
    );
    res.setHeader('Content-Length', result.fileSize.toString());

    // Return file buffer
    return res.send(result.fileBuffer);
  }
}
