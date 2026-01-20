import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoadingService } from './loading.service';
import { LoadingController } from './loading.controller';
import { LoadingMaster } from './entities/loading-master.entity';
import { LoadingAdviceHeader } from './entities/loading-advice-header.entity';
import { LoadingAdviceDetail } from './entities/loading-advice-detail.entity';
/**
 * Loading Module
 *
 * Original Logic Reference:
 * - Legacy Forms: iload, isetla, pla
 * - Documentation: docs/source/03-application-modules/module-inventory.md
 * - Business Rules:
 *   - Complete loading coordination module
 *   - Integration with DN module (via direct queries)
 *   - Container assignment and tracking
 *
 * Reference: Phase 3 - Loading Module
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoadingMaster,
      LoadingAdviceHeader,
      LoadingAdviceDetail,
    ]),
    // Note: Not importing DeliveryNoteModule to avoid circular dependency
    // DN status updates done via direct DataSource queries
  ],
  controllers: [LoadingController],
  providers: [LoadingService],
  exports: [LoadingService], // Export for use in other modules
})
export class LoadingModule {}