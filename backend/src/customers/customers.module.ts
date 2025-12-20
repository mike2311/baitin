import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CustomersController } from './customers.controller'
import { CustomersService } from './customers.service'
import { Customer } from './entities/customer.entity'

/**
 * Customers Module
 * 
 * Provides customer master data management functionality.
 * 
 * Reference: Task 02-01 - Customer Entry Form
 */
@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}

