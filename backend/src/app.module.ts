import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ItemsModule } from './items/items.module'
import { CustomersModule } from './customers/customers.module'
import { VendorsModule } from './vendors/vendors.module'
import { User } from './users/entities/user.entity'
import { Item } from './items/entities/item.entity'
import { Customer } from './customers/entities/customer.entity'
import { Vendor } from './vendors/entities/vendor.entity'
import { OrderEnquiryControl } from './order-enquiry/entities/order-enquiry-control.entity'
import { OrderEnquiryHeader } from './order-enquiry/entities/order-enquiry-header.entity'
import { OrderEnquiryDetail } from './order-enquiry/entities/order-enquiry-detail.entity'
import { Zstdcode } from './reference/entities/zstdcode.entity'
import { Zorigin } from './reference/entities/zorigin.entity'

/**
 * Root Application Module
 * 
 * Configures global modules, database connection, and feature modules.
 * 
 * Reference: Task 02-02 - API Foundation
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'baitin_dev',
      password: process.env.DATABASE_PASSWORD || 'baitin_dev_password',
      database: process.env.DATABASE_NAME || 'baitin_poc_dev',
      entities: [
        User,
        Item,
        Customer,
        Vendor,
        OrderEnquiryControl,
        OrderEnquiryHeader,
        OrderEnquiryDetail,
        Zstdcode,
        Zorigin,
      ],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development', // Only for development
      logging: process.env.NODE_ENV === 'development',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ItemsModule,
    CustomersModule,
    VendorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

