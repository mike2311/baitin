import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { CustomersModule } from './customers/customers.module';
import { VendorsModule } from './vendors/vendors.module';
import { ReferenceModule } from './reference/reference.module';
import { DataQualityModule } from './data-quality/data-quality.module';
import { User } from './users/entities/user.entity';
import { Item } from './items/entities/item.entity';
import { Customer } from './customers/entities/customer.entity';
import { Vendor } from './vendors/entities/vendor.entity';
import { OrderEnquiryControl } from './order-enquiry/entities/order-enquiry-control.entity';
import { OrderEnquiryHeader } from './order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from './order-enquiry/entities/order-enquiry-detail.entity';
import { Zstdcode } from './reference/entities/zstdcode.entity';
import { Zorigin } from './reference/entities/zorigin.entity';

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
      envFilePath: ['.env'],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host =
          configService.get<string>('DATABASE_HOST') ||
          process.env.DATABASE_HOST ||
          'localhost';
        const port = parseInt(
          configService.get<string>('DATABASE_PORT') ||
            process.env.DATABASE_PORT ||
            '5432',
          10,
        );
        const username =
          configService.get<string>('DATABASE_USER') ||
          process.env.DATABASE_USER ||
          'baitin_dev';
        const password =
          configService.get<string>('DATABASE_PASSWORD') ||
          process.env.DATABASE_PASSWORD ||
          'baitin_dev_password';
        const database =
          configService.get<string>('DATABASE_NAME') ||
          process.env.DATABASE_NAME ||
          'baitin_poc_dev';

        return {
          type: 'postgres' as const,
          host,
          port,
          username,
          password,
          database,
          ssl: host.includes('supabase.co')
            ? { rejectUnauthorized: false }
            : false,
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
          synchronize: false, // Disabled - use migrations instead to avoid startup delays
          logging: configService.get('NODE_ENV') === 'development',
          connectTimeoutMS: 10000, // 10 second connection timeout
          extra: {
            max: 10, // Maximum pool size
            connectionTimeoutMillis: 10000, // 10 second connection timeout
            idleTimeoutMillis: 30000, // 30 second idle timeout
          },
        };
      },
    }),
    AuthModule,
    UsersModule,
    ItemsModule,
    CustomersModule,
    VendorsModule,
    ReferenceModule,
    DataQualityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
