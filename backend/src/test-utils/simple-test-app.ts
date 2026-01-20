import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Import all entities
import { User } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Item } from '../items/entities/item.entity';
import { OrderEnquiryControl } from '../order-enquiry/entities/order-enquiry-control.entity';
import { OrderEnquiryHeader } from '../order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from '../order-enquiry/entities/order-enquiry-detail.entity';
import { OrderEnquiryQtyBreakdown } from '../order-enquiry/entities/order-enquiry-qty-breakdown.entity';
import { ProductBom } from '../order-enquiry/entities/product-bom.entity';
import { OrderConfirmationHeader } from '../order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../order-confirmation/entities/order-confirmation-detail.entity';
import { ContractHeader } from '../contract/entities/contract-header.entity';
import { ContractDetail } from '../contract/entities/contract-detail.entity';
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
import { Zstdcode } from '../reference/entities/zstdcode.entity';
import { Zorigin } from '../reference/entities/zorigin.entity';

// Import necessary modules
import { BomModule } from '../bom/bom.module';
import { ItemsModule } from '../items/items.module';
import { CustomersModule } from '../customers/customers.module';
import { VendorsModule } from '../vendors/vendors.module';

/**
 * Simple Test App Creator
 * Creates a minimal NestJS app for testing without AppModule conflicts
 */
export async function createSimpleTestApp(): Promise<{
  app: INestApplication;
  moduleRef: TestingModule;
}> {
  const testDbPort = parseInt(process.env.TEST_DATABASE_PORT || '5433', 10);

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
      }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: testDbPort,
        username: 'postgres',
        password: 'postgres',
        database: 'baitin_test',
        dropSchema: true,
        synchronize: true,
        entities: [
          User,
          Customer,
          Vendor,
          Item,
          OrderEnquiryControl,
          OrderEnquiryHeader,
          OrderEnquiryDetail,
          OrderEnquiryQtyBreakdown,
          ProductBom,
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
      BomModule,
      ItemsModule,
      CustomersModule,
      VendorsModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return { app, moduleRef: moduleFixture };
}
