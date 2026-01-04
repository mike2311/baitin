import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractHeader } from './entities/contract-header.entity';
import { ContractDetail } from './entities/contract-detail.entity';
import { OrderConfirmationHeader } from '../order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../order-confirmation/entities/order-confirmation-detail.entity';
import { ProductBom } from '../order-enquiry/entities/product-bom.entity';
import { BomService } from '../shared/services/bom.service';
import { ContractGenerationService } from './services/contract-generation.service';
import { ContractGenerationController } from './contract-generation.controller';
import { ContractController } from './contract.controller';
import { ContractService } from './services/contract.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractHeader,
      ContractDetail,
      OrderConfirmationHeader,
      OrderConfirmationDetail,
      ProductBom,
    ]),
  ],
  controllers: [ContractGenerationController, ContractController],
  providers: [ContractGenerationService, ContractService, BomService],
  exports: [ContractGenerationService, ContractService],
})
export class ContractModule {}
