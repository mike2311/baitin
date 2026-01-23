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
import { OrderEnquiryHeader } from './entities/order-enquiry-header.entity';
import { OrderEnquiryControl } from './entities/order-enquiry-control.entity';
import { User } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Item } from '../items/entities/item.entity';
import { OrderEnquiryDetail } from './entities/order-enquiry-detail.entity';
import { OrderConfirmationHeader } from '../order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../order-confirmation/entities/order-confirmation-detail.entity';
import { ContractHeader } from '../contract/entities/contract-header.entity';
import { ContractDetail } from '../contract/entities/contract-detail.entity';
import { ProductBom } from './entities/product-bom.entity';
import { OrderEnquiryQtyBreakdown } from './entities/order-enquiry-qty-breakdown.entity';

describe('OrderEnquiryEnquiry API Tests', () => {
  let app: INestApplication;
  let apiClient: ApiTestClient;
  let jwtService: JwtService;
  let userRepo: Repository<User>;
  let oeHeaderRepo: Repository<OrderEnquiryHeader>;
  let controlRepo: Repository<OrderEnquiryControl>;
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
    controlRepo = moduleRef.get(getRepositoryToken(OrderEnquiryControl));

    const user = await createTestUser(userRepo);
    token = getAuthToken(jwtService, user.id, user.username);
    apiClient = new ApiTestClient(app, token);

    seeder = new TestDataSeeder(
      moduleRef.get(getRepositoryToken(Customer)),
      moduleRef.get(getRepositoryToken(Vendor)),
      moduleRef.get(getRepositoryToken(Item)),
      oeHeaderRepo,
      moduleRef.get(getRepositoryToken(OrderEnquiryDetail)),
      moduleRef.get(getRepositoryToken(OrderConfirmationHeader)),
      moduleRef.get(getRepositoryToken(OrderConfirmationDetail)),
      moduleRef.get(getRepositoryToken(ContractHeader)),
      moduleRef.get(getRepositoryToken(ContractDetail)),
      moduleRef.get(getRepositoryToken(ProductBom)),
      moduleRef.get(getRepositoryToken(OrderEnquiryQtyBreakdown)),
      user.username,
    );

    await seeder.seedMasterData();

    // Create OE Control and OE for testing
    await controlRepo.save(
      controlRepo.create({
        oeNo: 'TEST-OE-ENQUIRY-001',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: new Date('2026-01-15'),
        creDate: new Date(),
        creUser: user.username,
        userId: user.username,
      } as Partial<OrderEnquiryControl>),
    );

    await apiClient.post('/api/order-enquiry', {
      oeNo: 'TEST-OE-ENQUIRY-001',
      oeDate: '2026-01-15',
      custNo: TEST_DATA.CUSTOMERS.CUST_001,
      compCode: 'HT',
      details: [
        {
          lineNo: 1,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
          price: 10.5,
        },
      ],
    });
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await oeHeaderRepo.delete({ oeNo: 'TEST-OE-ENQUIRY-001' });
      await controlRepo.delete({ oeNo: 'TEST-OE-ENQUIRY-001' });
    } catch (e) {
      // Ignore
    }
    if (seeder) {
      await seeder.cleanup();
    }
    if (app) {
      await app.close();
    }
  });

  describe('SEARCH Operations', () => {
    test('SEARCH-001: Search by OE Number', async () => {
      const response = await apiClient.get(
        '/api/order-enquiry/enquiry?oeNo=TEST-OE-ENQUIRY-001',
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].oeNo).toContain('TEST-OE-ENQUIRY-001');
    });

    test('SEARCH-002: Search by Customer', async () => {
      const response = await apiClient.get(
        `/api/order-enquiry/enquiry?custNo=${TEST_DATA.CUSTOMERS.CUST_001}`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('SEARCH-003: Search by date range', async () => {
      const response = await apiClient.get(
        '/api/order-enquiry/enquiry?dateFrom=2026-01-01&dateTo=2026-01-31',
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('SEARCH-004: Search by status', async () => {
      const response = await apiClient.get(
        '/api/order-enquiry/enquiry?status=0',
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('SEARCH-005: Search with multiple filters', async () => {
      const response = await apiClient.get(
        `/api/order-enquiry/enquiry?oeNo=TEST-OE-ENQUIRY-001&custNo=${TEST_DATA.CUSTOMERS.CUST_001}&dateFrom=2026-01-01&dateTo=2026-01-31&status=0`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('SEARCH-006: Verify aggregated data', async () => {
      const response = await apiClient.get(
        '/api/order-enquiry/enquiry?oeNo=TEST-OE-ENQUIRY-001',
      );

      expect(response.status).toBe(200);
      if (response.body.length > 0) {
        const oe = response.body[0];
        expect(oe).toHaveProperty('totalAmount');
        expect(oe).toHaveProperty('itemCount');
        expect(typeof oe.totalAmount).toBe('number');
        expect(typeof oe.itemCount).toBe('number');
      }
    });
  });
});
