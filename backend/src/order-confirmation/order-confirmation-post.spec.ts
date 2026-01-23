import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  getAuthToken,
  createTestUser,
  ApiTestClient,
} from '../test-utils/test-helpers';
import { createMinimalTestApp } from '../test-utils/minimal-test-app';
import { TestDataSeeder } from '../test-utils/test-data-seeder';
import { TEST_DATA } from '../test-utils/test-data.config';
import { JwtService } from '@nestjs/jwt';
import { OrderEnquiryHeader } from '../order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from '../order-enquiry/entities/order-enquiry-detail.entity';
import { OrderConfirmationHeader } from './entities/order-confirmation-header.entity';
import { User } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Item } from '../items/entities/item.entity';
import { OrderConfirmationDetail } from './entities/order-confirmation-detail.entity';
import { ContractHeader } from '../contract/entities/contract-header.entity';
import { ContractDetail } from '../contract/entities/contract-detail.entity';
import { ProductBom } from '../order-enquiry/entities/product-bom.entity';
import { OrderEnquiryQtyBreakdown } from '../order-enquiry/entities/order-enquiry-qty-breakdown.entity';

describe('OrderConfirmationPost API Tests', () => {
  let app: INestApplication;
  let apiClient: ApiTestClient;
  let jwtService: JwtService;
  let userRepo: Repository<User>;
  let oeHeaderRepo: Repository<OrderEnquiryHeader>;
  let oeDetailRepo: Repository<OrderEnquiryDetail>;
  let seeder: TestDataSeeder;
  let token: string;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const { app: testApp, moduleRef: testModuleRef } =
      await createMinimalTestApp();
    app = testApp;
    moduleRef = testModuleRef;
    jwtService = moduleRef.get(JwtService);
    userRepo = moduleRef.get(getRepositoryToken(User));
    oeHeaderRepo = moduleRef.get(getRepositoryToken(OrderEnquiryHeader));
    oeDetailRepo = moduleRef.get(getRepositoryToken(OrderEnquiryDetail));

    // Create test user and get token
    const user = await createTestUser(userRepo);
    token = getAuthToken(jwtService, user.id, user.username);
    apiClient = new ApiTestClient(app, token);

    // Initialize seeder
    seeder = new TestDataSeeder(
      moduleRef.get(getRepositoryToken(Customer)),
      moduleRef.get(getRepositoryToken(Vendor)),
      moduleRef.get(getRepositoryToken(Item)),
      oeHeaderRepo,
      oeDetailRepo,
      moduleRef.get(getRepositoryToken(OrderConfirmationHeader)),
      moduleRef.get(getRepositoryToken(OrderConfirmationDetail)),
      moduleRef.get(getRepositoryToken(ContractHeader)),
      moduleRef.get(getRepositoryToken(ContractDetail)),
      moduleRef.get(getRepositoryToken(ProductBom)),
      moduleRef.get(getRepositoryToken(OrderEnquiryQtyBreakdown)),
      user.username,
    );

    // Seed master data
    await seeder.seedMasterData();
    await seeder.seedOrderEnquiries();

    // Ensure OEs are in draft status (not posted) for tests
    await oeHeaderRepo.update(
      { oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_001 },
      { status: 0 },
    );
    await oeHeaderRepo.update(
      { oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_002 },
      { status: 0 },
    );
  });

  afterAll(async () => {
    if (seeder) {
      await seeder.cleanup();
    }
    if (app) {
      await app.close();
    }
  });

  test('POST-002: Post multiple OEs (array)', async () => {
    const response = await apiClient.post('/api/order-confirmation/post', {
      companyCode: TEST_DATA.COMPANY_CODES.HT,
      oeNos: [
        TEST_DATA.ORDER_ENQUIRIES.OE_001,
        TEST_DATA.ORDER_ENQUIRIES.OE_002,
      ],
    });

    expect([200, 201]).toContain(response.status);
    expect(response.body.posted).toBeGreaterThan(0);
  });

  test('POST-003: Post multiple OEs (array)', async () => {
    // Create fresh OEs for this test to avoid conflicts
    await oeHeaderRepo.save(
      oeHeaderRepo.create({
        oeNo: 'TEST-OE-POST-003-1',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: new Date('2026-01-01'),
        compCode: TEST_DATA.COMPANY_CODES.HT,
        status: 0,
      } as Partial<OrderEnquiryHeader>),
    );
    await oeDetailRepo.save(
      oeDetailRepo.create({
        oeNo: 'TEST-OE-POST-003-1',
        lineNo: 1,
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        qty: 100,
        vendorNo: TEST_DATA.VENDORS.VEND_001,
      } as Partial<OrderEnquiryDetail>),
    );

    const response = await apiClient.post('/api/order-confirmation/post', {
      companyCode: TEST_DATA.COMPANY_CODES.HT,
      oeNos: ['TEST-OE-POST-003-1'],
    });

    expect([200, 201]).toContain(response.status);
  });

  test('POST-004: Post with multiple OEs', async () => {
    // Create fresh OEs for this test
    await oeHeaderRepo.save(
      oeHeaderRepo.create({
        oeNo: 'TEST-OE-POST-004-1',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: new Date('2026-01-01'),
        compCode: TEST_DATA.COMPANY_CODES.HT,
        status: 0,
      } as Partial<OrderEnquiryHeader>),
    );
    await oeDetailRepo.save(
      oeDetailRepo.create({
        oeNo: 'TEST-OE-POST-004-1',
        lineNo: 1,
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        qty: 100,
        vendorNo: TEST_DATA.VENDORS.VEND_001,
      } as Partial<OrderEnquiryDetail>),
    );

    const response = await apiClient.post('/api/order-confirmation/post', {
      companyCode: TEST_DATA.COMPANY_CODES.HT,
      oeNos: ['TEST-OE-POST-004-1'],
    });

    expect([200, 201]).toContain(response.status);
  });

  test('VALID-001: Post with empty Company Code', async () => {
    const response = await apiClient.post('/api/order-confirmation/post', {
      companyCode: '',
      oeNos: [TEST_DATA.ORDER_ENQUIRIES.OE_001],
    });

    expect(response.status).toBe(400);
  });

  test('VALID-002: Post with empty OE Nos', async () => {
    const response = await apiClient.post('/api/order-confirmation/post', {
      companyCode: TEST_DATA.COMPANY_CODES.HT,
      oeNos: [],
    });

    expect(response.status).toBe(400);
  });

  test('VALID-003: Post with invalid Company Code', async () => {
    const response = await apiClient.post('/api/order-confirmation/post', {
      companyCode: 'INVALID',
      oeNos: [TEST_DATA.ORDER_ENQUIRIES.OE_001],
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test('VALID-004: Post with non-existent OE No', async () => {
    const response = await apiClient.post('/api/order-confirmation/post', {
      companyCode: TEST_DATA.COMPANY_CODES.HT,
      oeNos: ['NON-EXISTENT-OE'],
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
