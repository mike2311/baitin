import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getTestDataSource } from './test-utils/test-helpers';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

/**
 * Phase 3 Complete Workflow Integration Tests
 *
 * Original Logic Reference:
 * - Legacy Workflow: OE → OC → Contract → SO → DN → Invoice
 * - Documentation: docs/source/02-business-processes/workflow-overview.md
 * - Business Rules:
 *   - Test complete end-to-end workflow
 *   - Test data flow between modules
 *   - Test validation at each step
 *   - Test document generation
 *   - Test enquiry capabilities
 *
 * Reference: Phase 3 - Complete Workflow Integration
 */
describe('Phase 3 Complete Workflow Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createTestApp();
    app = testApp;
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

  describe('Complete Workflow: OE → OC → Contract → SO → DN → Invoice', () => {
    let oeNo: string;
    let oeId: number;
    let confNo: string;
    let contNo: string;
    let soNo: string;
    let dnNo: string;
    let invNo: string;

    it('should complete full workflow with all validations', async () => {
      // 1. Create Order Enquiry
      const oeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: 'OE-PHASE3-001',
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      expect(oeResponse.status).toBe(201);
      expect(oeResponse.body.oeNo).toBe('OE-PHASE3-001');
      oeNo = oeResponse.body.oeNo;

      // Create OE Header
      const oeHeaderResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/header')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: oeNo,
          oeDate: '2025-01-15',
          custNo: 'CUST001',
        });

      expect(oeHeaderResponse.status).toBe(201);
      oeId = oeHeaderResponse.body.id;

      // Create OE Detail
      const oeDetailResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: oeNo,
          itemNo: 'ITEM001',
          qty: 100,
          price: 10.50,
        });

      expect(oeDetailResponse.status).toBe(201);

      // 2. Convert to Order Confirmation
      const ocPostResponse = await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: oeNo,
          confNo: 'OC-PHASE3-001',
        });

      expect(ocPostResponse.status).toBe(201);
      confNo = ocPostResponse.body.confNo;

      // Verify OC was created
      const ocGetResponse = await request(app.getHttpServer())
        .get(`/api/order-confirmation/${confNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(ocGetResponse.status).toBe(200);
      expect(ocGetResponse.body.details).toHaveLength(1);

      // 3. Generate Contract
      const contractResponse = await request(app.getHttpServer())
        .post('/api/contracts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ocNo: confNo,
          contractNo: 'CONT-PHASE3-001',
          breakdown: [
            { port: 'PORT1', qty: 50 },
            { port: 'PORT2', qty: 50 },
          ],
        });

      expect(contractResponse.status).toBe(201);
      contNo = contractResponse.body.contractNo;

      // Verify contract was created with breakdown
      const contractGetResponse = await request(app.getHttpServer())
        .get(`/api/contracts/${contNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(contractGetResponse.status).toBe(200);
      expect(contractGetResponse.body.details[0].breakdowns).toHaveLength(2);

      // 4. Create Shipping Order
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-PHASE3-001',
          itemNo: 'ITEM001',
          qty: 100,
        });

      expect(soResponse.status).toBe(201);
      soNo = soResponse.body.soNo;

      // Generate SO document
      const soDocResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: [soNo],
          documentType: 'so_document',
          outputFormat: 'excel',
        });

      expect(soDocResponse.status).toBe(200);
      expect(soDocResponse.headers['content-type']).toContain('spreadsheetml');

      // 5. Create Delivery Note
      const dnResponse = await request(app.getHttpServer())
        .post('/api/delivery-notes/create-from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: [soNo],
          dnNo: 'DN-PHASE3-001',
          date: '2025-01-20',
        });

      expect(dnResponse.status).toBe(201);
      dnNo = dnResponse.body.dnNo;

      // Verify DN has breakdown from OE
      const dnGetResponse = await request(app.getHttpServer())
        .get(`/api/delivery-notes/${dnNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(dnGetResponse.status).toBe(200);
      expect(dnGetResponse.body.details[0].breakdowns).toBeDefined();

      // 6. Create Invoice
      const invoiceResponse = await request(app.getHttpServer())
        .post('/api/invoices/create-from-source')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sourceType: 'so',
          soNos: [soNo],
          invNo: 'INV-PHASE3-001',
          date: '2025-01-25',
        });

      expect(invoiceResponse.status).toBe(201);
      invNo = invoiceResponse.body.invNo;

      // Generate Packing List
      const plResponse = await request(app.getHttpServer())
        .post('/api/invoices/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNos: [invNo],
          documentType: 'packing_list',
          outputFormat: 'excel',
        });

      expect(plResponse.status).toBe(200);

      // Verify complete workflow data integrity
      const workflowCheckResponse = await request(app.getHttpServer())
        .get('/api/enquiries/workflow-status')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ oeNo, confNo, contNo, soNo, dnNo, invNo });

      expect(workflowCheckResponse.status).toBe(200);
      expect(workflowCheckResponse.body.status).toBe('completed');
    });

    it('should handle workflow with BOM items', async () => {
      // Create OE with BOM item
      const bomOeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: 'OE-BOM-001',
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      expect(bomOeResponse.status).toBe(201);
      const bomOeNo = bomOeResponse.body.oeNo;

      // Create OE Detail with BOM item
      await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: bomOeNo,
          itemNo: 'BOM001', // Assume BOM item exists
          qty: 10,
        });

      // Process through workflow
      const bomOcResponse = await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: bomOeNo,
          confNo: 'OC-BOM-001',
        });

      expect(bomOcResponse.status).toBe(201);

      // Verify BOM handling in subsequent steps
      const bomSoResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-BOM-001',
          itemNo: 'BOM001',
          qty: 10,
        });

      expect(bomSoResponse.status).toBe(201);
    });

    it('should handle workflow with quantity breakdowns', async () => {
      // Create OE with breakdown
      const breakdownOeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: 'OE-BREAKDOWN-001',
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      expect(breakdownOeResponse.status).toBe(201);
      const breakdownOeNo = breakdownOeResponse.body.oeNo;

      // Process through contract with breakdown
      const breakdownContractResponse = await request(app.getHttpServer())
        .post('/api/contracts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ocNo: 'OC-BREAKDOWN-001',
          contractNo: 'CONT-BREAKDOWN-001',
          breakdown: [
            { port: 'PORT1', qty: 30 },
            { port: 'PORT2', qty: 40 },
            { port: 'PORT3', qty: 30 },
          ],
        });

      expect(breakdownContractResponse.status).toBe(201);

      // Verify breakdown flows through DN
      const breakdownDnResponse = await request(app.getHttpServer())
        .post('/api/delivery-notes/create-from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: ['SO-BREAKDOWN-001'],
          dnNo: 'DN-BREAKDOWN-001',
          date: '2025-01-20',
        });

      expect(breakdownDnResponse.status).toBe(201);
    });

    it('should handle workflow with multiple containers', async () => {
      // Create multiple SOs
      const so1Response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-MULTI-001',
          itemNo: 'ITEM001',
          qty: 100,
        });

      const so2Response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-MULTI-002',
          itemNo: 'ITEM002',
          qty: 200,
        });

      expect(so1Response.status).toBe(201);
      expect(so2Response.status).toBe(201);

      // Create invoice selecting items by container
      const multiContainerInvoiceResponse = await request(app.getHttpServer())
        .post('/api/invoices/select-items-by-container')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          containerNos: ['CONT001', 'CONT002'],
          refNos: ['REF001'],
          custNo: 'CUST001',
        });

      expect(multiContainerInvoiceResponse.status).toBe(200);
    });

    it('should validate data integrity across workflow', async () => {
      // Test referential integrity
      const integrityCheckResponse = await request(app.getHttpServer())
        .get('/api/workflow/integrity-check')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          oeNo: 'OE-INTEGRITY-001',
          confNo: 'OC-INTEGRITY-001',
          soNo: 'SO-INTEGRITY-001',
        });

      expect(integrityCheckResponse.status).toBe(200);
      expect(integrityCheckResponse.body.isValid).toBeDefined();
    });
  });

  describe('SO Document Generation Workflow', () => {
    it('should generate SO document after creation', async () => {
      // Create SO first
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-DOC-001',
          itemNo: 'ITEM001',
          qty: 100,
        });

      expect(soResponse.status).toBe(201);
      const soNo = soResponse.body.soNo;

      // Generate document
      const docResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: [soNo],
          documentType: 'so_document',
          outputFormat: 'excel',
        });

      expect(docResponse.status).toBe(200);
      expect(docResponse.headers['content-type']).toContain('spreadsheetml');
    });

    it('should handle customer-specific formats', async () => {
      const spencerDocResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: ['SO-SPENCER-001'],
          documentType: 'so_document',
          outputFormat: 'excel',
          formatKey: 'SPENCER_FORMAT',
        });

      expect(spencerDocResponse.status).toBe(200);
    });

    it('should validate document output format', async () => {
      const invalidFormatResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: ['SO-VALIDATE-001'],
          documentType: 'so_document',
          outputFormat: 'invalid_format',
        });

      expect(invalidFormatResponse.status).toBe(400);
    });
  });

  describe('DN and Loading Workflow', () => {
    it('should create DN from SO and assign to loading', async () => {
      // Create SO
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-DN-LOAD-001',
          itemNo: 'ITEM001',
          qty: 100,
        });

      expect(soResponse.status).toBe(201);
      const soNo = soResponse.body.soNo;

      // Create DN
      const dnResponse = await request(app.getHttpServer())
        .post('/api/delivery-notes/create-from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: [soNo],
          dnNo: 'DN-LOAD-001',
          date: '2025-01-20',
        });

      expect(dnResponse.status).toBe(201);
      const dnNo = dnResponse.body.dnNo;

      // Create loading master
      const loadingResponse = await request(app.getHttpServer())
        .post('/api/loading/loading-master')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loadingNo: 'LOAD-TEST-001',
          vesselName: 'Test Vessel',
          voyageNo: 'V001',
        });

      expect(loadingResponse.status).toBe(201);
      const loadingNo = loadingResponse.body.loadingNo;

      // Assign DN to loading
      const assignResponse = await request(app.getHttpServer())
        .post('/api/loading/assign-dns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loadingNo,
          dnNos: [dnNo],
          containerNo: 'CONT001',
        });

      expect(assignResponse.status).toBe(200);

      // Verify DN status updated
      const dnStatusResponse = await request(app.getHttpServer())
        .get(`/api/delivery-notes/${dnNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(dnStatusResponse.body.loadingStatus).toBe('Loaded');
    });

    it('should update DN status on loading assignment', async () => {
      // Create and assign DN to loading
      const assignResponse = await request(app.getHttpServer())
        .post('/api/loading/assign-dns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loadingNo: 'LOAD-STATUS-001',
          dnNos: ['DN-STATUS-001'],
          containerNo: 'CONT001',
        });

      expect(assignResponse.status).toBe(200);

      // Verify status change
      const statusCheckResponse = await request(app.getHttpServer())
        .get('/api/delivery-notes/DN-STATUS-001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusCheckResponse.body.loadingStatus).toBe('Loaded');
    });

    it('should handle multiple DNs in one loading', async () => {
      const multiDnResponse = await request(app.getHttpServer())
        .post('/api/loading/assign-dns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loadingNo: 'LOAD-MULTI-001',
          dnNos: ['DN-MULTI-001', 'DN-MULTI-002', 'DN-MULTI-003'],
          containerNo: 'CONT001',
        });

      expect(multiDnResponse.status).toBe(200);
      expect(multiDnResponse.body.assignedDns).toHaveLength(3);
    });
  });

  describe('Invoice Document Generation Workflow', () => {
    it('should create invoice and generate packing list', async () => {
      // Create invoice
      const invoiceResponse = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: 'INV-PL-001',
          date: '2025-01-25',
          custNo: 'CUST001',
          ocNo: 'OC-PL-001',
          details: [{
            itemNo: 'ITEM001',
            qty: 100,
            price: 10.50,
          }],
        });

      expect(invoiceResponse.status).toBe(201);
      const invNo = invoiceResponse.body.invNo;

      // Generate packing list
      const plResponse = await request(app.getHttpServer())
        .post('/api/invoices/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNos: [invNo],
          documentType: 'packing_list',
          outputFormat: 'excel',
        });

      expect(plResponse.status).toBe(200);
      expect(plResponse.headers['content-type']).toContain('spreadsheetml');
    });

    it('should generate Spencer format packing list', async () => {
      const spencerPlResponse = await request(app.getHttpServer())
        .post('/api/invoices/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNos: ['INV-SPENCER-001'],
          documentType: 'packing_list_spencer',
          outputFormat: 'excel',
        });

      expect(spencerPlResponse.status).toBe(200);
    });

    it('should generate shipment advice', async () => {
      const saResponse = await request(app.getHttpServer())
        .post('/api/invoices/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNos: ['INV-SA-001'],
          documentType: 'shipment_advice',
          outputFormat: 'excel',
        });

      expect(saResponse.status).toBe(200);
    });

    it('should generate debit note', async () => {
      const dnResponse = await request(app.getHttpServer())
        .post('/api/invoices/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNos: ['INV-DN-001'],
          documentType: 'debit_note',
          outputFormat: 'excel',
        });

      expect(dnResponse.status).toBe(200);
    });
  });

  describe('Enquiry and Reporting Workflow', () => {
    it('should perform sales analysis enquiry', async () => {
      const analysisResponse = await request(app.getHttpServer())
        .get('/api/enquiries/sales-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          analysisType: 'by_customer',
          dateFrom: '2025-01-01',
          dateTo: '2025-01-31',
        });

      expect(analysisResponse.status).toBe(200);
      expect(Array.isArray(analysisResponse.body)).toBe(true);
    });

    it('should perform item enquiry with historical data', async () => {
      const itemEnquiryResponse = await request(app.getHttpServer())
        .get('/api/enquiries/item')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          itemNo: 'ITEM001',
          dateFrom: '2025-01-01',
          dateTo: '2025-01-31',
        });

      expect(itemEnquiryResponse.status).toBe(200);
      expect(itemEnquiryResponse.body.itemNo).toBe('ITEM001');
    });

    it('should generate report with parameters', async () => {
      const reportResponse = await request(app.getHttpServer())
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'sales_analysis',
          parameters: {
            dateFrom: '2025-01-01',
            dateTo: '2025-01-31',
          },
          outputFormat: 'excel',
        });

      expect(reportResponse.status).toBe(200);
      expect(reportResponse.headers['content-type']).toContain('spreadsheetml');
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle invalid workflow transitions', async () => {
      // Try to create DN without SO
      const invalidDnResponse = await request(app.getHttpServer())
        .post('/api/delivery-notes/create-from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: ['INVALID_SO'],
          dnNo: 'DN-INVALID-001',
          date: '2025-01-20',
        });

      expect(invalidDnResponse.status).toBe(400);
    });

    it('should prevent duplicate document numbers', async () => {
      // Create first SO
      await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-DUPLICATE-001',
          itemNo: 'ITEM001',
          qty: 100,
        });

      // Try to create duplicate
      const duplicateResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-DUPLICATE-001',
          itemNo: 'ITEM002',
          qty: 200,
        });

      expect(duplicateResponse.status).toBe(400);
    });

    it('should validate required fields', async () => {
      const invalidOeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          oeDate: '2025-01-15',
        });

      expect(invalidOeResponse.status).toBe(400);
    });

    it('should handle concurrent operations', async () => {
      // Test concurrent document generation
      const promises = Array(5).fill().map((_, i) =>
        request(app.getHttpServer())
          .post('/api/invoices/documents/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            invNos: [`INV-CONCURRENT-${i}`],
            documentType: 'packing_list',
            outputFormat: 'excel',
          })
      );

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
    });
  });
});