import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportingService } from './reporting.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import {
  ReportDefinitionDto,
  ReportPreviewResponseDto,
} from './dto/report-response.dto';

/**
 * Reporting Controller
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - REST API for report generation
 *   - Preview and export functionality
 *
 * Reference: Phase 3 - Reporting Module
 */
@ApiTags('Reporting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all report definitions' })
  @ApiResponse({
    status: 200,
    description: 'Report definitions retrieved successfully',
    type: [ReportDefinitionDto],
  })
  getAllReports() {
    return this.reportingService.getAllReports();
  }

  @Get(':reportKey')
  @ApiOperation({ summary: 'Get report definition by key' })
  @ApiResponse({
    status: 200,
    description: 'Report definition retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiParam({ name: 'reportKey', description: 'Report key' })
  getReportDefinition(@Param('reportKey') reportKey: string) {
    return this.reportingService.getReportDefinition(reportKey);
  }

  @Post(':reportKey/preview')
  @ApiOperation({ summary: 'Preview report data' })
  @ApiResponse({
    status: 200,
    description: 'Report preview retrieved successfully',
    type: ReportPreviewResponseDto,
  })
  @ApiParam({ name: 'reportKey', description: 'Report key' })
  previewReport(
    @Param('reportKey') reportKey: string,
    @Body() generateDto: Omit<GenerateReportDto, 'reportKey'>,
  ) {
    return this.reportingService.previewReport({
      ...generateDto,
      reportKey,
    });
  }

  @Post(':reportKey/generate')
  @ApiOperation({ summary: 'Generate report file' })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully (file download)',
    content: {
      'application/pdf': { schema: { type: 'string', format: 'binary' } },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiParam({ name: 'reportKey', description: 'Report key' })
  async generateReport(
    @Param('reportKey') reportKey: string,
    @Body() generateDto: Omit<GenerateReportDto, 'reportKey'>,
    @Res() res: Response,
  ) {
    const result = await this.reportingService.generateReport({
      ...generateDto,
      reportKey,
    });

    // Set headers for file download
    const contentType =
      result.format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.fileName}"`,
    );
    res.setHeader('Content-Length', result.fileSize.toString());

    // Return file buffer with status 200
    return res.status(200).send(result.fileBuffer);
  }
}
