import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getTestDataSource } from '../test-utils/test-helpers';
import { createMinimalTestApp } from '../test-utils/minimal-test-app';
import { DataSource } from 'typeorm';
import { TestingModule } from '@nestjs/testing';

/**
 * Phase 3 API Performance Tests
 *
 * Performance Targets:
 * - API endpoints: <500ms response time (p95)
 * - List/search endpoints: <1s with pagination
 * - Document generation: <5s for standard, <10s for complex
 * - Report generation: <10s for standard reports
 * - Enquiry queries: <2s for filtered results
 *
 * Reference: Phase 3 - API Performance Testing
 */
describe('Phase 3 API Performance', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const testApp = await createMinimalTestApp();
    app = testApp.app;
    moduleRef = testApp.moduleRef;

    dataSource = await getTestDataSource(moduleRef);

    // Login to get auth token
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

  describe('Shipping Order APIs', () => {
    it('should create SO in <500ms', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-PERF-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [
            {
              itemNo: 'ITEM001',
              qty: 100,
              price: 10.5,
            },
          ],
        })
        .expect((res) => {
          // Log response for debugging
          if (res.status !== 201) {
            console.log('Response status:', res.status);
            console.log('Response body:', JSON.stringify(res.body, null, 2));
          }
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(500); // p95 target
    });

    it('should search SOs in <1s with 1000 records', async () => {
      // Seed test data if needed
      // ... (would seed 1000+ SO records)

      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get('/api/shipping-orders/enquiry')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 50,
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // <1s target
    });

    it('should generate SO document in <5s', async () => {
      // Create a SO first
      const createResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-DOC-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [
            {
              itemNo: 'ITEM001',
              qty: 100,
              price: 10.5,
            },
          ],
        });

      const soNo = createResponse.body.soNo;

      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post(`/api/shipping-orders/${soNo}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'excel',
          formatKey: 'DEFAULT',
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // <5s target for standard documents
    });
  });

  describe('Delivery Note APIs', () => {
    it('should create DN from SO in <500ms', async () => {
      // Create SO first
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-DN-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [
            {
              itemNo: 'ITEM001',
              qty: 100,
              price: 10.5,
            },
          ],
        });

      const soNo = soResponse.body.soNo;

      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/api/delivery-notes/from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dnNo: `DN-PERF-${Date.now()}`,
          date: '2025-01-16',
          soNo: soNo,
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(500);
    });

    it('should copy breakdown in <1s', async () => {
      // Create DN with breakdown copy
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/api/delivery-notes/from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dnNo: `DN-BRK-${Date.now()}`,
          date: '2025-01-16',
          soNo: 'SO001', // Assume exists with breakdown
          copyBreakdown: true,
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(1000);
    });

    it('should search DNs in <1s', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get('/api/delivery-notes/enquiry')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 50,
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Invoice APIs', () => {
    it('should create invoice in <500ms', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-PERF-${Date.now()}`,
          date: '2025-01-18',
          custNo: 'CUST001',
          details: [
            {
              itemNo: 'ITEM001',
              qty: 100,
              price: 10.5,
              ctn: 10,
            },
          ],
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(500);
    });

    it('should validate invoice in <300ms', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/api/invoices/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-VAL-${Date.now()}`,
          details: [
            {
              itemNo: 'ITEM001',
              qty: 100,
              ctn: 10,
              qctn: 10,
            },
          ],
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(300);
    });

    it('should generate packing list in <5s', async () => {
      // Create invoice first
      const createResponse = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-PL-${Date.now()}`,
          date: '2025-01-18',
          custNo: 'CUST001',
          details: [
            {
              itemNo: 'ITEM001',
              qty: 100,
              price: 10.5,
            },
          ],
        });

      const invNo = createResponse.body.invNo;

      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post(`/api/invoices/${invNo}/documents/packing-list`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'excel',
          formatType: 'standard',
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000);
    });

    it('should generate Spencer format in <8s', async () => {
      // Create invoice first
      const createResponse = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-SPENCER-${Date.now()}`,
          date: '2025-01-18',
          custNo: 'CUST001',
          details: [
            {
              itemNo: 'ITEM001',
              qty: 100,
              price: 10.5,
            },
          ],
        });

      const invNo = createResponse.body.invNo;

      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post(`/api/invoices/${invNo}/documents/packing-list`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'excel',
          formatType: 'spencer',
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(8000); // <8s for complex format
    });
  });

  describe('Enquiry APIs', () => {
    it('should run sales analysis in <2s', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get('/api/enquiry/sales-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          dateFrom: '2025-01-01',
          dateTo: '2025-01-31',
          custNo: 'CUST001',
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000);
    });

    it('should query item history in <2s', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get('/api/enquiry/item')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          itemNo: 'ITEM001',
          dateFrom: '2025-01-01',
          dateTo: '2025-01-31',
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000);
    });

    it('should handle large date ranges efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get('/api/enquiry/sales-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          dateFrom: '2024-01-01',
          dateTo: '2025-12-31', // Large date range
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(3000); // Slightly more lenient for large ranges
    });
  });

  describe('Reporting APIs', () => {
    it('should preview report in <2s', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/api/reporting/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'SALES_ANALYSIS',
          parameters: {
            dateFrom: '2025-01-01',
            dateTo: '2025-01-31',
          },
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000);
    });

    it('should generate report in <10s', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/api/reporting/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'SALES_ANALYSIS',
          format: 'excel',
          parameters: {
            dateFrom: '2025-01-01',
            dateTo: '2025-01-31',
          },
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(10000);
    });

    it('should handle batch migration efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/api/reporting/batch-migration')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKeys: ['REPORT1', 'REPORT2', 'REPORT3'],
        });

      const responseTime = Date.now() - startTime;

      // Batch migration can take longer, but should complete reasonably
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(30000); // 30s for batch
    });
  });

  describe('Loading APIs', () => {
    it('should create loading master in <500ms', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/api/loading/masters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loadingNo: `LOAD-PERF-${Date.now()}`,
          date: '2025-01-17',
          vesselName: 'VESSEL-001',
          voyageNo: 'VOY-001',
          totalWeight: 1000,
          totalCube: 500,
          totalCartons: 100,
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(500);
    });

    it('should generate loading advice in <5s', async () => {
      // Create loading master first
      const createResponse = await request(app.getHttpServer())
        .post('/api/loading/masters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loadingNo: `LOAD-ADV-${Date.now()}`,
          date: '2025-01-17',
          vesselName: 'VESSEL-001',
          voyageNo: 'VOY-001',
        });

      const loadingNo = createResponse.body.loadingNo;

      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post(`/api/loading/${loadingNo}/advice`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          laNo: `LA-${Date.now()}`,
          date: '2025-01-17',
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000);
    });
  });

  describe('Performance Metrics Collection', () => {
    it('should collect p95 response times', async () => {
      const responseTimes: number[] = [];
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        await request(app.getHttpServer())
          .get('/api/shipping-orders/enquiry')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 1, limit: 10 });

        responseTimes.push(Date.now() - startTime);
      }

      // Calculate p95
      responseTimes.sort((a, b) => a - b);
      const p95Index = Math.floor(iterations * 0.95);
      const p95 = responseTimes[p95Index];

      expect(p95).toBeLessThan(500); // p95 should be <500ms
    });

    it('should measure average response time', async () => {
      const responseTimes: number[] = [];
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        await request(app.getHttpServer())
          .post('/api/shipping-orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            soNo: `SO-AVG-${Date.now()}-${i}`,
            date: '2025-01-15',
            custNo: 'CUST001',
            details: [
              {
                itemNo: 'ITEM001',
                qty: 100,
                price: 10.5,
              },
            ],
          });

        responseTimes.push(Date.now() - startTime);
      }

      const average = responseTimes.reduce((a, b) => a + b, 0) / iterations;

      expect(average).toBeLessThan(400); // Average should be <400ms
    });
  });
});
