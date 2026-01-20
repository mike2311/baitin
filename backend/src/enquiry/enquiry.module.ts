import { Module } from '@nestjs/common';
import { EnquiryService } from './enquiry.service';
import { EnquiryController } from './enquiry.controller';

/**
 * Enquiry Module
 *
 * Original Logic Reference:
 * - Legacy Forms: Various enquiry forms (40+ enquiry forms)
 * - Documentation: docs/source/03-application-modules/module-inventory.md
 * - Business Rules:
 *   - Read-only enquiry module
 *   - Sales analysis and operational enquiries
 *   - Export functionality support
 *
 * Reference: Phase 3 - Enquiry Module
 */
@Module({
  controllers: [EnquiryController],
  providers: [EnquiryService],
  exports: [EnquiryService], // Export for use in other modules
})
export class EnquiryModule {}