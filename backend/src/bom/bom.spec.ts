import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import {
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
import { Customer } from '../customers/entities/customer.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { OrderEnquiryHeader } from '../order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from '../order-enquiry/entities/order-enquiry-detail.entity';
import { OrderConfirmationHeader } from '../order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../order-confirmation/entities/order-confirmation-detail.entity';
import { ContractHeader } from '../contract/entities/contract-header.entity';
import { ContractDetail } from '../contract/entities/contract-detail.entity';
import { OrderEnquiryQtyBreakdown } from '../order-enquiry/entities/order-enquiry-qty-breakdown.entity';

describe('BomManagement API Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepo: Repository<User>;
  let itemRepo: Repository<Item>;
  let bomRepo: Repository<ProductBom>;
  let seeder: TestDataSeeder;
  let token: string;
  let apiClient: ApiTestClient;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createMinimalTestApp();
    app = testApp;
    jwtService = moduleRef.get(JwtService);
    userRepo = moduleRef.get(getRepositoryToken(User));
    itemRepo = moduleRef.get(getRepositoryToken(Item));
    bomRepo = moduleRef.get(getRepositoryToken(ProductBom));

    // Create test user and get token
    const user = await createTestUser(userRepo);
    token = getAuthToken(jwtService, user.id, user.username);
    apiClient = new ApiTestClient(app, token);

    // Initialize seeder
    const customerRepo = moduleRef.get(getRepositoryToken(Customer));
    const vendorRepo = moduleRef.get(getRepositoryToken(Vendor));
    seeder = new TestDataSeeder(
      customerRepo,
      vendorRepo,
      itemRepo,
      moduleRef.get(getRepositoryToken(OrderEnquiryHeader)),
      moduleRef.get(getRepositoryToken(OrderEnquiryDetail)),
      moduleRef.get(getRepositoryToken(OrderConfirmationHeader)),
      moduleRef.get(getRepositoryToken(OrderConfirmationDetail)),
      moduleRef.get(getRepositoryToken(ContractHeader)),
      moduleRef.get(getRepositoryToken(ContractDetail)),
      bomRepo,
      moduleRef.get(getRepositoryToken(OrderEnquiryQtyBreakdown)),
      user.username,
    );

    // Seed master data
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

  describe('READ Operations', () => {
    test('READ-002: Load with empty Item No', async () => {
      const response = await apiClient.get('/api/bom?itemNo=');
      expect(response.status).toBe(400);
    });

    test('READ-003: Load BOM for item without BOM', async () => {
      const response = await apiClient.get(
        `/api/bom?itemNo=${TEST_DATA.ITEMS.ITEM_003}`,
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test('READ-004: Load non-existent item', async () => {
      const response = await apiClient.get('/api/bom?itemNo=NON-EXISTENT-ITEM');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('CREATE Operations', () => {
    test('CREATE-002: Add row without Item No', async () => {
      const response = await apiClient.post('/api/bom', {
        subItemNo: TEST_DATA.ITEMS.ITEM_SUB,
        qty: 1,
      });
      expect(response.status).toBe(400);
    });

    test('VALID-001: Negative quantity', async () => {
      const response = await apiClient.post('/api/bom', {
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        subItemNo: TEST_DATA.ITEMS.ITEM_002,
        qty: -1,
      });
      expect(response.status).toBe(400);
    });

    test('VALID-002: Zero quantity', async () => {
      const response = await apiClient.post('/api/bom', {
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        subItemNo: TEST_DATA.ITEMS.ITEM_002,
        qty: 0,
      });
      expect(response.status).toBe(400);
    });

    test('VALID-003: Invalid Sub Item No (non-existent)', async () => {
      const response = await apiClient.post('/api/bom', {
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        subItemNo: 'NON-EXISTENT-ITEM',
        qty: 1,
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Sub Item Number');
      expect(response.body.message).toContain('does not exist');
    });
  });

  describe('UPDATE Operations', () => {
    let bomId: string;

    beforeEach(async () => {
      // Clean up any existing BOMs for test items to avoid conflicts
      await bomRepo.delete({
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        subItemNo: TEST_DATA.ITEMS.ITEM_002,
      });

      // Create a BOM for testing updates
      const bom = await bomRepo.save(
        bomRepo.create({
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          subItemNo: TEST_DATA.ITEMS.ITEM_002,
          qty: 2,
        }),
      );
      bomId = bom.id.toString();
    });

    afterEach(async () => {
      // Clean up BOMs created in this describe block
      await bomRepo.delete({ itemNo: TEST_DATA.ITEMS.ITEM_001 });
    });

    test('UPDATE-003: Update multiple rows', async () => {
      // Create another BOM
      const bom2 = await bomRepo.save(
        bomRepo.create({
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          subItemNo: TEST_DATA.ITEMS.ITEM_003,
          qty: 3,
        }),
      );

      // Update first BOM
      const response1 = await apiClient.put(`/api/bom/${bomId}`, { qty: 5 });
      expect(response1.status).toBe(200);

      // Update second BOM
      const response2 = await apiClient.put(`/api/bom/${bom2.id}`, { qty: 6 });
      expect(response2.status).toBe(200);
    });

    test('UPDATE-004: Clear optional field (set Unit to null)', async () => {
      // First set a unit
      await apiClient.put(`/api/bom/${bomId}`, { unit: 'PC' });

      // Then clear it
      const response = await apiClient.put(`/api/bom/${bomId}`, { unit: null });
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE Operations', () => {
    test('DELETE-002: Delete new (unsaved) row', async () => {
      // This test validates that trying to delete a non-existent BOM returns 404
      const response = await apiClient.delete('/api/bom/99999');
      expect(response.status).toBe(404);
    });

    test('DELETE-003: Delete all BOM rows for item', async () => {
      // Clean up any existing BOMs first
      await bomRepo.delete({ itemNo: TEST_DATA.ITEMS.ITEM_001 });

      // Create multiple BOMs for the same item
      await bomRepo.save([
        bomRepo.create({
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          subItemNo: TEST_DATA.ITEMS.ITEM_002,
          qty: 1,
        }),
        bomRepo.create({
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          subItemNo: TEST_DATA.ITEMS.ITEM_003,
          qty: 2,
        }),
      ]);

      // Get all BOMs for the item
      const boms = await bomRepo.find({
        where: { itemNo: TEST_DATA.ITEMS.ITEM_001 },
      });

      // Delete all
      for (const bom of boms) {
        const response = await apiClient.delete(`/api/bom/${bom.id}`);
        expect(response.status).toBe(200);
      }

      // Verify all deleted
      const remaining = await bomRepo.find({
        where: { itemNo: TEST_DATA.ITEMS.ITEM_001 },
      });
      expect(remaining.length).toBe(0);
    });
  });

  describe('BOM Validation Fix Verification', () => {
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
    });
  });
});
