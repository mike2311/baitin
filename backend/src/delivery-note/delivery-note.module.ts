import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryNoteService } from './delivery-note.service';
import { DeliveryNoteController } from './delivery-note.controller';
import { DeliveryNoteHeader } from './entities/delivery-note-header.entity';
import { DeliveryNoteDetail } from './entities/delivery-note-detail.entity';
import { DeliveryNoteBreakdown } from './entities/delivery-note-breakdown.entity';

/**
 * Delivery Note Module
 *
 * Original Logic Reference:
 * - Legacy Forms: idn, idnbrk
 * - Documentation: docs/source/03-application-modules/module-inventory.md
 * - Business Rules:
 *   - Complete DN management module
 *   - Integration with SO module
 *   - Loading coordination support
 *   - Foundation for invoice generation
 *
 * Reference: Phase 3 - Delivery Note Module
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryNoteHeader,
      DeliveryNoteDetail,
      DeliveryNoteBreakdown,
    ]),
  ],
  controllers: [DeliveryNoteController],
  providers: [DeliveryNoteService],
  exports: [DeliveryNoteService], // Export for use in other modules
})
export class DeliveryNoteModule {}
