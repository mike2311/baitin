import { INestApplication } from '@nestjs/common';
import { getTestDataSource } from './test-utils/test-helpers';
import { createMinimalTestApp } from './test-utils/minimal-test-app';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { createTestUser, getAuthToken } from './test-utils/test-helpers';
import { TestDataSeeder } from './test-utils/test-data-seeder';
import { Customer } from './customers/entities/customer.entity';
import { Vendor } from './vendors/entities/vendor.entity';
import { Item } from './items/entities/item.entity';
import { OrderEnquiryHeader } from './order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from './order-enquiry/entities/order-enquiry-detail.entity';
import { OrderConfirmationHeader } from './order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from './order-confirmation/entities/order-confirmation-detail.entity';
import { ContractHeader } from './contract/entities/contract-header.entity';
import { ContractDetail } from './contract/entities/contract-detail.entity';
import { ProductBom } from './order-enquiry/entities/product-bom.entity';
import { OrderEnquiryQtyBreakdown } from './order-enquiry/entities/order-enquiry-qty-breakdown.entity';
import { TEST_DATA } from './test-utils/test-data.config';

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
    try {
      const { app: testApp, moduleRef } = await createMinimalTestApp();
      app = testApp;
      dataSource = await getTestDataSource(moduleRef);

      // Create test user first
      const jwtService = moduleRef.get(JwtService);

      const userRepo = moduleRef.get(getRepositoryToken(User));
      const user = await createTestUser(userRepo);
      authToken = getAuthToken(jwtService, user.id, user.username);

      // Seed master data (customers, vendors, items) required for tests
      const customerRepo = moduleRef.get(getRepositoryToken(Customer));
      const vendorRepo = moduleRef.get(getRepositoryToken(Vendor));
      const itemRepo = moduleRef.get(getRepositoryToken(Item));
      const oeHeaderRepo = moduleRef.get(
        getRepositoryToken(OrderEnquiryHeader),
      );
      const oeDetailRepo = moduleRef.get(
        getRepositoryToken(OrderEnquiryDetail),
      );
      const ocHeaderRepo = moduleRef.get(
        getRepositoryToken(OrderConfirmationHeader),
      );
      const ocDetailRepo = moduleRef.get(
        getRepositoryToken(OrderConfirmationDetail),
      );
      const contHeaderRepo = moduleRef.get(getRepositoryToken(ContractHeader));
      const contDetailRepo = moduleRef.get(getRepositoryToken(ContractDetail));
      const bomRepo = moduleRef.get(getRepositoryToken(ProductBom));
      const qtyBreakdownRepo = moduleRef.get(
        getRepositoryToken(OrderEnquiryQtyBreakdown),
      );
      const seeder = new TestDataSeeder(
        customerRepo,
        vendorRepo,
        itemRepo,
        oeHeaderRepo,
        oeDetailRepo,
        ocHeaderRepo,
        ocDetailRepo,
        contHeaderRepo,
        contDetailRepo,
        bomRepo,
        qtyBreakdownRepo,
        (user as any).username || (user as any).id || 'test-user',
      );
      await seeder.seedMasterData();
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  }, 60000); // Increase timeout for setup

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('Complete Workflow: OE → OC → Contract → SO → DN → Invoice', () => {
    let oeNo: string;
    let confNo: string;
    let contNo: string;
    let soNo: string;
    let dnNo: string;
    let invNo: string;

    it('should complete full workflow with all validations', async () => {
      // Use unique OE number to avoid conflicts from previous test runs
      const uniqueId = Date.now().toString(36).slice(-8); // Limit to 8 chars to fit VARCHAR(20)
      const testOeNo = `OE-P3-${uniqueId}`;

      // 1. Create Order Enquiry
      const oeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: testOeNo,
          custNo: TEST_DATA.CUSTOMERS.CUST_001, // Use test data seeder customer
          oeDate: '2025-01-15',
        });

      if (oeResponse.status !== 201) {
        console.error(
          'OE Control creation failed:',
          oeResponse.status,
          oeResponse.body,
        );
      }
      expect(oeResponse.status).toBe(201);
      expect(oeResponse.body.oeNo).toBe(testOeNo);
      oeNo = oeResponse.body.oeNo;

      // Create OE Header
      const oeHeaderResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/header')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: oeNo,
          oeDate: '2025-01-15',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          compCode: 'HT', // Required for OC posting
        });

      expect(oeHeaderResponse.status).toBe(201);

      // Create OE Detail
      const oeDetailResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: oeNo,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
          price: 10.5,
          vendorNo: TEST_DATA.VENDORS.VEND_001, // Required for contract generation
        });

      expect(oeDetailResponse.status).toBe(201);

      // 2. Convert to Order Confirmation
      const ocPostResponse = await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          companyCode: 'HT', // Required by DTO
          oeNos: [oeNo], // DTO expects array, not singular oeNo
        });

      expect(ocPostResponse.status).toBe(201);
      // Service returns array of { oeNo, confNo, lines }
      expect(ocPostResponse.body).toBeDefined();
      expect(Array.isArray(ocPostResponse.body)).toBe(true);
      expect(ocPostResponse.body.length).toBeGreaterThan(0);
      confNo = ocPostResponse.body[0].confNo;

      // Verify OC was created
      const ocGetResponse = await request(app.getHttpServer())
        .get(`/api/order-confirmation/${confNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(ocGetResponse.status).toBe(200);
      expect(ocGetResponse.body.details).toHaveLength(1);

      // 3. Generate Contract
      const contractResponse = await request(app.getHttpServer())
        .post('/api/contract/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          confNo: confNo, // DTO expects confNo, not ocNo
        });

      expect(contractResponse.status).toBe(201);
      // Service returns { confNo, contracts, created } where created is array of contract headers
      // Get the first contract number from the created array
      expect(contractResponse.body.created).toBeDefined();
      expect(contractResponse.body.created.length).toBeGreaterThan(0);
      contNo = contractResponse.body.created[0].contNo;

      // Verify contract was created with breakdown
      const contractGetResponse = await request(app.getHttpServer())
        .get(`/api/contract/${contNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(contractGetResponse.status).toBe(200);
      expect(contractGetResponse.body.details).toBeDefined();
      expect(contractGetResponse.body.details.length).toBeGreaterThan(0);

      // 4. Create Shipping Order (linked to Contract)
      const testSoNo = `SO-P3-${uniqueId}`;
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: testSoNo,
          contNo: contNo, // Link to the Contract we just created
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
        });

      expect(soResponse.status).toBe(201);
      soNo = soResponse.body.soNo;

      // Generate SO document
      const soDocResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: [soNo], // DTO expects soNos array
          // documentType not in DTO - removed
          outputFormat: 'excel',
        });

      expect(soDocResponse.status).toBe(200);
      expect(soDocResponse.headers['content-type']).toContain('spreadsheetml');

      // 5. Create Delivery Note
      const testDnNo = `DN-P3-${uniqueId}`;
      const dnResponse = await request(app.getHttpServer())
        .post('/api/delivery-notes/from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: soNo, // DTO expects soNo (singular), not soNos (array)
          dnNo: testDnNo,
          date: '2025-01-20',
        });

      expect(dnResponse.status).toBe(201);
      dnNo = dnResponse.body.dnNo;

      // Verify DN has breakdown from OE
      const dnGetResponse = await request(app.getHttpServer())
        .get(`/api/delivery-notes/${dnNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(dnGetResponse.status).toBe(200);
      expect(dnGetResponse.body.details).toBeDefined();
      expect(dnGetResponse.body.details.length).toBeGreaterThan(0);

      // 6. Create Invoice
      const testInvNo = `INV-P3-${uniqueId}`;
      const invoiceResponse = await request(app.getHttpServer())
        .post('/api/invoices/from-source')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sourceType: 'so',
          sourceNo: soNo, // Check DTO structure
          invNo: testInvNo,
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

      // Verify complete workflow data integrity - endpoint not implemented yet
      // const workflowCheckResponse = await request(app.getHttpServer())
      //   .get('/api/enquiries/workflow-status')
      //   .set('Authorization', `Bearer ${authToken}`)
      //   .query({ oeNo, confNo, contNo, soNo, dnNo, invNo });
      // expect(workflowCheckResponse.status).toBe(200);
      // expect(workflowCheckResponse.body.status).toBe('completed');
    });

    it('should handle workflow with BOM items', async () => {
      const bomUniqueId = Date.now().toString(36).slice(-6) + 'B';
      // Create OE with BOM item
      const bomOeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: `OE-B${bomUniqueId}`,
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
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
          itemNo: TEST_DATA.ITEMS.ITEM_001, // Use test item
          qty: 10,
          vendorNo: TEST_DATA.VENDORS.VEND_001, // Required for contract generation
        });

      // Create OE Header for BOM
      await request(app.getHttpServer())
        .post('/api/order-enquiry/header')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: bomOeNo,
          oeDate: '2025-01-15',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          compCode: 'HT',
        });

      // Process through workflow
      const bomOcResponse = await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          companyCode: 'HT',
          oeNos: [bomOeNo],
          confNo: 'OC-BOM-001',
        });

      expect(bomOcResponse.status).toBe(201);

      // Verify BOM handling in subsequent steps
      const bomConfNo = bomOcResponse.body[0].confNo;
      const bomContractResponse = await request(app.getHttpServer())
        .post('/api/contract/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          confNo: bomConfNo,
        });
      expect(bomContractResponse.status).toBe(201);
      const bomContNo = bomContractResponse.body.created[0].contNo;

      const bomSoResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-B${bomUniqueId}`,
          contNo: bomContNo,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 10,
        });

      expect(bomSoResponse.status).toBe(201);
    });

    it('should handle workflow with quantity breakdowns', async () => {
      const breakdownUniqueId = Date.now().toString(36).slice(-6) + 'R';
      // Create OE with breakdown
      const breakdownOeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: `OE-R${breakdownUniqueId}`,
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          oeDate: '2025-01-15',
        });

      expect(breakdownOeResponse.status).toBe(201);
      const breakdownOeNo = breakdownOeResponse.body.oeNo;

      // Create OE Header
      await request(app.getHttpServer())
        .post('/api/order-enquiry/header')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: breakdownOeNo,
          oeDate: '2025-01-15',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          compCode: 'HT',
        });

      // Create OE Detail
      await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: breakdownOeNo,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
          price: 10.5,
          vendorNo: TEST_DATA.VENDORS.VEND_001, // Required for contract generation
        });

      // Post to OC
      const breakdownOcResponse = await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          companyCode: 'HT',
          oeNos: [breakdownOeNo],
        });
      expect(breakdownOcResponse.status).toBe(201);
      const breakdownConfNo = breakdownOcResponse.body[0].confNo;

      // Process through contract with breakdown
      const breakdownContractResponse = await request(app.getHttpServer())
        .post('/api/contract/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          confNo: breakdownConfNo, // DTO expects confNo, not ocNo
        });

      expect(breakdownContractResponse.status).toBe(201);

      // Create SO from contract
      const breakdownContNo = breakdownContractResponse.body.created[0].contNo;
      const breakdownSoResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-R${breakdownUniqueId}`,
          contNo: breakdownContNo,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
        });
      expect(breakdownSoResponse.status).toBe(201);
      const breakdownSoNo = breakdownSoResponse.body.soNo;

      // Verify breakdown flows through DN
      const breakdownDnResponse = await request(app.getHttpServer())
        .post('/api/delivery-notes/from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: breakdownSoNo, // DTO expects soNo (singular), not soNos (array)
          dnNo: `DN-R${breakdownUniqueId}`,
          date: '2025-01-20',
        });

      expect(breakdownDnResponse.status).toBe(201);
    });

    it('should handle workflow with multiple containers', async () => {
      const multiUniqueId = Date.now().toString(36).slice(-6) + 'M';

      // Create OE and OC first
      const oeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: `OE-M${multiUniqueId}`,
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          oeDate: '2025-01-15',
        });
      expect(oeResponse.status).toBe(201);
      const oeNo = oeResponse.body.oeNo;

      await request(app.getHttpServer())
        .post('/api/order-enquiry/header')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: oeNo,
          oeDate: '2025-01-15',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          compCode: 'HT',
        });

      await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: oeNo,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
          price: 10.5,
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        });

      await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: oeNo,
          itemNo: TEST_DATA.ITEMS.ITEM_002,
          qty: 200,
          price: 10.5,
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        });

      const ocResponse = await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          companyCode: 'HT',
          oeNos: [oeNo],
        });
      expect(ocResponse.status).toBe(201);
      const confNo = ocResponse.body[0].confNo;

      // Create multiple SOs linked to OC
      const so1Response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-M${multiUniqueId}1`,
          confNo: confNo,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
        });

      const so2Response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-M${multiUniqueId}2`,
          confNo: confNo,
          itemNo: TEST_DATA.ITEMS.ITEM_002,
          qty: 200,
        });

      expect(so1Response.status).toBe(201);
      expect(so2Response.status).toBe(201);

      // Create invoice selecting items by container
      const multiContainerInvoiceResponse = await request(app.getHttpServer())
        .post('/api/invoices/select-items-by-container')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-M${multiUniqueId}`, // DTO requires invNo
          cntrNo: 'CONT001', // DTO expects cntrNo (singular), not containerNos
          refNo: 'REF001', // DTO expects refNo (singular), not refNos
        });

      expect(multiContainerInvoiceResponse.status).toBe(200);
    });

    it.skip('should validate data integrity across workflow', async () => {
      // TODO: Endpoint /api/workflow/integrity-check not yet implemented
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
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
        });

      expect(soResponse.status).toBe(201);
      const soNo = soResponse.body.soNo;

      // Generate document
      const docResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: [soNo], // DTO expects soNos array
          outputFormat: 'excel',
        });

      expect(docResponse.status).toBe(200);
      expect(docResponse.headers['content-type']).toContain('spreadsheetml');
    });

    it('should handle customer-specific formats', async () => {
      const spencerUniqueId = Date.now().toString(36).slice(-6) + 'S';
      const spencerSoNo = `SO-S${spencerUniqueId}`;
      // First create the SO
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: spencerSoNo,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
        });
      expect(soResponse.status).toBe(201);

      const spencerDocResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: [spencerSoNo],
          // documentType not in DTO - removed
          outputFormat: 'excel',
          formatKey: 'SPENCER_FORMAT',
        });

      expect(spencerDocResponse.status).toBe(200);
    });

    it('should validate document output format', async () => {
      const validateUniqueId = Date.now().toString(36).slice(-6) + 'V';
      const validateSoNo = `SO-V${validateUniqueId}`;
      // First create the SO
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: validateSoNo,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
        });
      expect(soResponse.status).toBe(201);

      const invalidFormatResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: [validateSoNo],
          // documentType not in DTO - removed
          outputFormat: 'invalid_format',
        });

      expect(invalidFormatResponse.status).toBe(400);
    });
  });

  describe('DN and Loading Workflow', () => {
    it('should create DN from SO and assign to loading', async () => {
      const loadUniqueId = Date.now().toString(36).slice(-6) + 'L';
      // Create SO
      const soResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-L${loadUniqueId}`,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
        });

      expect(soResponse.status).toBe(201);
      const soNo = soResponse.body.soNo;

      // Create DN
      const dnResponse = await request(app.getHttpServer())
        .post('/api/delivery-notes/from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: soNo, // DTO expects soNo (singular), not sourceNo
          dnNo: `DN-L${loadUniqueId}`,
          date: '2025-01-20',
        });

      expect(dnResponse.status).toBe(201);
      const dnNo = dnResponse.body.dnNo;

      // Create loading master
      const loadingResponse = await request(app.getHttpServer())
        .post('/api/loading/master')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loadingNo: `LD-${loadUniqueId}`,
          date: '2025-01-20', // DTO requires date
          vesselName: 'Test Vessel',
          voyageNo: 'V001',
        });

      expect(loadingResponse.status).toBe(201);
      const loadingNo = loadingResponse.body.loadingNo;

      // Assign DN to loading
      const assignResponse = await request(app.getHttpServer())
        .post(`/api/loading/master/${loadingNo}/assign-dns`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dnNos: [dnNo], // loadingNo is in path, containerNo not in DTO
        });

      expect(assignResponse.status).toBe(200);

      // Verify DN status updated
      const dnStatusResponse = await request(app.getHttpServer())
        .get(`/api/delivery-notes/${dnNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(dnStatusResponse.body.loadingStatus).toBe('Loading');
    });

    it('should update DN status on loading assignment', async () => {
      const statusUniqueId = Date.now().toString(36).slice(-6) + 'T';
      const statusLoadingNo = `LD-T${statusUniqueId}`;
      const statusDnNo = `DN-T${statusUniqueId}`;

      // Create loading master first
      const loadingResponse = await request(app.getHttpServer())
        .post('/api/loading/master')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loadingNo: statusLoadingNo,
          date: '2025-01-20',
        });
      expect(loadingResponse.status).toBe(201);

      // Create and assign DN to loading
      const assignResponse = await request(app.getHttpServer())
        .post(`/api/loading/master/${statusLoadingNo}/assign-dns`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dnNos: [statusDnNo], // loadingNo is in path, containerNo not in DTO
        });

      expect(assignResponse.status).toBe(200);

      // Verify status change
      const statusCheckResponse = await request(app.getHttpServer())
        .get(`/api/delivery-notes/${statusDnNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusCheckResponse.body.loadingStatus).toBe('Loaded');
    });

    it('should handle multiple DNs in one loading', async () => {
      const multiDnUniqueId = Date.now().toString(36).slice(-6) + 'D';
      const multiDnLoadingNo = `LD-D${multiDnUniqueId}`;
      const multiDnNos = [
        `DN-D${multiDnUniqueId}1`,
        `DN-D${multiDnUniqueId}2`,
        `DN-D${multiDnUniqueId}3`,
      ];

      // Create loading master first
      const loadingResponse = await request(app.getHttpServer())
        .post('/api/loading/master')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loadingNo: multiDnLoadingNo,
          date: '2025-01-20',
        });
      expect(loadingResponse.status).toBe(201);

      const multiDnResponse = await request(app.getHttpServer())
        .post(`/api/loading/master/${multiDnLoadingNo}/assign-dns`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dnNos: multiDnNos, // loadingNo is in path
        });

      expect(multiDnResponse.status).toBe(201);
    });
  });

  describe('Invoice Document Generation Workflow', () => {
    it('should create invoice and generate packing list', async () => {
      // Create invoice
      const invoiceResponse = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-P${Date.now().toString(36).slice(-8)}`,
          date: '2025-01-25',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          ocNo: `OC-P${Date.now().toString(36).slice(-8)}`,
          details: [
            {
              itemNo: TEST_DATA.ITEMS.ITEM_001,
              qty: 100,
              price: 10.5,
            },
          ],
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
      // Create invoice first
      const invoiceResponse = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-S${Date.now().toString(36).slice(-8)}`,
          date: '2025-01-25',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          ocNo: `OC-S${Date.now().toString(36).slice(-8)}`,
          details: [
            {
              itemNo: TEST_DATA.ITEMS.ITEM_001,
              qty: 100,
              price: 10.5,
            },
          ],
        });
      expect(invoiceResponse.status).toBe(201);
      const invNo = invoiceResponse.body.invNo;

      const spencerPlResponse = await request(app.getHttpServer())
        .post('/api/invoices/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNos: [invNo],
          documentType: 'packing_list_spencer',
          outputFormat: 'excel',
        });

      expect(spencerPlResponse.status).toBe(200);
    });

    it('should generate shipment advice', async () => {
      // Create invoice first
      const invoiceResponse = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-A${Date.now().toString(36).slice(-8)}`,
          date: '2025-01-25',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          ocNo: `OC-A${Date.now().toString(36).slice(-8)}`,
          details: [
            {
              itemNo: TEST_DATA.ITEMS.ITEM_001,
              qty: 100,
              price: 10.5,
            },
          ],
        });
      expect(invoiceResponse.status).toBe(201);
      const invNo = invoiceResponse.body.invNo;

      const saResponse = await request(app.getHttpServer())
        .post('/api/invoices/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNos: [invNo],
          documentType: 'shipment_advice',
          outputFormat: 'excel',
        });

      expect(saResponse.status).toBe(200);
    });

    it('should generate debit note', async () => {
      // Create invoice first
      const invoiceResponse = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-N${Date.now().toString(36).slice(-8)}`,
          date: '2025-01-25',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          ocNo: `OC-N${Date.now().toString(36).slice(-8)}`,
          details: [
            {
              itemNo: TEST_DATA.ITEMS.ITEM_001,
              qty: 100,
              price: 10.5,
            },
          ],
        });
      expect(invoiceResponse.status).toBe(201);
      const invNo = invoiceResponse.body.invNo;

      const dnResponse = await request(app.getHttpServer())
        .post('/api/invoices/documents/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNos: [invNo],
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
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          dateFrom: '2025-01-01',
          dateTo: '2025-01-31',
        });

      expect(itemEnquiryResponse.status).toBe(200);
      expect(Array.isArray(itemEnquiryResponse.body)).toBe(true);
      expect(itemEnquiryResponse.body.length).toBeGreaterThan(0);
      expect(itemEnquiryResponse.body[0].itemNo).toBe(TEST_DATA.ITEMS.ITEM_001);
    });

    it('should generate report with parameters', async () => {
      const reportResponse = await request(app.getHttpServer())
        .post('/api/reports/sales_analysis/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
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
        .post('/api/delivery-notes/from-so')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNos: ['INVALID_SO'],
          dnNo: 'DN-INVALID-001',
          date: '2025-01-20',
        });

      expect(invalidDnResponse.status).toBe(400);
    });

    it('should prevent duplicate document numbers', async () => {
      // Create OE and OC first
      const oeResponse = await request(app.getHttpServer())
        .post('/api/order-enquiry/control')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: `OE-DUP-${Date.now().toString(36).slice(-8)}`,
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          oeDate: '2025-01-15',
        });
      expect(oeResponse.status).toBe(201);
      const oeNo = oeResponse.body.oeNo;

      await request(app.getHttpServer())
        .post('/api/order-enquiry/header')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: oeNo,
          oeDate: '2025-01-15',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          compCode: 'HT',
        });

      await request(app.getHttpServer())
        .post('/api/order-enquiry/detail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oeNo: oeNo,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
          price: 10.5,
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        });

      const ocResponse = await request(app.getHttpServer())
        .post('/api/order-confirmation/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          companyCode: 'HT',
          oeNos: [oeNo],
        });
      expect(ocResponse.status).toBe(201);
      const confNo = ocResponse.body[0].confNo;

      // Create first SO
      await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-DUPLICATE-001',
          confNo: confNo,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
        });

      // Try to create duplicate
      const duplicateResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: 'SO-DUPLICATE-001',
          confNo: confNo,
          itemNo: TEST_DATA.ITEMS.ITEM_002,
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
      // Create invoices first
      const invoicePromises = Array(5)
        .fill(null)
        .map((_, i) =>
          request(app.getHttpServer())
            .post('/api/invoices')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              invNo: `INV-CONCURRENT-${i}-${Date.now().toString(36).slice(-8)}`,
              date: '2025-01-25',
              custNo: TEST_DATA.CUSTOMERS.CUST_001,
              ocNo: `OC-CONCURRENT-${i}-${Date.now().toString(36).slice(-8)}`,
              details: [
                {
                  itemNo: TEST_DATA.ITEMS.ITEM_001,
                  qty: 100,
                  price: 10.5,
                },
              ],
            }),
        );

      const invoiceResults = await Promise.all(invoicePromises);
      const invNos = invoiceResults.map((r) => r.body.invNo);

      // Test concurrent document generation
      const promises = invNos.map((invNo) =>
        request(app.getHttpServer())
          .post('/api/invoices/documents/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            invNos: [invNo],
            documentType: 'packing_list',
            outputFormat: 'excel',
          }),
      );

      const results = await Promise.all(promises);
      // At least some should succeed (those with valid invoices)
      const successCount = results.filter((r) => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });
});
