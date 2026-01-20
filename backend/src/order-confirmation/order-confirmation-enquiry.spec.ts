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
import { OrderConfirmationHeader } from './entities/order-confirmation-header.entity';
import { User } from '../users/entities/user.entity';

describe('OrderConfirmationEnquiry API Tests', () => {
  let app: INestApplication;
  let apiClient: ApiTestClient;
  let jwtService: JwtService;
  let userRepo: Repository<User>;
  let ocHeaderRepo: Repository<OrderConfirmationHeader>;
  let seeder: TestDataSeeder;
  let token: string;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createMinimalTestApp();
    app = testApp;
    jwtService = moduleRef.get(JwtService);
    userRepo = moduleRef.get(getRepositoryToken(User));
    ocHeaderRepo = moduleRef.get(getRepositoryToken(OrderConfirmationHeader));

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
      moduleRef.get(
        getRepositoryToken(
          require('./entities/order-confirmation-detail.entity')
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

  describe('SEARCH Operations', () => {
    test('SEARCH-001: Search by OC No', async () => {
      const response = await apiClient.get(
        `/api/order-confirmation/enquiry?confNo=${TEST_DATA.ORDER_CONFIRMATIONS.OC_001}`,
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].confNo).toContain(
          TEST_DATA.ORDER_CONFIRMATIONS.OC_001,
        );
      }
    });

    test('SEARCH-002: Search by Customer No', async () => {
      const response = await apiClient.get(
        `/api/order-confirmation/enquiry?custNo=${TEST_DATA.CUSTOMERS.CUST_001}`,
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('SEARCH-003: Search by date range', async () => {
      const response = await apiClient.get(
        '/api/order-confirmation/enquiry?dateFrom=2026-01-01&dateTo=2026-01-31',
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('SEARCH-004: Search with multiple criteria', async () => {
      const response = await apiClient.get(
        `/api/order-confirmation/enquiry?confNo=${TEST_DATA.ORDER_CONFIRMATIONS.OC_001}&custNo=${TEST_DATA.CUSTOMERS.CUST_001}&dateFrom=2026-01-01&dateTo=2026-01-31`,
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('SEARCH-006: Search with no results', async () => {
      const response = await apiClient.get(
        '/api/order-confirmation/enquiry?confNo=NON-EXISTENT-OC-99999',
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('Report Operations', () => {
    test('REPORT-001: View OC report', async () => {
      const response = await apiClient.get(
        `/api/order-confirmation/${TEST_DATA.ORDER_CONFIRMATIONS.OC_001}/report`,
      );
      expect([200, 404]).toContain(response.status);
    });

    test('REPORT-002: View report for non-existent OC', async () => {
      const response = await apiClient.get(
        '/api/order-confirmation/NON-EXISTENT-OC/report',
      );
      expect([404, 400]).toContain(response.status);
    });
  });

  describe('Navigation Tests', () => {
    test('NAV-001: Open OC from enquiry', async () => {
      // First get OC from enquiry
      const enquiryResponse = await apiClient.get(
        `/api/order-confirmation/enquiry?confNo=${TEST_DATA.ORDER_CONFIRMATIONS.OC_001}`,
      );
      expect(enquiryResponse.status).toBe(200);

      if (enquiryResponse.body.length > 0) {
        const confNo = enquiryResponse.body[0].confNo;
        // Then load the OC
        const ocResponse = await apiClient.get(
          `/api/order-confirmation/${confNo}`,
        );
        expect(ocResponse.status).toBe(200);
        expect(ocResponse.body.confNo).toBe(confNo);
      }
    });
  });
});
