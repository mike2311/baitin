import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
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
import { User } from '../users/entities/user.entity';
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
import { TEST_DATA } from './test-data.config';
import { ApiTestClient } from './api-test-client';

/**
 * Test Helper Utilities
 *
 * Reusable utilities for setting up test environments and making authenticated requests.
 */

// Re-export ApiTestClient for convenience
export { ApiTestClient };

/**
 * Creates a NestJS test application with all required modules
 * Returns both the app and the module reference for accessing services
 */
export async function createTestApp(): Promise<{
  app: INestApplication;
  moduleRef: TestingModule;
}> {
  // Use PostgreSQL for tests (same as production/Supabase)
  // HARDCODED for test reliability - matches docker-compose.yml postgres-test service
  const testDbHost = 'localhost';
  const testDbPort = 5433; // Docker test database runs on 5433
  const testDbUser = 'postgres';
  const testDbPassword = 'postgres';
  const testDbName = 'baitin_test';

  // Create test module - we need to prevent AppModule from creating its own TypeORM connection
  // The simplest approach is to import TypeORM config first, then AppModule
  // NestJS should use the first TypeORM configuration and ignore AppModule's
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true, // Ignore .env file for tests - use environment variables only
        expandVariables: true,
      }),
      // Import our test TypeORM config FIRST - this will be used
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: testDbHost,
        port: testDbPort,
        username: testDbUser,
        password: testDbPassword,
        database: testDbName,
        // SSL for Supabase connections
        ssl: testDbHost.includes('supabase.co')
          ? { rejectUnauthorized: false }
          : false,
        dropSchema: true, // Drop schema before each test run (tests run sequentially)
        synchronize: true, // Auto-create tables for tests
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
          // Phase 3 entities
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
        extra: {
          max: 5, // Smaller pool for tests
          connectionTimeoutMillis: 10000,
          idleTimeoutMillis: 30000,
        },
      }),
      // Import AppModule - its TypeOrmModule.forRootAsync should be ignored
      // since we've already configured TypeORM above
      // If there are issues, we may need to override AppModule's TypeORM config
      AppModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply same configuration as main.ts
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => {
          const constraints = error.constraints || {};
          const messages = Object.values(constraints);
          return {
            field: error.property,
            messages,
            value: error.value,
          };
        });
        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );

  // Global exception filter
  const {
    HttpExceptionFilter,
  } = require('../common/filters/http-exception.filter');
  app.useGlobalFilters(new HttpExceptionFilter());

  // Request logging middleware
  const {
    RequestLoggerMiddleware,
  } = require('../common/middleware/request-logger.middleware');
  app.use(
    new RequestLoggerMiddleware().use.bind(new RequestLoggerMiddleware()),
  );

  // Set global prefix to match main.ts
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  await app.init();
  return { app, moduleRef: moduleFixture };
}

/**
 * Generates a JWT token for a test user
 */
export function getAuthToken(
  jwtService: JwtService,
  userId: number = 1,
  username: string = TEST_DATA.USER.USERNAME,
  role: string = 'SUPERVISOR',
  companyCode: string = TEST_DATA.COMPANY_CODES.HT,
): string {
  const payload = {
    sub: userId,
    username,
    role,
    company: companyCode,
  };
  return jwtService.sign(payload);
}

/**
 * Makes an authenticated API request
 */
export function makeRequest(
  app: INestApplication,
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  token?: string,
  body?: any,
): request.Test {
  const httpServer = app.getHttpServer();
  let req: request.Test;

  switch (method.toLowerCase()) {
    case 'get':
      req = request(httpServer).get(url);
      break;
    case 'post':
      req = request(httpServer).post(url);
      break;
    case 'put':
      req = request(httpServer).put(url);
      break;
    case 'delete':
      req = request(httpServer).delete(url);
      break;
    case 'patch':
      req = request(httpServer).patch(url);
      break;
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  if (body) {
    req.send(body);
  }

  return req;
}

/**
 * Waits for a specified amount of time
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    await waitFor(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Creates a test user in the database
 */
export async function createTestUser(
  userRepo: any,
  username: string | null = null,
  password: string = TEST_DATA.USER.PASSWORD,
  role: string = 'SUPERVISOR',
  companyCode: string = TEST_DATA.COMPANY_CODES.HT,
): Promise<User> {
  // Generate unique username to avoid conflicts when tests run sequentially
  const uniqueId =
    Date.now().toString(36) + Math.random().toString(36).substring(2);
  const finalUsername = username || `${TEST_DATA.USER.USERNAME}_${uniqueId}`;

  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = userRepo.create({
    username: finalUsername,
    password: hashedPassword,
    userRight: role,
    companyCode,
    active: true,
  });

  return await userRepo.save(user);
}

/**
 * Helper to extract error message from validation error response
 */
export function extractValidationErrors(response: any): string[] {
  if (response.body?.message) {
    if (Array.isArray(response.body.message)) {
      return response.body.message;
    }
    return [response.body.message];
  }
  return [];
}

/**
 * Helper to check if response is a validation error
 */
export function isValidationError(response: any): boolean {
  return response.status === 400 && response.body?.message;
}

/**
 * Helper to check if response is a not found error
 */
export function isNotFoundError(response: any): boolean {
  return response.status === 404;
}

/**
 * Helper to check if response is an unauthorized error
 */
export function isUnauthorizedError(response: any): boolean {
  return response.status === 401;
}

/**
 * Helper to check if response is a server error
 */
export function isServerError(response: any): boolean {
  return response.status >= 500;
}

/**
 * Gets the DataSource from a NestJS testing module
 * This is a convenience function for tests that need direct database access
 */
export async function getTestDataSource(
  moduleRef?: TestingModule,
): Promise<DataSource> {
  if (moduleRef) {
    return moduleRef.get<DataSource>(DataSource);
  }

  // If no moduleRef provided, create a temporary one
  // This is less efficient but maintains backward compatibility
  const { moduleRef: tempModuleRef } = await createTestApp();
  return tempModuleRef.get<DataSource>(DataSource);
}
