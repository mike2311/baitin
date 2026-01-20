import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoadingService } from './loading.service';
import {
  CreateLoadingMasterDto,
  CreateLoadingAdviceDto,
} from './dto/create-loading-master.dto';
import { LoadingMaster } from './entities/loading-master.entity';
import { LoadingAdviceHeader } from './entities/loading-advice-header.entity';

/**
 * Loading Controller
 *
 * Original Logic Reference:
 * - Legacy Forms: iload, isetla, pla
 * - Documentation: docs/source/04-forms-and-screens/delivery-note-forms.md
 * - Business Rules:
 *   - REST API for loading coordination
 *   - Support for creating loading masters and advice
 *   - DN assignment and status updates
 *
 * Reference: Phase 3 - Loading Module
 */
@ApiTags('Loading')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loading')
export class LoadingController {
  constructor(private readonly loadingService: LoadingService) {}

  @Post('master')
  @ApiOperation({ summary: 'Create a loading master' })
  @ApiResponse({
    status: 201,
    description: 'Loading master created successfully',
    type: LoadingMaster,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Loading master already exists' })
  createLoadingMaster(@Body() createDto: CreateLoadingMasterDto) {
    return this.loadingService.createLoadingMaster(createDto);
  }

  @Post('advice')
  @ApiOperation({ summary: 'Create a loading advice' })
  @ApiResponse({
    status: 201,
    description: 'Loading advice created successfully',
    type: LoadingAdviceHeader,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Loading master not found' })
  createLoadingAdvice(@Body() createDto: CreateLoadingAdviceDto) {
    return this.loadingService.createLoadingAdvice(createDto);
  }

  @Get('master')
  @ApiOperation({ summary: 'Search loading masters' })
  @ApiResponse({
    status: 200,
    description: 'Loading masters retrieved successfully',
    type: [LoadingMaster],
  })
  @ApiQuery({
    name: 'loadingNo',
    required: false,
    description: 'Loading number filter',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Date from (ISO date)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Date to (ISO date)',
  })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter' })
  searchLoadingMasters(
    @Query('loadingNo') loadingNo?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
  ) {
    const query = {
      loadingNo,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      status,
    };
    return this.loadingService.searchLoadingMasters(query);
  }

  @Get('master/:loadingNo')
  @ApiOperation({ summary: 'Get loading master by loading number' })
  @ApiResponse({
    status: 200,
    description: 'Loading master retrieved successfully',
    type: LoadingMaster,
  })
  @ApiResponse({ status: 404, description: 'Loading master not found' })
  @ApiParam({ name: 'loadingNo', description: 'Loading master number' })
  findLoadingMaster(@Param('loadingNo') loadingNo: string) {
    return this.loadingService.findLoadingMaster(loadingNo);
  }

  @Get('master/:loadingNo/dns')
  @ApiOperation({ summary: 'Get DNs assigned to loading master' })
  @ApiResponse({
    status: 200,
    description: 'DNs retrieved successfully',
  })
  @ApiParam({ name: 'loadingNo', description: 'Loading master number' })
  getDnsForLoading(@Param('loadingNo') loadingNo: string) {
    return this.loadingService.getDnsForLoading(loadingNo);
  }

  @Get('advice/:laNo')
  @ApiOperation({ summary: 'Get loading advice by LA number' })
  @ApiResponse({
    status: 200,
    description: 'Loading advice retrieved successfully',
    type: LoadingAdviceHeader,
  })
  @ApiResponse({ status: 404, description: 'Loading advice not found' })
  @ApiParam({ name: 'laNo', description: 'Loading Advice number' })
  findLoadingAdvice(@Param('laNo') laNo: string) {
    return this.loadingService.findLoadingAdvice(laNo);
  }

  @Patch('master/:loadingNo/status')
  @ApiOperation({ summary: 'Update loading master status' })
  @ApiResponse({
    status: 200,
    description: 'Loading master status updated successfully',
    type: LoadingMaster,
  })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiParam({ name: 'loadingNo', description: 'Loading master number' })
  updateLoadingMasterStatus(
    @Param('loadingNo') loadingNo: string,
    @Body('status') status: string,
  ) {
    return this.loadingService.updateLoadingMasterStatus(loadingNo, status);
  }

  @Post('master/:loadingNo/assign-dns')
  @ApiOperation({ summary: 'Assign DNs to loading master' })
  @ApiResponse({
    status: 200,
    description: 'DNs assigned successfully',
  })
  @ApiResponse({ status: 404, description: 'Loading master or DN not found' })
  @ApiParam({ name: 'loadingNo', description: 'Loading master number' })
  assignDnsToLoading(
    @Param('loadingNo') loadingNo: string,
    @Body('dnNos') dnNos: string[],
  ) {
    return this.loadingService.assignDnsToLoading(loadingNo, dnNos);
  }
}
