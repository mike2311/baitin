import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { DataQualityService } from './data-quality.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Data Quality Controller
 *
 * REST API endpoints for data quality management.
 *
 * Endpoints:
 * - GET /api/data-quality/summary - Get summary statistics
 * - GET /api/data-quality/issues - List all issues
 * - GET /api/data-quality/issues/:id - Get issue details
 * - PUT /api/data-quality/issues/:id - Update issue status
 * - POST /api/data-quality/issues/:id/resolve - Resolve an issue
 */
@ApiTags('data-quality')
@Controller('data-quality')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DataQualityController {
  constructor(private readonly dataQualityService: DataQualityService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get data quality summary statistics' })
  @ApiResponse({
    status: 200,
    description: 'Data quality summary',
  })
  async getSummary() {
    return await this.dataQualityService.getSummary();
  }

  @Get('issues')
  @ApiOperation({ summary: 'Get all data quality issues' })
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      'Filter by status (pending, in_review, resolved, approved_as_is)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of data quality issues',
  })
  async getIssues(@Query('status') status?: string) {
    return await this.dataQualityService.getIssues(status);
  }

  @Get('issues/:id')
  @ApiOperation({ summary: 'Get specific issue by ID' })
  @ApiParam({
    name: 'id',
    description: 'Issue ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Issue details',
  })
  @ApiResponse({
    status: 404,
    description: 'Issue not found',
  })
  async getIssue(@Param('id', ParseIntPipe) id: number) {
    return await this.dataQualityService.getIssue(id);
  }

  @Put('issues/:id')
  @ApiOperation({ summary: 'Update issue status' })
  @ApiParam({
    name: 'id',
    description: 'Issue ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'in_review', 'resolved', 'approved_as_is'],
        },
        notes: {
          type: 'string',
        },
        resolvedBy: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Issue updated',
  })
  async updateIssue(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: { status: string; notes?: string; resolvedBy?: string },
  ) {
    return await this.dataQualityService.updateIssue(
      id,
      updateDto.status,
      updateDto.notes,
      updateDto.resolvedBy,
    );
  }

  @Post('issues/:id/resolve')
  @ApiOperation({ summary: 'Resolve an issue' })
  @ApiParam({
    name: 'id',
    description: 'Issue ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notes: {
          type: 'string',
        },
        resolvedBy: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Issue resolved',
  })
  async resolveIssue(
    @Param('id', ParseIntPipe) id: number,
    @Body() resolveDto: { notes?: string; resolvedBy?: string },
  ) {
    return await this.dataQualityService.resolveIssue(
      id,
      resolveDto.notes,
      resolveDto.resolvedBy,
    );
  }
}
