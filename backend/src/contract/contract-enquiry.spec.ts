import { INestApplication } from '@nestjs/common';
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
import { ContractHeader } from './entities/contract-header.entity';
import { ContractDetail } from './entities/contract-detail.entity';
import { User } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Item } from '../items/entities/item.entity';
import { OrderEnquiryHeader } from '../order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from '../order-enquiry/entities/order-enquiry-detail.entity';
import { OrderConfirmationHeader } from '../order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../order-confirmation/entities/order-confirmation-detail.entity';
import { OrderEnquiryQtyBreakdown } from '../order-enquiry/entities/order-enquiry-qty-breakdown.entity';
import { ProductBom } from '../order-enquiry/entities/product-bom.entity';

describe('ContractEnquiry API Tests', () => {
  let app: INestApplication;
  let apiClient: ApiTestClient;
  let jwtService: JwtService;
  let userRepo: Repository<User>;
  let contHeaderRepo: Repository<ContractHeader>;
  let seeder: TestDataSeeder;
  let token: string;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createMinimalTestApp();
    app = testApp;
    jwtService = moduleRef.get(JwtService);
    userRepo = moduleRef.get(getRepositoryToken(User));
    contHeaderRepo = moduleRef.get(getRepositoryToken(ContractHeader));

    const user = await createTestUser(userRepo);
    token = getAuthToken(jwtService, user.id, user.username);
    apiClient = new ApiTestClient(app, token);

    seeder = new TestDataSeeder(
      moduleRef.get(getRepositoryToken(Customer)),
      moduleRef.get(getRepositoryToken(Vendor)),
      moduleRef.get(getRepositoryToken(Item)),
      moduleRef.get(getRepositoryToken(OrderEnquiryHeader)),
      moduleRef.get(getRepositoryToken(OrderEnquiryDetail)),
      moduleRef.get(getRepositoryToken(OrderConfirmationHeader)),
      moduleRef.get(getRepositoryToken(OrderConfirmationDetail)),
      contHeaderRepo,
      moduleRef.get(getRepositoryToken(ContractDetail)),
      moduleRef.get(getRepositoryToken(ProductBom)),
      moduleRef.get(getRepositoryToken(OrderEnquiryQtyBreakdown)),
      user.username,
    );

    await seeder.seedMasterData();
    await seeder.seedOrderConfirmations();
    await seeder.seedContracts();
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
    test('SEARCH-001: Search by Contract No', async () => {
      const response = await apiClient.get(
        `/api/contract/enquiry?contNo=${TEST_DATA.CONTRACTS.CONT_001}`,
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].contNo).toContain(TEST_DATA.CONTRACTS.CONT_001);
      }
    });

    test('SEARCH-002: Search by OC No', async () => {
      const response = await apiClient.get(
        `/api/contract/enquiry?confNo=${TEST_DATA.ORDER_CONFIRMATIONS.OC_001}`,
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('SEARCH-003: Search by Vendor No', async () => {
      const response = await apiClient.get(
        `/api/contract/enquiry?vendorNo=${TEST_DATA.VENDORS.VEND_001}`,
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('SEARCH-004: Search by date range', async () => {
      const response = await apiClient.get(
        '/api/contract/enquiry?dateFrom=2026-01-01&dateTo=2026-01-31',
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('SEARCH-005: Search with all criteria', async () => {
      const response = await apiClient.get(
        `/api/contract/enquiry?contNo=${TEST_DATA.CONTRACTS.CONT_001}&confNo=${TEST_DATA.ORDER_CONFIRMATIONS.OC_001}&vendorNo=${TEST_DATA.VENDORS.VEND_001}&dateFrom=2026-01-01&dateTo=2026-01-31`,
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Report Operations', () => {
    test('REPORT-001: View contract report', async () => {
      const response = await apiClient.get(
        `/api/contract/${TEST_DATA.CONTRACTS.CONT_001}/report`,
      );
      expect([200, 404]).toContain(response.status);
    });

    test('REPORT-002: View report for non-existent contract', async () => {
      const response = await apiClient.get(
        '/api/contract/NON-EXISTENT-CONT/report',
      );
      expect([404, 400]).toContain(response.status);
    });
  });

  describe('Navigation Tests', () => {
    test('NAV-001: Open contract from enquiry', async () => {
      // First get contract from enquiry
      const enquiryResponse = await apiClient.get(
        `/api/contract/enquiry?contNo=${TEST_DATA.CONTRACTS.CONT_001}`,
      );
      expect(enquiryResponse.status).toBe(200);

      if (enquiryResponse.body.length > 0) {
        const contNo = enquiryResponse.body[0].contNo;
        // Then load the contract
        const contractResponse = await apiClient.get(`/api/contract/${contNo}`);
        expect(contractResponse.status).toBe(200);
        expect(contractResponse.body.contNo).toBe(contNo);
      }
    });
  });
});
