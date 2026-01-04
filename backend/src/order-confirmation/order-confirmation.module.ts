import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderConfirmationHeader } from './entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from './entities/order-confirmation-detail.entity';
import { OrderEnquiryHeader } from '../order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from '../order-enquiry/entities/order-enquiry-detail.entity';
import { BomService } from '../shared/services/bom.service';
import { ProductBom } from '../order-enquiry/entities/product-bom.entity';
import { PostOeToOcService } from './services/post-oe-to-oc.service';
import { OrderConfirmationPostController } from './order-confirmation-post.controller';
import { OrderConfirmationController } from './order-confirmation.controller';
import { OrderConfirmationService } from './services/order-confirmation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderConfirmationHeader,
      OrderConfirmationDetail,
      OrderEnquiryHeader,
      OrderEnquiryDetail,
      ProductBom,
    ]),
  ],
  controllers: [OrderConfirmationPostController, OrderConfirmationController],
  providers: [PostOeToOcService, OrderConfirmationService, BomService],
  exports: [PostOeToOcService],
})
export class OrderConfirmationModule {}
