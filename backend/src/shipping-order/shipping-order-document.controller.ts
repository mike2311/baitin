import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { ShippingOrderDocumentService } from './shipping-order-document.service';
import { GenerateSoDocumentDto } from './dto/generate-so-document.dto';
import { SoDocumentPreviewResponseDto } from './dto/so-document-response.dto';

/**
 * Shipping Order Document Controller
 *
 * Original Logic Reference:
 * - Legacy Form: pso (Print Shipping Order)
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - REST API for SO document generation
 *   - Preview and export functionality
 *
 * Reference: Phase 3 - SO Document Generation
 */
@ApiTags('Shipping Order Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shipping-orders/documents')
export class ShippingOrderDocumentController {
  constructor(private readonly documentService: ShippingOrderDocumentService) {}

  @Post('preview')
  @ApiOperation({ summary: 'Preview SO document data' })
  @ApiResponse({
    status: 200,
    description: 'SO document preview retrieved successfully',
    type: SoDocumentPreviewResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Shipping orders not found' })
  previewSoDocument(@Body() generateDto: GenerateSoDocumentDto) {
    return this.documentService.previewSoDocument(generateDto);
  }

  @Post('generate')
  @AuditLog('GENERATE_SO_DOCUMENT')
  @ApiOperation({ summary: 'Generate SO document file' })
  @ApiResponse({
    status: 200,
    description: 'SO document generated successfully (file download)',
    content: {
      'application/pdf': { schema: { type: 'string', format: 'binary' } },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Shipping orders not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid format' })
  async generateSoDocument(
    @Body() generateDto: GenerateSoDocumentDto,
    @Res() res: Response,
  ) {
    const result = await this.documentService.generateSoDocument(generateDto);

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
