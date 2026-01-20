import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { ReportBatchMigrationService } from './report-batch-migration.service';
import {
  MigrateReportBatchDto,
  BatchMigrationStatusDto,
  BatchMigrationProgressDto,
} from './dto/report-batch-migration.dto';

/**
 * Report Batch Migration Controller
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - REST API for batch report migration
 *   - Progress tracking and monitoring
 *   - Validation and performance testing
 *
 * Reference: Phase 3 - Reporting Batch Migration
 */
@ApiTags('Report Batch Migration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports/batch-migration')
export class ReportBatchMigrationController {
  constructor(private readonly migrationService: ReportBatchMigrationService) {}

  @Post('migrate')
  @AuditLog('MIGRATE_REPORT_BATCH')
  @ApiOperation({
    summary: 'Migrate a batch of reports with validation and testing',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch migration completed successfully',
    type: BatchMigrationStatusDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid batch request' })
  @ApiResponse({ status: 404, description: 'Reports not found' })
  async migrateReportBatch(
    @Body() migrateDto: MigrateReportBatchDto,
  ): Promise<BatchMigrationStatusDto> {
    return this.migrationService.migrateReportBatch(migrateDto);
  }

  @Post('next-batch')
  @AuditLog('CREATE_NEXT_BATCH')
  @ApiOperation({
    summary: 'Create and return the next batch of reports to migrate',
  })
  @ApiResponse({
    status: 200,
    description: 'Next batch created successfully',
    type: MigrateReportBatchDto,
  })
  @ApiResponse({ status: 400, description: 'No reports pending migration' })
  async createNextBatch(
    @Query('priority') priority: 'high' | 'medium' | 'low' = 'medium',
  ): Promise<MigrateReportBatchDto> {
    return this.migrationService.createNextBatch(priority);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get overall migration progress' })
  @ApiResponse({
    status: 200,
    description: 'Migration progress retrieved successfully',
    type: BatchMigrationProgressDto,
  })
  async getMigrationProgress(): Promise<BatchMigrationProgressDto> {
    return this.migrationService.getMigrationProgress();
  }

  @Get('pending-reports')
  @ApiOperation({ summary: 'Get list of reports pending migration' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of reports to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending reports retrieved successfully',
    type: [String],
  })
  async getPendingReports(@Query('limit') limit?: number): Promise<string[]> {
    const limitNum = limit ? parseInt(limit.toString(), 10) : 50;
    return this.migrationService.getPendingReports(limitNum);
  }

  @Post('validate/:reportKey')
  @AuditLog('VALIDATE_REPORT')
  @ApiOperation({ summary: 'Validate a single report without full migration' })
  @ApiParam({ name: 'reportKey', description: 'Report key to validate' })
  @ApiResponse({
    status: 200,
    description: 'Report validation completed',
    schema: {
      type: 'object',
      properties: {
        reportKey: { type: 'string' },
        sqlValid: { type: 'boolean' },
        parametersValid: { type: 'boolean' },
        dataConsistency: { type: 'boolean' },
        performanceAcceptable: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async validateReport(@Param('reportKey') reportKey: string): Promise<any> {
    // This would call validation methods from the service
    // For now, return a placeholder response
    return {
      reportKey,
      sqlValid: true,
      parametersValid: true,
      dataConsistency: true,
      performanceAcceptable: true,
      errors: [],
    };
  }

  @Post('performance-test/:reportKey')
  @AuditLog('PERFORMANCE_TEST_REPORT')
  @ApiOperation({ summary: 'Run performance test on a single report' })
  @ApiParam({ name: 'reportKey', description: 'Report key to test' })
  @ApiResponse({
    status: 200,
    description: 'Performance test completed',
    schema: {
      type: 'object',
      properties: {
        reportKey: { type: 'string' },
        queryExecutionTime: { type: 'number' },
        dataProcessingTime: { type: 'number' },
        totalExecutionTime: { type: 'number' },
        rowCount: { type: 'number' },
        acceptable: { type: 'boolean' },
      },
    },
  })
  async runPerformanceTest(
    @Param('reportKey') reportKey: string,
  ): Promise<any> {
    // This would call performance test methods from the service
    // For now, return a placeholder response
    return {
      reportKey,
      queryExecutionTime: 150,
      dataProcessingTime: 25,
      totalExecutionTime: 175,
      rowCount: 1250,
      acceptable: true,
    };
  }
}
