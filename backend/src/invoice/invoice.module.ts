import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceValidationService } from './invoice-validation.service';
import { InvoiceValidationController } from './invoice-validation.controller';
import { InvoiceDocumentService } from './invoice-document.service';
import { InvoiceDocumentController } from './invoice-document.controller';
import { InvoiceHeader } from './entities/invoice-header.entity';
import { InvoiceDetail } from './entities/invoice-detail.entity';

/**
 * Invoice Module
 *
 * Original Logic Reference:
 * - Legacy Forms: iinvhd@, iinvdt2@
 * - Documentation: docs/source/03-application-modules/module-inventory.md
 * - Business Rules:
 *   - Complete invoice management module
 *   - Integration with SO/DN modules
 *   - Container/ref-driven item selection
 *   - Foundation for packing list generation
 *
 * Reference: Phase 3 - Invoice Module
 */
@Module({
  imports: [TypeOrmModule.forFeature([InvoiceHeader, InvoiceDetail])],
  controllers: [
    InvoiceController,
    InvoiceValidationController,
    InvoiceDocumentController,
  ],
  providers: [InvoiceService, InvoiceValidationService, InvoiceDocumentService],
  exports: [InvoiceService], // Export for use in other modules
})
export class InvoiceModule {}
