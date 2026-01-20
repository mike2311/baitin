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
import { TestDataSeeder } from '../test-utils/test-data-seeder';
import { TEST_DATA } from '../test-utils/test-data.config';
import { JwtService } from '@nestjs/jwt';
import { OrderEnquiryControl } from './entities/order-enquiry-control.entity';
import { User } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';

describe('OrderEnquiryControl API Tests', () => {
  let app: INestApplication;
  let apiClient: ApiTestClient;
  let jwtService: JwtService;
  let userRepo: Repository<User>;
  let controlRepo: Repository<OrderEnquiryControl>;
  let customerRepo: Repository<Customer>;
  let seeder: TestDataSeeder;
  let token: string;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const { app: testApp, moduleRef: testModuleRef } = await createTestApp();
    app = testApp;
    moduleRef = testModuleRef;
    jwtService = moduleRef.get(JwtService);
    userRepo = moduleRef.get(getRepositoryToken(User));
    controlRepo = moduleRef.get(getRepositoryToken(OrderEnquiryControl));
    customerRepo = moduleRef.get(getRepositoryToken(Customer));

    const user = await createTestUser(userRepo);
    token = getAuthToken(jwtService, user.id, user.username);
    apiClient = new ApiTestClient(app, token);

    seeder = new TestDataSeeder(
      customerRepo,
      moduleRef.get(
        getRepositoryToken(require('../vendors/entities/vendor.entity').Vendor),
      ),
      moduleRef.get(
        getRepositoryToken(require('../items/entities/item.entity').Item),
      ),
      moduleRef.get(
        getRepositoryToken(
          require('../order-enquiry/entities/order-enquiry-header.entity')
            .OrderEnquiryHeader,
        ),
      ),
      moduleRef.get(
        getRepositoryToken(
          require('../order-enquiry/entities/order-enquiry-detail.entity')
            .OrderEnquiryDetail,
        ),
      ),
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
  });

  afterAll(async () => {
    if (seeder) {
      await seeder.cleanup();
    }
    // Clean up OE Controls created in tests
    try {
      await controlRepo.delete({ oeNo: 'TEST-OE-CONTROL-001' });
      await controlRepo.delete({ oeNo: 'TEST-OE-CONTROL-002' });
      await controlRepo.delete({ oeNo: 'TEST-OE-CONTROL-003' });
    } catch (e) {
      // Ignore if doesn't exist
    }
    if (app) {
      await app.close();
    }
  });

  describe('CREATE Operations', () => {
    test('CREATE-001: Create new OE Control', async () => {
      const response = await apiClient.post('/api/order-enquiry/control', {
        oeNo: 'TEST-OE-CONTROL-001',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: '2026-01-15',
        poNo: 'TEST-PO-001',
        status: 'Draft',
        remark: 'Test OE Control',
      });

      expect(response.status).toBe(201);
      expect(response.body.oeNo).toBe('TEST-OE-CONTROL-001');
      expect(response.body.custNo).toBe(TEST_DATA.CUSTOMERS.CUST_001);
    });

    test('CREATE-002: Create with minimal required fields', async () => {
      const response = await apiClient.post('/api/order-enquiry/control', {
        oeNo: 'TEST-OE-CONTROL-002',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: '2026-01-15',
      });

      expect(response.status).toBe(201);
      expect(response.body.oeNo).toBe('TEST-OE-CONTROL-002');
    });

    test('VALID-001: Create with duplicate OE No', async () => {
      // First create
      await apiClient.post('/api/order-enquiry/control', {
        oeNo: 'TEST-OE-CONTROL-003',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: '2026-01-15',
      });

      // Try to create duplicate
      const response = await apiClient.post('/api/order-enquiry/control', {
        oeNo: 'TEST-OE-CONTROL-003',
        custNo: TEST_DATA.CUSTOMERS.CUST_002,
        oeDate: '2026-01-16',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('OE Number Already Exists');
    });

    test('VALID-002: Create with non-existent customer', async () => {
      const response = await apiClient.post('/api/order-enquiry/control', {
        oeNo: 'TEST-OE-CONTROL-INVALID',
        custNo: 'NON-EXISTENT-CUSTOMER',
        oeDate: '2026-01-15',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('does not exist');
    });

    test('VALID-003: Create without required fields', async () => {
      const response = await apiClient.post('/api/order-enquiry/control', {
        // Missing oeNo, custNo, oeDate
      });

      expect(response.status).toBe(400);
    });
  });

  describe('READ Operations', () => {
    test('READ-001: Get OE Control by OE No', async () => {
      // Create first
      await apiClient.post('/api/order-enquiry/control', {
        oeNo: 'TEST-OE-READ-001',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: '2026-01-15',
      });

      const response = await apiClient.get(
        '/api/order-enquiry/control/TEST-OE-READ-001',
      );

      expect(response.status).toBe(200);
      expect(response.body.oeNo).toBe('TEST-OE-READ-001');
      expect(response.body.custNo).toBe(TEST_DATA.CUSTOMERS.CUST_001);
    });

    test('READ-002: Get non-existent OE Control', async () => {
      const response = await apiClient.get(
        '/api/order-enquiry/control/NON-EXISTENT-OE',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('UPDATE Operations', () => {
    test('UPDATE-001: Update OE Control', async () => {
      // Create first
      await apiClient.post('/api/order-enquiry/control', {
        oeNo: 'TEST-OE-UPDATE-001',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: '2026-01-15',
      });

      const response = await apiClient.put(
        '/api/order-enquiry/control/TEST-OE-UPDATE-001',
        {
          poNo: 'UPDATED-PO-001',
          status: 'Updated',
          remark: 'Updated remark',
        },
      );

      expect(response.status).toBe(200);
      expect(response.body.poNo).toBe('UPDATED-PO-001');
      expect(response.body.status).toBe('Updated');
    });

    test('UPDATE-002: Update with invalid customer', async () => {
      // Create first
      await apiClient.post('/api/order-enquiry/control', {
        oeNo: 'TEST-OE-UPDATE-002',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: '2026-01-15',
      });

      const response = await apiClient.put(
        '/api/order-enquiry/control/TEST-OE-UPDATE-002',
        {
          custNo: 'NON-EXISTENT-CUSTOMER',
        },
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('does not exist');
    });
  });

  describe('DELETE Operations', () => {
    test('DELETE-001: Delete OE Control', async () => {
      // Create first
      await apiClient.post('/api/order-enquiry/control', {
        oeNo: 'TEST-OE-DELETE-001',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: '2026-01-15',
      });

      const response = await apiClient.delete(
        '/api/order-enquiry/control/TEST-OE-DELETE-001',
      );

      expect(response.status).toBe(200);

      // Verify deleted
      const getResponse = await apiClient.get(
        '/api/order-enquiry/control/TEST-OE-DELETE-001',
      );
      expect(getResponse.status).toBe(404);
    });

    test('DELETE-002: Delete non-existent OE Control', async () => {
      const response = await apiClient.delete(
        '/api/order-enquiry/control/NON-EXISTENT-OE',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('SEARCH Operations', () => {
    test('SEARCH-001: Search by OE No', async () => {
      // Create test data
      await apiClient.post('/api/order-enquiry/control', {
        oeNo: 'TEST-OE-SEARCH-001',
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: '2026-01-15',
      });

      const response = await apiClient.get(
        '/api/order-enquiry/control?oeNo=TEST-OE-SEARCH-001',
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.controls)).toBe(true);
      expect(response.body.controls.length).toBeGreaterThan(0);
      expect(response.body.controls[0].oeNo).toContain('TEST-OE-SEARCH-001');
    });

    test('SEARCH-002: Search by Customer', async () => {
      const response = await apiClient.get(
        `/api/order-enquiry/control?custNo=${TEST_DATA.CUSTOMERS.CUST_001}`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.controls)).toBe(true);
    });

    test('SEARCH-003: Search by date range', async () => {
      const response = await apiClient.get(
        '/api/order-enquiry/control?dateFrom=2026-01-01&dateTo=2026-01-31',
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.controls)).toBe(true);
    });
  });
});
