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
import { ContractHeader } from './entities/contract-header.entity';
import { OrderConfirmationHeader } from '../order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../order-confirmation/entities/order-confirmation-detail.entity';
import { User } from '../users/entities/user.entity';

describe('ContractGenerate API Tests', () => {
  let app: INestApplication;
  let apiClient: ApiTestClient;
  let jwtService: JwtService;
  let userRepo: Repository<User>;
  let ocHeaderRepo: Repository<OrderConfirmationHeader>;
  let ocDetailRepo: Repository<OrderConfirmationDetail>;
  let contHeaderRepo: Repository<ContractHeader>;
  let seeder: TestDataSeeder;
  let token: string;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createMinimalTestApp();
    app = testApp;
    jwtService = moduleRef.get(JwtService);
    userRepo = moduleRef.get(getRepositoryToken(User));
    ocHeaderRepo = moduleRef.get(getRepositoryToken(OrderConfirmationHeader));
    ocDetailRepo = moduleRef.get(getRepositoryToken(OrderConfirmationDetail));
    contHeaderRepo = moduleRef.get(getRepositoryToken(ContractHeader));

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
      ocHeaderRepo,
      ocDetailRepo,
      contHeaderRepo,
      moduleRef.get(
        getRepositoryToken(
          require('./entities/contract-detail.entity').ContractDetail,
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
    await seeder.seedOrderConfirmations();
  });

  afterAll(async () => {
    if (seeder) {
      await seeder.cleanup();
    }
    if (app) {
      await app.close();
    }
  });

  describe('GENERATE Operations', () => {
    test('GEN-001: Generate contracts from OC with single vendor', async () => {
      // Create OC with single vendor
      const oc = await ocHeaderRepo.save(
        ocHeaderRepo.create({
          confNo: 'TEST-OC-GEN-001',
          date: new Date('2026-01-05'),
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
        } as Partial<OrderConfirmationHeader>),
      );

      await ocDetailRepo.save([
        ocDetailRepo.create({
          confNo: 'TEST-OC-GEN-001',
          lineNo: 1,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        } as Partial<OrderConfirmationDetail>),
      ]);

      const response = await apiClient.post('/api/contract/generate', {
        confNo: 'TEST-OC-GEN-001',
      });

      expect(response.status).toBe(201);
      expect(response.body.contracts).toBeGreaterThan(0);
    });

    test('GEN-002: Generate contracts from OC with multiple vendors', async () => {
      const oc = await ocHeaderRepo.save(
        ocHeaderRepo.create({
          confNo: 'TEST-OC-GEN-002',
          date: new Date('2026-01-05'),
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
        } as Partial<OrderConfirmationHeader>),
      );

      await ocDetailRepo.save([
        ocDetailRepo.create({
          confNo: 'TEST-OC-GEN-002',
          lineNo: 1,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        } as Partial<OrderConfirmationDetail>),
        ocDetailRepo.create({
          confNo: 'TEST-OC-GEN-002',
          lineNo: 2,
          itemNo: TEST_DATA.ITEMS.ITEM_002,
          qty: 200,
          vendorNo: TEST_DATA.VENDORS.VEND_002,
        } as Partial<OrderConfirmationDetail>),
      ]);

      const response = await apiClient.post('/api/contract/generate', {
        confNo: 'TEST-OC-GEN-002',
      });

      expect(response.status).toBe(201);
      expect(response.body.contracts).toBeGreaterThanOrEqual(2);
    });

    test('GEN-003: Generate with BOM items', async () => {
      // Create OC with BOM head item
      const oc = await ocHeaderRepo.save(
        ocHeaderRepo.create({
          confNo: 'TEST-OC-GEN-003',
          date: new Date('2026-01-05'),
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
        } as Partial<OrderConfirmationHeader>),
      );

      await ocDetailRepo.save([
        ocDetailRepo.create({
          confNo: 'TEST-OC-GEN-003',
          lineNo: 1,
          itemNo: TEST_DATA.ITEMS.ITEM_HEAD,
          qty: 50,
          head: true,
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        } as Partial<OrderConfirmationDetail>),
      ]);

      // Create BOM
      await seeder.seedBoms();

      const response = await apiClient.post('/api/contract/generate', {
        confNo: 'TEST-OC-GEN-003',
      });

      expect(response.status).toBe(201);
    });

    test('GEN-004: Generate with empty OC No', async () => {
      const response = await apiClient.post('/api/contract/generate', {
        confNo: '',
      });

      expect(response.status).toBe(400);
    });

    test('GEN-005: Generate with non-existent OC No', async () => {
      const response = await apiClient.post('/api/contract/generate', {
        confNo: 'NON-EXISTENT-OC',
      });

      expect(response.status).toBe(400);
    });

    test('GEN-006: Generate from OC without items', async () => {
      const oc = await ocHeaderRepo.save(
        ocHeaderRepo.create({
          confNo: 'TEST-OC-GEN-006',
          date: new Date('2026-01-05'),
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
        } as Partial<OrderConfirmationHeader>),
      );

      const response = await apiClient.post('/api/contract/generate', {
        confNo: 'TEST-OC-GEN-006',
      });

      expect(response.status).toBe(400);
    });

    test('GEN-007: Generate from already-contracted OC', async () => {
      // Create OC and contract
      const oc = await ocHeaderRepo.save(
        ocHeaderRepo.create({
          confNo: 'TEST-OC-GEN-007',
          date: new Date('2026-01-05'),
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
        } as Partial<OrderConfirmationHeader>),
      );

      await ocDetailRepo.save([
        ocDetailRepo.create({
          confNo: 'TEST-OC-GEN-007',
          lineNo: 1,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        } as Partial<OrderConfirmationDetail>),
      ]);

      // Generate first time
      await apiClient.post('/api/contract/generate', {
        confNo: 'TEST-OC-GEN-007',
      });

      // Try to generate again
      const response = await apiClient.post('/api/contract/generate', {
        confNo: 'TEST-OC-GEN-007',
      });

      // Should either succeed (allow regeneration) or fail (prevent duplicate)
      expect([200, 201, 400]).toContain(response.status);
    });
  });
});
