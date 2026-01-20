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
import { ProductBom } from '../order-enquiry/entities/product-bom.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';

describe('BOM Validation Fix Verification', () => {
  let app: INestApplication;
  let apiClient: ApiTestClient;
  let jwtService: JwtService;
  let userRepo: Repository<User>;
  let itemRepo: Repository<Item>;
  let bomRepo: Repository<ProductBom>;
  let seeder: TestDataSeeder;
  let token: string;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createMinimalTestApp();
    app = testApp;
    jwtService = moduleRef.get(JwtService);
    userRepo = moduleRef.get(getRepositoryToken(User));
    itemRepo = moduleRef.get(getRepositoryToken(Item));
    bomRepo = moduleRef.get(getRepositoryToken(ProductBom));

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
      itemRepo,
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
      bomRepo,
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
    if (app) {
      await app.close();
    }
  });

  describe('Bug Fix Verification', () => {
    test('Bug Fix: BOM CREATE with non-existent Sub Item returns 400 not 500', async () => {
      const response = await apiClient.post('/api/bom', {
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        subItemNo: 'NON-EXISTENT-SUB-ITEM',
        qty: 1,
      });

      // Should return 400 Bad Request, not 500 Internal Server Error
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Sub Item Number');
      expect(response.body.message).toContain('does not exist');
      expect(response.body.statusCode).toBe(400);
    });

    test('Bug Fix: BOM CREATE with non-existent Item No returns 400 not 500', async () => {
      const response = await apiClient.post('/api/bom', {
        itemNo: 'NON-EXISTENT-ITEM',
        subItemNo: TEST_DATA.ITEMS.ITEM_002,
        qty: 1,
      });

      // Should return 400 Bad Request, not 500 Internal Server Error
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Item Number');
      expect(response.body.message).toContain('does not exist');
      expect(response.body.statusCode).toBe(400);
    });

    test('Bug Fix: BOM CREATE with both non-existent items returns 400 not 500', async () => {
      const response = await apiClient.post('/api/bom', {
        itemNo: 'NON-EXISTENT-ITEM-1',
        subItemNo: 'NON-EXISTENT-ITEM-2',
        qty: 1,
      });

      // Should return 400 Bad Request, not 500 Internal Server Error
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('does not exist');
      expect(response.body.statusCode).toBe(400);
    });

    test('Bug Fix: Valid BOM creation still works', async () => {
      const response = await apiClient.post('/api/bom', {
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        subItemNo: TEST_DATA.ITEMS.ITEM_002,
        qty: 2,
      });

      // Should succeed with valid items
      expect(response.status).toBe(201);
      expect(response.body.itemNo).toBe(TEST_DATA.ITEMS.ITEM_001);
      expect(response.body.subItemNo).toBe(TEST_DATA.ITEMS.ITEM_002);

      // Cleanup
      if (response.body.id) {
        await apiClient.delete(`/api/bom/${response.body.id}`);
      }
    });
  });
});
