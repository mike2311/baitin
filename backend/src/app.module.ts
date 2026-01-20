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
import { OrderEnquiryQtyBreakdown } from './order-enquiry/entities/order-enquiry-qty-breakdown.entity';
import { ProductBom } from './order-enquiry/entities/product-bom.entity';
import { OrderConfirmationHeader } from './order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from './order-confirmation/entities/order-confirmation-detail.entity';
import { ContractHeader } from './contract/entities/contract-header.entity';
import { ContractDetail } from './contract/entities/contract-detail.entity';
import { ShippingOrder } from './shipping-order/entities/shipping-order.entity';
import { SoFormat } from './shipping-order/entities/so-format.entity';
import { DeliveryNoteHeader } from './delivery-note/entities/delivery-note-header.entity';
import { DeliveryNoteDetail } from './delivery-note/entities/delivery-note-detail.entity';
import { DeliveryNoteBreakdown } from './delivery-note/entities/delivery-note-breakdown.entity';
import { LoadingMaster } from './loading/entities/loading-master.entity';
import { LoadingAdviceHeader } from './loading/entities/loading-advice-header.entity';
import { LoadingAdviceDetail } from './loading/entities/loading-advice-detail.entity';
import { InvoiceHeader } from './invoice/entities/invoice-header.entity';
import { InvoiceDetail } from './invoice/entities/invoice-detail.entity';
import { ReportDefinition } from './reporting/entities/report-definition.entity';
import { Zstdcode } from './reference/entities/zstdcode.entity';
import { Zorigin } from './reference/entities/zorigin.entity';
import { OrderEnquiryModule } from './order-enquiry/order-enquiry.module';
import { OrderConfirmationModule } from './order-confirmation/order-confirmation.module';
import { ContractModule } from './contract/contract.module';
import { BomModule } from './bom/bom.module';
import { ShippingOrderModule } from './shipping-order/shipping-order.module';
import { DeliveryNoteModule } from './delivery-note/delivery-note.module';
import { LoadingModule } from './loading/loading.module';
import { InvoiceModule } from './invoice/invoice.module';
import { EnquiryModule } from './enquiry/enquiry.module';
import { ReportingModule } from './reporting/reporting.module';

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
            OrderEnquiryQtyBreakdown,
            ProductBom,
            OrderConfirmationHeader,
            OrderConfirmationDetail,
            ContractHeader,
            ContractDetail,
            ShippingOrder,
            SoFormat,
            DeliveryNoteHeader,
            DeliveryNoteDetail,
            DeliveryNoteBreakdown,
            LoadingMaster,
            LoadingAdviceHeader,
            LoadingAdviceDetail,
            InvoiceHeader,
            InvoiceDetail,
            ReportDefinition,
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
    OrderEnquiryModule,
    OrderConfirmationModule,
    ContractModule,
    BomModule,
    ShippingOrderModule,
    DeliveryNoteModule,
    LoadingModule,
    InvoiceModule,
    EnquiryModule,
    ReportingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
