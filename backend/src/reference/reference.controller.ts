import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ReferenceService } from './reference.service';
import { Zstdcode } from './entities/zstdcode.entity';
import { Zorigin } from './entities/zorigin.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Reference Controller
 *
 * Implements REST API endpoints for reference data (lookup tables).
 *
 * Reference: Task 03-03 - Reference Tables Schema
 */
@ApiTags('reference')
@Controller('reference')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Get('standard-codes')
  @ApiOperation({ summary: 'Get all standard codes' })
  @ApiResponse({
    status: 200,
    description: 'List of standard codes',
    type: [Zstdcode],
  })
  async getStandardCodes(): Promise<Zstdcode[]> {
    return await this.referenceService.findAllStandardCodes();
  }

  @Get('standard-codes/:stdCode')
  @ApiOperation({ summary: 'Get standard code by code' })
  @ApiParam({
    name: 'stdCode',
    description: 'Standard code',
  })
  @ApiResponse({
    status: 200,
    description: 'Standard code details',
    type: Zstdcode,
  })
  @ApiResponse({
    status: 404,
    description: 'Standard code not found',
  })
  async getStandardCode(@Param('stdCode') stdCode: string): Promise<Zstdcode> {
    return await this.referenceService.findStandardCodeByCode(stdCode);
  }

  @Get('origins')
  @ApiOperation({ summary: 'Get all origins' })
  @ApiResponse({
    status: 200,
    description: 'List of origins',
    type: [Zorigin],
  })
  async getOrigins(): Promise<Zorigin[]> {
    return await this.referenceService.findAllOrigins();
  }

  @Get('origins/:origin')
  @ApiOperation({ summary: 'Get origin by origin code' })
  @ApiParam({
    name: 'origin',
    description: 'Origin code',
  })
  @ApiResponse({
    status: 200,
    description: 'Origin details',
    type: Zorigin,
  })
  @ApiResponse({
    status: 404,
    description: 'Origin not found',
  })
  async getOrigin(@Param('origin') origin: string): Promise<Zorigin> {
    return await this.referenceService.findOriginByCode(origin);
  }

  @Post('origins')
  @ApiOperation({ summary: 'Create a new origin code' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: 'Origin code',
        },
        description: {
          type: 'string',
          description: 'Origin description',
        },
      },
      required: ['origin'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Origin created successfully',
    type: Zorigin,
  })
  @ApiResponse({
    status: 409,
    description: 'Origin code already exists',
  })
  async createOrigin(
    @Body() createDto: { origin: string; description?: string },
  ): Promise<Zorigin> {
    return await this.referenceService.createOrigin(
      createDto.origin,
      createDto.description,
    );
  }
}
