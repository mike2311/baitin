import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, getTestDataSource } from '../test-utils/test-helpers';
import { DataSource } from 'typeorm';

/**
 * Cross-Phase Integration Tests
 *
 * Tests integration between Phase 2 and Phase 3:
 * - Phase 2 → Phase 3 data flow
 * - Shared master data consistency
 * - Common utilities and services
 * - Database schema compatibility
 *
 * Reference: Phase 3 - Regression Testing
 */
describe('Cross-Phase Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createTestApp();
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

  describe('Phase 2 → Phase 3 Data Flow', () => {
    it('should create SO from OC created in Phase 2', async () => {
      const oeNo = `OE-PHASE2-${Date.now()}`;
      
      // Phase 2: Create OE
      await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      // Phase 2: Post to OC
      await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          companyCode: 'HT',
          oeNos: [oeNo],
        });

      // Phase 3: Create SO from OC
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-PHASE2-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          ocNo: `HT-OC/${oeNo}`,
          details: [],
        });

      expect(soResponse.status).toBe(201);
    });

    it('should create Invoice from Contract created in Phase 2', async () => {
      const oeNo = `OE-INV-${Date.now()}`;
      
      // Phase 2: Create OE → OC → Contract
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
      await request(app.getHttpServer())
        .post('/api/contract/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          confNo,
        });

      // Phase 3: Create Invoice
      const invResponse = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-PHASE2-${Date.now()}`,
          date: '2025-01-18',
          custNo: 'CUST001',
          ocNo: confNo,
          details: [],
        });

      expect(invResponse.status).toBe(201);
    });
  });

  describe('Shared Master Data Consistency', () => {
    it('should use same Customer master data across phases', async () => {
      const custNo = `CUST-SHARED-${Date.now()}`;
      
      // Create customer
      await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          custNo,
          custName: 'Shared Customer',
        });

      // Phase 2: Use in OE
      const oeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: `OE-SHARED-${Date.now()}`,
          custNo,
          oeDate: '2025-01-15',
        });

      expect(oeResponse.status).toBe(201);

      // Phase 3: Use in SO
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-SHARED-${Date.now()}`,
          date: '2025-01-15',
          custNo,
          details: [],
        });

      expect(soResponse.status).toBe(201);
    });

    it('should use same Item master data across phases', async () => {
      const itemNo = `ITEM-SHARED-${Date.now()}`;
      
      // Create item
      await request(app.getHttpServer())
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemNo,
          itemName: 'Shared Item',
          unit: 'PCS',
        });

      // Phase 2: Use in OE
      const oeNo = `OE-ITEM-${Date.now()}`;
      await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          itemNo,
          qty: 100,
          price: 10.50,
        });

      // Phase 3: Use in Invoice
      const invResponse = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-ITEM-${Date.now()}`,
          date: '2025-01-18',
          custNo: 'CUST001',
          details: [
            {
              itemNo,
              qty: 100,
              price: 10.50,
            },
          ],
        });

      expect(invResponse.status).toBe(201);
    });
  });

  describe('Database Schema Compatibility', () => {
    it('should maintain referential integrity across phases', async () => {
      // Create master data
      const custNo = `CUST-REF-${Date.now()}`;
      await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          custNo,
          custName: 'Ref Customer',
        });

      // Phase 2: Create OE with customer
      const oeNo = `OE-REF-${Date.now()}`;
      await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          custNo,
          oeDate: '2025-01-15',
        });

      // Phase 3: Create SO with same customer
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-REF-${Date.now()}`,
          date: '2025-01-15',
          custNo,
          details: [],
        });

      expect(soResponse.status).toBe(201);
    });
  });
});
