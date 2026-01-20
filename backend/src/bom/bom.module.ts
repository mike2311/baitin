import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductBom } from '../order-enquiry/entities/product-bom.entity';
import { Item } from '../items/entities/item.entity';
import { BomController } from './bom.controller';
import { BomManagementService } from './bom.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductBom, Item])],
  controllers: [BomController],
  providers: [BomManagementService],
  exports: [BomManagementService],
})
export class BomModule {}
