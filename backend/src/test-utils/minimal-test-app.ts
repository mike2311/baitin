import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Entities
import { User } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Item } from '../items/entities/item.entity';
import { ProductBom } from '../order-enquiry/entities/product-bom.entity';
import { OrderEnquiryControl } from '../order-enquiry/entities/order-enquiry-control.entity';
import { OrderEnquiryHeader } from '../order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from '../order-enquiry/entities/order-enquiry-detail.entity';
import { OrderEnquiryQtyBreakdown } from '../order-enquiry/entities/order-enquiry-qty-breakdown.entity';
import { OrderConfirmationHeader } from '../order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../order-confirmation/entities/order-confirmation-detail.entity';
import { ContractHeader } from '../contract/entities/contract-header.entity';
import { ContractDetail } from '../contract/entities/contract-detail.entity';
import { Zstdcode } from '../reference/entities/zstdcode.entity';
import { Zorigin } from '../reference/entities/zorigin.entity';
import { ShippingOrder } from '../shipping-order/entities/shipping-order.entity';
import { SoFormat } from '../shipping-order/entities/so-format.entity';
import { DeliveryNoteHeader } from '../delivery-note/entities/delivery-note-header.entity';
import { DeliveryNoteDetail } from '../delivery-note/entities/delivery-note-detail.entity';
import { DeliveryNoteBreakdown } from '../delivery-note/entities/delivery-note-breakdown.entity';
import { LoadingMaster } from '../loading/entities/loading-master.entity';
import { LoadingAdviceHeader } from '../loading/entities/loading-advice-header.entity';
import { LoadingAdviceDetail } from '../loading/entities/loading-advice-detail.entity';
import { InvoiceHeader } from '../invoice/entities/invoice-header.entity';
import { InvoiceDetail } from '../invoice/entities/invoice-detail.entity';
import { ReportDefinition } from '../reporting/entities/report-definition.entity';

// Modules  
import { BomModule } from '../bom/bom.module';
import { ItemsModule } from '../items/items.module';
import { CustomersModule } from '../customers/customers.module';
import { VendorsModule } from '../vendors/vendors.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { OrderEnquiryModule } from '../order-enquiry/order-enquiry.module';
import { OrderConfirmationModule } from '../order-confirmation/order-confirmation.module';
import { ContractModule } from '../contract/contract.module';
import { ReferenceModule } from '../reference/reference.module';
import { ShippingOrderModule } from '../shipping-order/shipping-order.module';
import { DeliveryNoteModule } from '../delivery-note/delivery-note.module';
import { LoadingModule } from '../loading/loading.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { EnquiryModule } from '../enquiry/enquiry.module';
import { ReportingModule } from '../reporting/reporting.module';

export async function createMinimalTestApp(): Promise<{
  app: INestApplication;
  moduleRef: TestingModule;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
      }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5433,
        username: 'postgres',
        password: 'postgres',
        database: 'baitin_test',
        dropSchema: false, // Don't drop schema on every test - causes conflicts
        synchronize: true, // Still sync schema changes
        entities: [
          User,
          Customer,
          Vendor,
          Item,
          ProductBom,
          OrderEnquiryControl,
          OrderEnquiryHeader,
          OrderEnquiryDetail,
          OrderEnquiryQtyBreakdown,
          OrderConfirmationHeader,
          OrderConfirmationDetail,
          ContractHeader,
          ContractDetail,
          Zstdcode,
          Zorigin,
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
        ],
        logging: false,
      }),
      PassportModule,
      JwtModule.register({
        secret: 'test-secret-key',
        signOptions: { expiresIn: '1h' },
      }),
      AuthModule,
      UsersModule,
      BomModule,
      ItemsModule,
      CustomersModule,
      VendorsModule,
      OrderEnquiryModule,
      OrderConfirmationModule,
      ContractModule,
      ReferenceModule,
      ShippingOrderModule,
      DeliveryNoteModule,
      LoadingModule,
      InvoiceModule,
      EnquiryModule,
      ReportingModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Set global API prefix (matching main.ts)
  app.setGlobalPrefix('api');
  
  // Enable CORS for tests
  app.enableCors();
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();

  return { app, moduleRef: moduleFixture };
}
