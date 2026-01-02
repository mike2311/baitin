import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataQualityController } from './data-quality.controller'
import { DataQualityService } from './data-quality.service'

/**
 * Data Quality Module
 * 
 * Provides endpoints for data quality management, including:
 * - Tracking orphaned records
 * - Reviewing and resolving data quality issues
 * - Data quality reports and statistics
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([]), // Add entities if needed
  ],
  controllers: [DataQualityController],
  providers: [DataQualityService],
  exports: [DataQualityService],
})
export class DataQualityModule {}

