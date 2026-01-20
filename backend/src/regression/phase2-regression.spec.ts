import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, getTestDataSource } from '../test-utils/test-helpers';
import { createMinimalTestApp } from '../test-utils/minimal-test-app';
import { DataSource } from 'typeorm';

/**
 * Phase 2 Regression Tests
 *
 * Ensures all Phase 2 modules still functional after Phase 3 implementation:
 * - Order Enquiry (OE)
 * - Order Confirmation (OC)
 * - Contract
 * - Master Data (Items, Customers, Vendors)
 * - BOM
 *
 * Reference: Phase 3 - Regression Testing
 */
describe('Phase 2 Regression Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createMinimalTestApp();
    app = testApp;
    dataSource = await getTestDataSource(moduleRef);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'password123',
        company: 'HT',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('Order Enquiry (OE) Module', () => {
    it('should create OE Control', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: `OE-REG-${Date.now()}`,
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      expect(response.status).toBe(201);
    });

    it('should create OE Header', async () => {
      const oeNo = `OE-HDR-${Date.now()}`;

      // Create control first
      await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      const response = await request(app.getHttpServer())
        .post('/api/order-enquiry/header')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          oeDate: '2025-01-15',
          custNo: 'CUST001',
        });

      expect(response.status).toBe(201);
    });

    it('should create OE Detail', async () => {
      const oeNo = `OE-DTL-${Date.now()}`;

      await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      const response = await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          itemNo: 'ITEM001',
          qty: 100,
          price: 10.5,
        });

      expect(response.status).toBe(201);
    });

    it('should search OE', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/order-enquiry/enquiry')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Order Confirmation (OC) Module', () => {
    it('should post OE to OC', async () => {
      const oeNo = `OE-OC-${Date.now()}`;

      // Create OE first
      await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      const response = await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          companyCode: 'HT',
          oeNos: [oeNo],
        });

      expect(response.status).toBe(201);
    });

    it('should search OC', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/order-confirmation/enquiry')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 10,
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Contract Module', () => {
    it('should generate Contract from OC', async () => {
      const oeNo = `OE-CONT-${Date.now()}`;

      // Create OE and OC first
      await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          companyCode: 'HT',
          oeNos: [oeNo],
        });

      const confNo = `HT-OC/${oeNo}`;
      const response = await request(app.getHttpServer())
        .post('/api/contract/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          confNo,
        });

      expect([201, 200]).toContain(response.status);
    });

    it('should search Contracts', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contract/enquiry')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 10,
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Master Data - Items', () => {
    it('should create Item', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemNo: `ITEM-REG-${Date.now()}`,
          itemName: 'Test Item',
          unit: 'PCS',
        });

      expect(response.status).toBe(201);
    });

    it('should search Items', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 10,
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Master Data - Customers', () => {
    it('should create Customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          custNo: `CUST-REG-${Date.now()}`,
          custName: 'Test Customer',
        });

      expect(response.status).toBe(201);
    });

    it('should search Customers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 10,
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Master Data - Vendors', () => {
    it('should create Vendor', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vendorNo: `VEND-REG-${Date.now()}`,
          vendorName: 'Test Vendor',
        });

      expect(response.status).toBe(201);
    });

    it('should search Vendors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 10,
        });

      expect(response.status).toBe(200);
    });
  });

  describe('BOM Module', () => {
    it('should create BOM', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bom')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          headItemNo: `BOM-HEAD-${Date.now()}`,
          subItemNo: 'ITEM001',
          qty: 1,
        });

      expect(response.status).toBe(201);
    });

    it('should get BOM by head item', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/bom/ITEM001')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Cross-Phase Integration', () => {
    it('should maintain OE → OC → Contract → SO workflow', async () => {
      const oeNo = `OE-WORKFLOW-${Date.now()}`;

      // Create OE
      await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      // Post to OC
      const ocResponse = await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          companyCode: 'HT',
          oeNos: [oeNo],
        });

      expect(ocResponse.status).toBe(201);

      // Generate Contract
      const confNo = `HT-OC/${oeNo}`;
      const contractResponse = await request(app.getHttpServer())
        .post('/api/contract/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          confNo,
        });

      expect([201, 200]).toContain(contractResponse.status);

      // Create SO from OC (Phase 3)
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-WORKFLOW-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          ocNo: confNo,
          details: [],
        });

      expect(soResponse.status).toBe(201);
    });
  });
});
