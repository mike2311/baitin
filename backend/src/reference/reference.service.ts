import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zstdcode } from './entities/zstdcode.entity';
import { Zorigin } from './entities/zorigin.entity';

/**
 * Reference Service
 *
 * Implements reference data (lookup tables) read operations.
 *
 * Reference: Task 03-03 - Reference Tables Schema
 */
@Injectable()
export class ReferenceService {
  constructor(
    @InjectRepository(Zstdcode)
    private readonly zstdcodeRepository: Repository<Zstdcode>,
    @InjectRepository(Zorigin)
    private readonly zoriginRepository: Repository<Zorigin>,
  ) {}

  /**
   * Get all standard codes
   */
  async findAllStandardCodes(): Promise<Zstdcode[]> {
    return await this.zstdcodeRepository.find({
      order: { stdCode: 'ASC' },
    });
  }

  /**
   * Get standard code by code
   */
  async findStandardCodeByCode(stdCode: string): Promise<Zstdcode> {
    const code = await this.zstdcodeRepository.findOne({
      where: { stdCode },
    });

    if (!code) {
      throw new NotFoundException(`Standard code '${stdCode}' not found`);
    }

    return code;
  }

  /**
   * Get all origins
   */
  async findAllOrigins(): Promise<Zorigin[]> {
    return await this.zoriginRepository.find({
      order: { origin: 'ASC' },
    });
  }

  /**
   * Get origin by origin code
   */
  async findOriginByCode(origin: string): Promise<Zorigin> {
    const originCode = await this.zoriginRepository.findOne({
      where: { origin },
    });

    if (!originCode) {
      throw new NotFoundException(`Origin '${origin}' not found`);
    }

    return originCode;
  }

  /**
   * Create a new origin code
   */
  async createOrigin(origin: string, description?: string): Promise<Zorigin> {
    // Check if origin already exists
    const existing = await this.zoriginRepository.findOne({
      where: { origin },
    });

    if (existing) {
      throw new ConflictException(`Origin code '${origin}' already exists`);
    }

    const newOrigin = this.zoriginRepository.create({
      origin,
      description: description || null,
    });

    return await this.zoriginRepository.save(newOrigin);
  }
}
