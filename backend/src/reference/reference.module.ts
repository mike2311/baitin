import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferenceController } from './reference.controller';
import { ReferenceService } from './reference.service';
import { Zstdcode } from './entities/zstdcode.entity';
import { Zorigin } from './entities/zorigin.entity';

/**
 * Reference Module
 *
 * Provides reference data (lookup tables) functionality.
 *
 * Reference: Task 03-03 - Reference Tables Schema
 */
@Module({
  imports: [TypeOrmModule.forFeature([Zstdcode, Zorigin])],
  controllers: [ReferenceController],
  providers: [ReferenceService],
  exports: [ReferenceService],
})
export class ReferenceModule {}
