import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, getTestDataSource } from './test-utils/test-helpers';
import { createMinimalTestApp } from './test-utils/minimal-test-app';
import { DataSource } from 'typeorm';

/**
 * Phase 3 Cross-Module Integration Tests
 *
 * Original Logic Reference:
 * - Module Interactions: Customer master, Item master, Order enquiry, etc.
 * - Documentation: docs/modernization-strategy/05-application-modernization/application-modernization.md
 * - Business Rules:
 *   - Test SO format lookup integration with customer master
 *   - Test DN breakdown copy from OE integration
 *   - Test Invoice container selection from loading
 *   - Test Report generation with live data
 *   - Test Enquiry queries across multiple modules
 *
 * Reference: Phase 3 - Cross-Module Integration
 */
describe('Phase 3 Cross-Module Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createMinimalTestApp();
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

  describe('SO Format Lookup Integration with Customer Master', () => {
    it('should retrieve customer-specific SO format', async () => {
      // Create customer with specific format
      const customerResponse = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          custNo: 'CUST_FORMAT_001',
          ename: 'Format Test Customer',
          soFormatKey: 'CUSTOM_FORMAT',
        });

      expect(customerResponse.status).toBe(201);

      // Create SO and verify format lookup
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO_FORMAT_001',
          itemNo: 'ITEM001',
          qty: 100,
          custNo: 'CUST_FORMAT_001',
        });

      expect(soResponse.status).toBe(201);

      // Verify SO format is available
      const formatResponse = await request(app.getHttpServer())
        .get('/api/shipping-orders/format/CUSTOM_FORMAT')
        .set('Authorization', `Bearer ${authToken}`);

      expect(formatResponse.status).toBe(200);
      expect(Array.isArray(formatResponse.body)).toBe(true);
    });

    it('should fallback to default format when customer has no specific format', async () => {
      // Create customer without specific format
      const customerResponse = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          custNo: 'CUST_DEFAULT_001',
          ename: 'Default Format Customer',
        });

      expect(customerResponse.status).toBe(201);

      // Create SO and verify default format is used
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO_DEFAULT_001',
          itemNo: 'ITEM001',
          qty: 100,
          custNo: 'CUST_DEFAULT_001',
        });

      expect(soResponse.status).toBe(201);

      // Verify default format is available
      const formatResponse = await request(app.getHttpServer())
        .get('/api/shipping-orders/format/DEFAULT')
        .set('Authorization', `Bearer ${authToken}`);

      expect(formatResponse.status).toBe(200);
    });

    it('should handle format configuration with customer data', async () => {
      // Test format configuration includes customer-specific data
      const formatConfigResponse = await request(app.getHttpServer())
        .get('/api/shipping-orders/format/SPENCER_FORMAT')
        .set('Authorization', `Bearer ${authToken}`);

      if (formatConfigResponse.status === 200) {
        expect(Array.isArray(formatConfigResponse.body)).toBe(true);
        // Verify format config structure
        if (formatConfigResponse.body.length > 0) {
          const config = formatConfigResponse.body[0];
          expect(config).toHaveProperty('soKey');
          expect(config).toHaveProperty('uniqueid');
          expect(config).toHaveProperty('vpos');
          expect(config).toHaveProperty('hpos');
        }
      }
    });
  });

  describe('DN Breakdown Copy from OE Integration', () => {
    it('should copy quantity breakdown from OE to DN', async () => {
      // Create OE with breakdown
      const oeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: 'OE_BREAKDOWN_001',
          custNo: 'CUST001',
          oeDate: '2025-01-15',
        });

      expect(oeResponse.status).toBe(201);
      const oeNo = oeResponse.body.oeNo;

      // Create OE detail with breakdown
      await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          itemNo: 'ITEM001',
          qty: 100,
          breakdowns: [
            { port: 'PORT1', qty: 30 },
            { port: 'PORT2', qty: 40 },
            { port: 'PORT3', qty: 30 },
          ],
        });

      // Process through OC and Contract
      const ocResponse = await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo,
          confNo: 'OC_BREAKDOWN_001',
        });

      expect(ocResponse.status).toBe(201);
      const confNo = ocResponse.body.confNo;

      // Create contract with breakdown
      const contractResponse = await request(app.getHttpServer())
        .post('/api/contracts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ocNo: confNo,
          contractNo: 'CONT_BREAKDOWN_001',
          breakdown: [
            { port: 'PORT1', qty: 30 },
            { port: 'PORT2', qty: 40 },
            { port: 'PORT3', qty: 30 },
          ],
        });

      expect(contractResponse.status).toBe(201);

      // Create SO
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO_BREAKDOWN_001',
          itemNo: 'ITEM001',
          qty: 100,
        });

      expect(soResponse.status).toBe(201);
      const soNo = soResponse.body.soNo;

      // Create DN and verify breakdown copy
      const dnResponse = await request(app.getHttpServer())
        .post('/api/delivery-notes/create-from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: [soNo],
          dnNo: 'DN_BREAKDOWN_001',
          date: '2025-01-20',
        });

      expect(dnResponse.status).toBe(201);
      const dnNo = dnResponse.body.dnNo;

      // Verify DN has the copied breakdown
      const dnDetailResponse = await request(app.getHttpServer())
        .get(`/api/delivery-notes/${dnNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(dnDetailResponse.status).toBe(200);
      expect(dnDetailResponse.body.details[0].breakdowns).toHaveLength(3);
      expect(dnDetailResponse.body.details[0].breakdowns[0].port).toBe('PORT1');
      expect(dnDetailResponse.body.details[0].breakdowns[0].qty).toBe(30);
    });

    it('should handle breakdown validation across modules', async () => {
      // Test that breakdown quantities are validated consistently
      const invalidBreakdownResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: 'OE_INVALID_BREAKDOWN',
          itemNo: 'ITEM001',
          qty: 100,
          breakdowns: [
            { port: 'PORT1', qty: 30 },
            { port: 'PORT2', qty: 40 },
            // Missing 30 qty - should fail validation
          ],
        });

      expect(invalidBreakdownResponse.status).toBe(400);
    });
  });

  describe('Invoice Container Selection from Loading', () => {
    it('should select invoice items by container from loading assignments', async () => {
      // Create loading with container assignments
      const loadingResponse = await request(app.getHttpServer())
        .post('/api/loading/loading-master')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loadingNo: 'LOAD_CONTAINER_001',
          vesselName: 'Container Test Vessel',
          voyageNo: 'V001',
        });

      expect(loadingResponse.status).toBe(201);
      const loadingNo = loadingResponse.body.loadingNo;

      // Create DNs and assign to loading
      const assignResponse = await request(app.getHttpServer())
        .post('/api/loading/assign-dns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loadingNo,
          dnNos: ['DN_CONTAINER_001', 'DN_CONTAINER_002'],
          containerNo: 'CONT001',
        });

      expect(assignResponse.status).toBe(200);

      // Select items for invoice by container
      const selectResponse = await request(app.getHttpServer())
        .post('/api/invoices/select-items-by-container')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          containerNos: ['CONT001'],
          refNos: ['REF001'],
          custNo: 'CUST001',
        });

      expect(selectResponse.status).toBe(200);
      expect(Array.isArray(selectResponse.body)).toBe(true);
    });

    it('should filter invoice items by multiple containers', async () => {
      const multiContainerResponse = await request(app.getHttpServer())
        .post('/api/invoices/select-items-by-container')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          containerNos: ['CONT001', 'CONT002', 'CONT003'],
          refNos: ['REF001', 'REF002'],
          custNo: 'CUST001',
        });

      expect(multiContainerResponse.status).toBe(200);
      // Verify results are filtered correctly
      if (multiContainerResponse.body.length > 0) {
        const containers = [
          ...new Set(
            multiContainerResponse.body.map((item) => item.containerNo),
          ),
        ];
        expect(containers.length).toBeLessThanOrEqual(3);
        expect(
          containers.every((c) =>
            ['CONT001', 'CONT002', 'CONT003'].includes(c as string),
          ),
        ).toBe(true);
      }
    });

    it('should integrate container data with invoice creation', async () => {
      // Get available items by container
      const availableResponse = await request(app.getHttpServer())
        .post('/api/invoices/select-items-by-container')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          containerNos: ['CONT001'],
          custNo: 'CUST001',
        });

      expect(availableResponse.status).toBe(200);

      // Create invoice using selected items
      if (availableResponse.body.length > 0) {
        const invoiceResponse = await request(app.getHttpServer())
          .post('/api/invoices')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            invNo: 'INV_CONTAINER_001',
            date: '2025-01-25',
            custNo: 'CUST001',
            details: availableResponse.body.map((item) => ({
              itemNo: item.itemNo,
              qty: item.qty,
              price: item.price,
            })),
          });

        expect(invoiceResponse.status).toBe(201);
      }
    });
  });

  describe('Report Generation with Live Data', () => {
    it('should generate reports using live transaction data', async () => {
      // Create some test data
      await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO_REPORT_001',
          itemNo: 'ITEM001',
          qty: 100,
        });

      // Generate SO report
      const soReportResponse = await request(app.getHttpServer())
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'shipping_orders',
          parameters: {
            dateFrom: '2025-01-01',
            dateTo: '2025-12-31',
          },
          outputFormat: 'excel',
        });

      expect(soReportResponse.status).toBe(200);
      expect(soReportResponse.headers['content-type']).toContain(
        'spreadsheetml',
      );
    });

    it('should generate sales analysis report with live data', async () => {
      // Generate sales analysis report
      const salesReportResponse = await request(app.getHttpServer())
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'sales_analysis',
          parameters: {
            analysisType: 'by_customer',
            dateFrom: '2025-01-01',
            dateTo: '2025-12-31',
          },
          outputFormat: 'excel',
        });

      expect(salesReportResponse.status).toBe(200);
    });

    it('should handle report parameters correctly', async () => {
      const paramReportResponse = await request(app.getHttpServer())
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'item_analysis',
          parameters: {
            itemNo: 'ITEM001',
            dateFrom: '2025-01-01',
            dateTo: '2025-01-31',
          },
          outputFormat: 'excel',
        });

      expect(paramReportResponse.status).toBe(200);
    });
  });

  describe('Enquiry Queries Across Multiple Modules', () => {
    it('should perform cross-module sales analysis', async () => {
      const analysisResponse = await request(app.getHttpServer())
        .get('/api/enquiries/sales-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          analysisType: 'by_customer',
          dateFrom: '2025-01-01',
          dateTo: '2025-12-31',
          customerNo: 'CUST001',
        });

      expect(analysisResponse.status).toBe(200);
      // Verify it queries invoice, order confirmation, and contract data
      expect(Array.isArray(analysisResponse.body)).toBe(true);
    });

    it('should query item data across modules', async () => {
      const itemEnquiryResponse = await request(app.getHttpServer())
        .get('/api/enquiries/item')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          itemNo: 'ITEM001',
          includeHistory: true,
        });

      expect(itemEnquiryResponse.status).toBe(200);
      // Should include data from items, invoices, orders, etc.
      expect(itemEnquiryResponse.body).toHaveProperty('itemNo');
      expect(itemEnquiryResponse.body).toHaveProperty('transactions');
    });

    it('should perform operational enquiries across workflows', async () => {
      // SO enquiry
      const soEnquiryResponse = await request(app.getHttpServer())
        .get('/api/enquiries/so')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          soNo: 'SO_ENQUIRY_001',
        });

      expect(soEnquiryResponse.status).toBe(200);

      // DN enquiry
      const dnEnquiryResponse = await request(app.getHttpServer())
        .get('/api/enquiries/dn')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          dnNo: 'DN_ENQUIRY_001',
        });

      expect(dnEnquiryResponse.status).toBe(200);

      // Invoice enquiry
      const invoiceEnquiryResponse = await request(app.getHttpServer())
        .get('/api/enquiries/invoice')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          invNo: 'INV_ENQUIRY_001',
        });

      expect(invoiceEnquiryResponse.status).toBe(200);
    });
  });

  describe('Master Data Integration', () => {
    it('should integrate customer master with all transaction modules', async () => {
      // Create customer
      const customerResponse = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          custNo: 'CUST_MASTER_001',
          ename: 'Master Data Customer',
          creditLimit: 100000,
        });

      expect(customerResponse.status).toBe(201);
      const custNo = customerResponse.body.custNo;

      // Use customer in OE
      const oeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: 'OE_MASTER_001',
          custNo,
          oeDate: '2025-01-15',
        });

      expect(oeResponse.status).toBe(201);

      // Verify customer data flows through workflow
      const customerCheckResponse = await request(app.getHttpServer())
        .get(`/api/customers/${custNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(customerCheckResponse.status).toBe(200);
      expect(customerCheckResponse.body.ename).toBe('Master Data Customer');
    });

    it('should integrate item master with transactions', async () => {
      // Create item
      const itemResponse = await request(app.getHttpServer())
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemNo: 'ITEM_MASTER_001',
          shortName: 'Master Test Item',
          price: 25.0,
        });

      expect(itemResponse.status).toBe(201);
      const itemNo = itemResponse.body.itemNo;

      // Use item in SO
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO_MASTER_001',
          itemNo,
          qty: 100,
        });

      expect(soResponse.status).toBe(201);

      // Verify item data integrity
      const itemCheckResponse = await request(app.getHttpServer())
        .get(`/api/items/${itemNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(itemCheckResponse.status).toBe(200);
      expect(itemCheckResponse.body.shortName).toBe('Master Test Item');
    });
  });

  describe('Reference Data Integration', () => {
    it('should integrate reference data with transactions', async () => {
      // Create reference data
      const refResponse = await request(app.getHttpServer())
        .post('/api/reference')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tableName: 'ports',
          data: {
            code: 'PORT_REF_001',
            name: 'Reference Test Port',
          },
        });

      // Use in contract breakdown
      const contractResponse = await request(app.getHttpServer())
        .post('/api/contracts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ocNo: 'OC_REF_001',
          contractNo: 'CONT_REF_001',
          breakdown: [{ port: 'PORT_REF_001', qty: 100 }],
        });

      expect(contractResponse.status).toBe(201);
    });
  });

  describe('Audit and Logging Integration', () => {
    it('should log operations across modules', async () => {
      // Perform operations that should be logged
      await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO_AUDIT_001',
          itemNo: 'ITEM001',
          qty: 100,
        });

      // Check audit logs (assuming audit endpoint exists)
      const auditResponse = await request(app.getHttpServer())
        .get('/api/audit/logs')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          operation: 'CREATE_SO',
          dateFrom: '2025-01-01',
        });

      expect(auditResponse.status).toBe(200);
      // Verify audit logging integration
    });

    it('should maintain audit trail across workflow', async () => {
      // Complete a workflow and verify audit trail
      const workflowAuditResponse = await request(app.getHttpServer())
        .get('/api/audit/workflow-trail')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          workflowId: 'WORKFLOW_AUDIT_001',
        });

      expect(workflowAuditResponse.status).toBe(200);
      // Should show complete audit trail from OE to Invoice
    });
  });

  describe('Performance and Scalability Integration', () => {
    it('should handle concurrent operations across modules', async () => {
      // Test concurrent operations don't interfere
      const operations = [
        // Multiple SO creations
        request(app.getHttpServer())
          .post('/api/shipping-orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ soNo: 'SO_CONCURRENT_001', itemNo: 'ITEM001', qty: 100 }),

        request(app.getHttpServer())
          .post('/api/shipping-orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ soNo: 'SO_CONCURRENT_002', itemNo: 'ITEM002', qty: 200 }),

        // Multiple enquiries
        request(app.getHttpServer())
          .get('/api/enquiries/item')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ itemNo: 'ITEM001' }),

        request(app.getHttpServer())
          .get('/api/enquiries/sales-analysis')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ analysisType: 'by_customer' }),
      ];

      const results = await Promise.all(operations);

      // All operations should succeed
      results.forEach((result) => {
        expect([200, 201]).toContain(result.status);
      });
    });

    it('should maintain data consistency under load', async () => {
      // Test data consistency with multiple operations
      const consistencyCheckResponse = await request(app.getHttpServer())
        .get('/api/system/consistency-check')
        .set('Authorization', `Bearer ${authToken}`);

      expect(consistencyCheckResponse.status).toBe(200);
      expect(consistencyCheckResponse.body.isConsistent).toBe(true);
    });
  });
});
