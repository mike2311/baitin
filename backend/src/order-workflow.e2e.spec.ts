import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { getTestDataSource } from './test-utils/test-helpers';
import { DataSource } from 'typeorm';

/**
 * End-to-End Workflow Test
 *
 * Original Logic Reference:
 * - Legacy Workflow: OE → OC → Contract → SO → DN → Invoice
 * - Documentation: docs/source/02-business-processes/workflow-overview.md
 * - Business Rules:
 *   - Complete workflow from Order Enquiry to Invoice
 *   - Validates data flow and relationships
 *   - Tests negative scenarios
 *
 * Reference: Phase 3 - Integration Testing
 */
describe('Order Workflow E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = await getTestDataSource();

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

  describe('Complete Workflow: OE → OC → Contract → SO → DN → Invoice', () => {
    let contNo: string;
    let soNo: string;
    let dnNo: string;
    let invNo: string;

    it('should create Order Enquiry', async () => {
      // Create OE Control
      const oeControlResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: 'OE-TEST-001',
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      expect(oeControlResponse.status).toBe(201);

      // Create OE Header
      const oeHeaderResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/header')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: 'OE-TEST-001',
          oeDate: '2025-01-15',
          custNo: 'CUST001',
        });

      expect(oeHeaderResponse.status).toBe(201);

      // Create OE Detail
      const oeDetailResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: 'OE-TEST-001',
          itemNo: 'ITEM001',
          qty: 100,
          price: 10.5,
        });

      expect(oeDetailResponse.status).toBe(201);
    });

    it('should post OE to Order Confirmation', async () => {
      const postResponse = await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: 'OE-TEST-001',
          confNo: 'OC-TEST-001',
        });

      expect(postResponse.status).toBe(201);
    });

    it('should generate Contract from OC', async () => {
      const contractResponse = await request(app.getHttpServer())
        .post('/api/contract/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          confNo: 'OC-TEST-001',
        });

      expect(contractResponse.status).toBe(201);
      contNo = contractResponse.body.contNo;
    });

    it('should create Shipping Order from Contract', async () => {
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders/from-source')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-TEST-001',
          sourceType: 'contract',
          sourceNo: contNo,
          selectedItems: [
            {
              itemNo: 'ITEM001',
              qty: 100,
            },
          ],
        });

      expect(soResponse.status).toBe(201);
      soNo = 'SO-TEST-001';
    });

    it('should create Delivery Note from SO', async () => {
      const dnResponse = await request(app.getHttpServer())
        .post('/api/delivery-notes/from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dnNo: 'DN-TEST-001',
          date: '2025-01-20',
          soNo: 'SO-TEST-001',
          copyBreakdowns: true,
        });

      expect(dnResponse.status).toBe(201);
      dnNo = 'DN-TEST-001';
    });

    it('should create Invoice from SO', async () => {
      const invResponse = await request(app.getHttpServer())
        .post('/api/invoices/from-source')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: 'INV-TEST-001',
          date: '2025-01-25',
          sourceType: 'so',
          sourceNo: 'SO-TEST-001',
        });

      expect(invResponse.status).toBe(201);
      invNo = 'INV-TEST-001';
    });

    it('should verify complete workflow data integrity', async () => {
      // Verify Invoice links back to SO
      const invoice = await request(app.getHttpServer())
        .get(`/api/invoices/${invNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(invoice.status).toBe(200);
      expect(invoice.body.invNo).toBe(invNo);

      // Verify DN links to SO
      const dn = await request(app.getHttpServer())
        .get(`/api/delivery-notes/${dnNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(dn.status).toBe(200);
      expect(dn.body.soNo).toBe(soNo);

      // Verify SO links to Contract
      const so = await request(app.getHttpServer())
        .get(`/api/shipping-orders/${soNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(so.status).toBe(200);
      expect(so.body.contNo).toBe(contNo);
    });
  });

  describe('Negative Scenarios', () => {
    it('should reject creating SO with invalid OC', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders/from-source')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-INVALID-001',
          sourceType: 'oc',
          sourceNo: 'INVALID-OC',
          selectedItems: [],
        });

      expect(response.status).toBe(404);
    });

    it('should reject creating DN with invalid SO', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/delivery-notes/from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dnNo: 'DN-INVALID-001',
          date: '2025-01-20',
          soNo: 'INVALID-SO',
        });

      expect(response.status).toBe(404);
    });

    it('should reject creating Invoice with invalid source', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/invoices/from-source')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: 'INV-INVALID-001',
          date: '2025-01-25',
          sourceType: 'so',
          sourceNo: 'INVALID-SO',
        });

      expect(response.status).toBe(404);
    });
  });
});
