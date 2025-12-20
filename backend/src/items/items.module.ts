import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ItemsController } from './items.controller'
import { ItemsService } from './items.service'
import { Item } from './entities/item.entity'
import { Zstdcode } from '../reference/entities/zstdcode.entity'
import { Zorigin } from '../reference/entities/zorigin.entity'

/**
 * Items Module
 * 
 * Provides item master data management functionality.
 * 
 * Features:
 * - Item CRUD operations
 * - Item search/lookup
 * - Validation against reference tables
 * 
 * Original Logic Reference:
 * - FoxPro Form: iitem.scx (Input Item Detail)
 * - Documentation: docs/source/02-business-processes/master-data-management.md lines 9-163
 * 
 * Reference: Task 01-01 - Item Entry Form
 */
@Module({
  imports: [TypeOrmModule.forFeature([Item, Zstdcode, Zorigin])],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}

