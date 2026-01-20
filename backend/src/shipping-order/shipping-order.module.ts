import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingOrderService } from './shipping-order.service';
import { ShippingOrderController } from './shipping-order.controller';
import { ShippingOrderDocumentService } from './shipping-order-document.service';
import { ShippingOrderDocumentController } from './shipping-order-document.controller';
import { ShippingOrder } from './entities/shipping-order.entity';
import { SoFormat } from './entities/so-format.entity';

/**
 * Shipping Order Module
 *
 * Original Logic Reference:
 * - Legacy Forms: isetso, pso
 * - Documentation: docs/source/03-application-modules/module-inventory.md
 * - Business Rules:
 *   - Complete SO management module
 *   - Integration with OC/Contract modules
 *   - Customer-specific format support
 *   - Foundation for invoice generation
 *
 * Reference: Phase 3 - Shipping Order Module
 */
@Module({
  imports: [TypeOrmModule.forFeature([ShippingOrder, SoFormat])],
  controllers: [ShippingOrderController, ShippingOrderDocumentController],
  providers: [ShippingOrderService, ShippingOrderDocumentService],
  exports: [ShippingOrderService], // Export for use in other modules
})
export class ShippingOrderModule {}
