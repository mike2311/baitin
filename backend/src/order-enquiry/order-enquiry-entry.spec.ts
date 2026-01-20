import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  createTestApp,
  getAuthToken,
  createTestUser,
  ApiTestClient,
} from '../test-utils/test-helpers';
import { createMinimalTestApp } from '../test-utils/minimal-test-app';
import { TestDataSeeder } from '../test-utils/test-data-seeder';
import { TEST_DATA } from '../test-utils/test-data.config';
import { JwtService } from '@nestjs/jwt';
import { OrderEnquiryHeader } from './entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from './entities/order-enquiry-detail.entity';
import { OrderEnquiryControl } from './entities/order-enquiry-control.entity';
import { User } from '../users/entities/user.entity';

describe('OrderEnquiryEntry API Tests', () => {
  let app: INestApplication;
  let apiClient: ApiTestClient;
  let jwtService: JwtService;
  let userRepo: Repository<User>;
  let oeHeaderRepo: Repository<OrderEnquiryHeader>;
  let oeDetailRepo: Repository<OrderEnquiryDetail>;
  let controlRepo: Repository<OrderEnquiryControl>;
  let seeder: TestDataSeeder;
  let token: string;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const { app: testApp, moduleRef: testModuleRef } = await createMinimalTestApp();
    app = testApp;
    moduleRef = testModuleRef;
    jwtService = moduleRef.get(JwtService);
    userRepo = moduleRef.get(getRepositoryToken(User));
    oeHeaderRepo = moduleRef.get(getRepositoryToken(OrderEnquiryHeader));
    oeDetailRepo = moduleRef.get(getRepositoryToken(OrderEnquiryDetail));
    controlRepo = moduleRef.get(getRepositoryToken(OrderEnquiryControl));

    const user = await createTestUser(userRepo);
    token = getAuthToken(jwtService, user.id, user.username);
    apiClient = new ApiTestClient(app, token);

    seeder = new TestDataSeeder(
      moduleRef.get(
        getRepositoryToken(
          require('../customers/entities/customer.entity').Customer,
        ),
      ),
      moduleRef.get(
        getRepositoryToken(require('../vendors/entities/vendor.entity').Vendor),
      ),
      moduleRef.get(
        getRepositoryToken(require('../items/entities/item.entity').Item),
      ),
      oeHeaderRepo,
      oeDetailRepo,
      moduleRef.get(
        getRepositoryToken(
          require('../order-confirmation/entities/order-confirmation-header.entity')
            .OrderConfirmationHeader,
        ),
      ),
      moduleRef.get(
        getRepositoryToken(
          require('../order-confirmation/entities/order-confirmation-detail.entity')
            .OrderConfirmationDetail,
        ),
      ),
      moduleRef.get(
        getRepositoryToken(
          require('../contract/entities/contract-header.entity').ContractHeader,
        ),
      ),
      moduleRef.get(
        getRepositoryToken(
          require('../contract/entities/contract-detail.entity').ContractDetail,
        ),
      ),
      moduleRef.get(
        getRepositoryToken(
          require('../order-enquiry/entities/product-bom.entity').ProductBom,
        ),
      ),
      moduleRef.get(
        getRepositoryToken(
          require('../order-enquiry/entities/order-enquiry-qty-breakdown.entity')
            .OrderEnquiryQtyBreakdown,
        ),
      ),
      user.username,
    );

    await seeder.seedMasterData();

    // Create OE Control records for all test OEs
    const testOeNos = [
      'TEST-OE-ENTRY-001',
      'TEST-OE-READ-001',
      'TEST-OE-UPDATE-001',
      'TEST-OE-DELETE-001',
      'TEST-OE-MISMATCH',
    ];

    for (const oeNo of testOeNos) {
      await controlRepo.save(
        controlRepo.create({
          oeNo,
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          oeDate: new Date('2026-01-15'),
          creDate: new Date(),
          creUser: user.username,
          userId: user.username,
        } as Partial<OrderEnquiryControl>),
      );
    }
  });

  afterAll(async () => {
    // Clean up test data
    const testOeNos = [
      'TEST-OE-ENTRY-001',
      'TEST-OE-READ-001',
      'TEST-OE-UPDATE-001',
      'TEST-OE-DELETE-001',
      'TEST-OE-MISMATCH',
    ];

    try {
      for (const oeNo of testOeNos) {
        await oeDetailRepo.delete({ oeNo });
        await oeHeaderRepo.delete({ oeNo });
        await controlRepo.delete({ oeNo });
      }
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

  describe('CREATE Operations', () => {
    test('CREATE-001: Create new OE with header and details', async () => {
      const response = await apiClient.post('/api/order-enquiry', {
        oeNo: 'TEST-OE-ENTRY-001',
        oeDate: '2026-01-15',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        compCode: 'HT',
        status: 0,
        details: [
          {
            lineNo: 1,
            itemNo: TEST_DATA.ITEMS.ITEM_001,
            qty: 100,
            price: 10.5,
          },
        ],
      });

      expect(response.status).toBe(201);
      expect(response.body.oeNo).toBe('TEST-OE-ENTRY-001');
      expect(response.body.details.length).toBe(1);
      expect(response.body.details[0].itemNo).toBe(TEST_DATA.ITEMS.ITEM_001);
      // Verify auto-calculated amount
      const amount =
        typeof response.body.details[0].amount === 'string'
          ? parseFloat(response.body.details[0].amount)
          : response.body.details[0].amount;
      expect(amount).toBe(1050); // 100 * 10.5
    });

    test('VALID-001: Create without OE Control (non-INSP)', async () => {
      const response = await apiClient.post('/api/order-enquiry', {
        oeNo: 'TEST-OE-NO-CONTROL',
        oeDate: '2026-01-15',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        compCode: 'HT',
        details: [
          {
            lineNo: 1,
            itemNo: TEST_DATA.ITEMS.ITEM_001,
            qty: 100,
          },
        ],
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('OE Control');
    });

    test('VALID-002: Create with INSP company (bypasses OE Control)', async () => {
      const response = await apiClient.post('/api/order-enquiry', {
        oeNo: 'TEST-OE-INSP-001',
        oeDate: '2026-01-15',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        compCode: 'INSP',
        details: [
          {
            lineNo: 1,
            itemNo: TEST_DATA.ITEMS.ITEM_001,
            qty: 100,
            price: 10.5,
          },
        ],
      });

      expect(response.status).toBe(201);
      expect(response.body.compCode).toBe('INSP');
    });

    test('VALID-003: Create with customer mismatch', async () => {
      // OE Control for TEST-OE-MISMATCH was already created in beforeAll with CUST_001
      // Now try to create OE with different customer
      const response = await apiClient.post('/api/order-enquiry', {
        oeNo: 'TEST-OE-MISMATCH',
        oeDate: '2026-01-15',
        custNo: TEST_DATA.CUSTOMERS.CUST_002, // Different customer
        compCode: 'HT',
        details: [
          {
            lineNo: 1,
            itemNo: TEST_DATA.ITEMS.ITEM_001,
            qty: 100,
          },
        ],
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('does not match');
    });

    test('VALID-004: Create with non-existent item', async () => {
      const response = await apiClient.post('/api/order-enquiry', {
        oeNo: 'TEST-OE-ENTRY-001',
        oeDate: '2026-01-15',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        compCode: 'HT',
        details: [
          {
            lineNo: 1,
            itemNo: 'NON-EXISTENT-ITEM',
            qty: 100,
          },
        ],
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Item Number');
      expect(response.body.message).toContain('do not exist');
    });

    test('VALID-005: Create with invalid quantity', async () => {
      const response = await apiClient.post('/api/order-enquiry', {
        oeNo: 'TEST-OE-ENTRY-001',
        oeDate: '2026-01-15',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        compCode: 'HT',
        details: [
          {
            lineNo: 1,
            itemNo: TEST_DATA.ITEMS.ITEM_001,
            qty: -1, // Invalid
          },
        ],
      });

      expect(response.status).toBe(400);
    });
  });

  describe('READ Operations', () => {
    test('READ-001: Get OE by OE No', async () => {
      // Create first
      await apiClient.post('/api/order-enquiry', {
        oeNo: 'TEST-OE-READ-001',
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

      const response = await apiClient.get(
        '/api/order-enquiry/TEST-OE-READ-001',
      );

      expect(response.status).toBe(200);
      expect(response.body.oeNo).toBe('TEST-OE-READ-001');
      expect(response.body.details.length).toBe(1);
    });

    test('READ-002: Get non-existent OE', async () => {
      const response = await apiClient.get(
        '/api/order-enquiry/NON-EXISTENT-OE',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('UPDATE Operations', () => {
    test('UPDATE-001: Update OE details', async () => {
      // Create first OE
      const createResponse = await apiClient.post('/api/order-enquiry', {
        oeNo: 'TEST-OE-UPDATE-001',
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

      expect(createResponse.status).toBe(201);

      // Now update it
      const response = await apiClient.post('/api/order-enquiry', {
        oeNo: 'TEST-OE-UPDATE-001',
        oeDate: '2026-01-16',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        compCode: 'HT',
        details: [
          {
            lineNo: 1,
            itemNo: TEST_DATA.ITEMS.ITEM_001,
            qty: 150, // Updated
            price: 12.0, // Updated
          },
          {
            lineNo: 2,
            itemNo: TEST_DATA.ITEMS.ITEM_002,
            qty: 50,
            price: 8.0,
          },
        ],
      });

      expect(response.status).toBe(201);
      expect(response.body.details.length).toBe(2);
      // Verify auto-calculated amounts
      const amount1 =
        typeof response.body.details[0].amount === 'string'
          ? parseFloat(response.body.details[0].amount)
          : response.body.details[0].amount;
      expect(amount1).toBe(1800); // 150 * 12.0
    });
  });

  describe('DELETE Operations', () => {
    test('DELETE-001: Delete OE', async () => {
      // Create first
      await apiClient.post('/api/order-enquiry', {
        oeNo: 'TEST-OE-DELETE-001',
        oeDate: '2026-01-15',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        compCode: 'HT',
        details: [
          {
            lineNo: 1,
            itemNo: TEST_DATA.ITEMS.ITEM_001,
            qty: 100,
          },
        ],
      });

      const response = await apiClient.delete(
        '/api/order-enquiry/TEST-OE-DELETE-001',
      );

      expect(response.status).toBe(200);

      // Verify deleted
      const getResponse = await apiClient.get(
        '/api/order-enquiry/TEST-OE-DELETE-001',
      );
      expect(getResponse.status).toBe(404);
    });
  });
});
