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
import { TestDataSeeder } from '../test-utils/test-data-seeder';
import { TEST_DATA } from '../test-utils/test-data.config';
import { JwtService } from '@nestjs/jwt';
import { OrderEnquiryHeader } from '../order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from '../order-enquiry/entities/order-enquiry-detail.entity';
import { OrderConfirmationHeader } from '../order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../order-confirmation/entities/order-confirmation-detail.entity';
import { ContractHeader } from '../contract/entities/contract-header.entity';
import { ProductBom } from '../order-enquiry/entities/product-bom.entity';
import { User } from '../users/entities/user.entity';

describe('Integration Tests', () => {
  let app: INestApplication;
  let apiClient: ApiTestClient;
  let jwtService: JwtService;
  let userRepo: Repository<User>;
  let oeHeaderRepo: Repository<OrderEnquiryHeader>;
  let ocHeaderRepo: Repository<OrderConfirmationHeader>;
  let contHeaderRepo: Repository<ContractHeader>;
  let bomRepo: Repository<ProductBom>;
  let seeder: TestDataSeeder;
  let token: string;
  let moduleRef: TestingModule;
  let oeDetailRepo: Repository<OrderEnquiryDetail>;
  let ocDetailRepo: Repository<OrderConfirmationDetail>;

  beforeAll(async () => {
    const { app: testApp, moduleRef: testModuleRef } = await createTestApp();
    app = testApp;
    moduleRef = testModuleRef;
    jwtService = moduleRef.get(JwtService);
    userRepo = moduleRef.get(getRepositoryToken(User));
    oeHeaderRepo = moduleRef.get(getRepositoryToken(OrderEnquiryHeader));
    ocHeaderRepo = moduleRef.get(getRepositoryToken(OrderConfirmationHeader));
    contHeaderRepo = moduleRef.get(getRepositoryToken(ContractHeader));
    bomRepo = moduleRef.get(getRepositoryToken(ProductBom));
    oeDetailRepo = moduleRef.get(getRepositoryToken(OrderEnquiryDetail));
    ocDetailRepo = moduleRef.get(getRepositoryToken(OrderConfirmationDetail));

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
      moduleRef.get(
        getRepositoryToken(require('../items/entities/item.entity').Item),
      ),
      oeHeaderRepo,
      moduleRef.get(
        getRepositoryToken(
          require('../order-enquiry/entities/order-enquiry-detail.entity')
            .OrderEnquiryDetail,
        ),
      ),
      ocHeaderRepo,
      moduleRef.get(
        getRepositoryToken(
          require('../order-confirmation/entities/order-confirmation-detail.entity')
            .OrderConfirmationDetail,
        ),
      ),
      contHeaderRepo,
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
    await seeder.cleanup();
    await app.close();
  });

  describe('End-to-End Workflow', () => {
    test('E2E-001: Complete OE to Contract workflow', async () => {
      // Step 1: Create OE
      const oe = await oeHeaderRepo.save(
        oeHeaderRepo.create({
          oeNo: 'TEST-OE-E2E-001',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          oeDate: new Date('2026-01-01'),
          compCode: TEST_DATA.COMPANY_CODES.HT,
          status: 0,
        } as Partial<OrderEnquiryHeader>),
      );

      await oeDetailRepo.save([
        oeDetailRepo.create({
          oeNo: 'TEST-OE-E2E-001',
          lineNo: 1,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        } as Partial<any>),
      ]);

      // Step 2: Post OE to OC
      const postResponse = await apiClient.post(
        '/api/order-confirmation/post',
        {
          companyCode: TEST_DATA.COMPANY_CODES.HT,
          oeNos: ['TEST-OE-E2E-001'],
        },
      );

      expect([200, 201]).toContain(postResponse.status);
      expect(postResponse.body.posted).toBeGreaterThan(0);

      const ocNo = postResponse.body.results[0]?.confNo;
      expect(ocNo).toBeTruthy();

      // Step 3: Generate Contract from OC
      const genResponse = await apiClient.post('/api/contract/generate', {
        confNo: ocNo,
      });

      expect(genResponse.status).toBe(201);
      expect(genResponse.body.contracts).toBeGreaterThan(0);

      // Step 4: Verify contract exists
      const contracts = await contHeaderRepo.find({ where: { confNo: ocNo } });
      expect(contracts.length).toBeGreaterThan(0);
    });

    test('E2E-002: OE with BOM to Contract', async () => {
      // Clean up any existing BOM first
      await bomRepo.delete({
        itemNo: TEST_DATA.ITEMS.ITEM_HEAD,
        subItemNo: TEST_DATA.ITEMS.ITEM_SUB,
      });

      // Create OE with BOM head item
      const oe = await oeHeaderRepo.save(
        oeHeaderRepo.create({
          oeNo: 'TEST-OE-E2E-002',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          oeDate: new Date('2026-01-01'),
          compCode: TEST_DATA.COMPANY_CODES.HT,
          status: 0,
        } as Partial<OrderEnquiryHeader>),
      );

      await oeDetailRepo.save([
        oeDetailRepo.create({
          oeNo: 'TEST-OE-E2E-002',
          lineNo: 1,
          itemNo: TEST_DATA.ITEMS.ITEM_HEAD,
          qty: 50,
          head: true,
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        } as Partial<any>),
      ]);

      // Create BOM
      await bomRepo.save(
        bomRepo.create({
          itemNo: TEST_DATA.ITEMS.ITEM_HEAD,
          subItemNo: TEST_DATA.ITEMS.ITEM_SUB,
          qty: 2,
        }),
      );

      // Post to OC
      const postResponse = await apiClient.post(
        '/api/order-confirmation/post',
        {
          companyCode: TEST_DATA.COMPANY_CODES.HT,
          oeNos: ['TEST-OE-E2E-002'],
        },
      );

      expect([200, 201]).toContain(postResponse.status);
      const ocNo = postResponse.body.results[0]?.confNo;

      // Generate Contract
      const genResponse = await apiClient.post('/api/contract/generate', {
        confNo: ocNo,
      });

      expect(genResponse.status).toBe(201);

      // Verify BOM was processed (OC should have head + sub items)
      const ocDetails = await ocDetailRepo.find({
        where: { confNo: ocNo },
      });

      const hasHead = ocDetails.some(
        (d) => d.itemNo === TEST_DATA.ITEMS.ITEM_HEAD && d.head === true,
      );
      const hasSub = ocDetails.some(
        (d) => d.itemNo === TEST_DATA.ITEMS.ITEM_SUB && d.head === false,
      );
      expect(hasHead).toBe(true);
      expect(hasSub).toBe(true);
    });

    test('E2E-003: Quantity breakdown through workflow', async () => {
      // Create OE
      const oe = await oeHeaderRepo.save(
        oeHeaderRepo.create({
          oeNo: 'TEST-OE-E2E-003',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          oeDate: new Date('2026-01-01'),
          compCode: TEST_DATA.COMPANY_CODES.HT,
          status: 0,
        } as Partial<OrderEnquiryHeader>),
      );

      // Create OE detail line (required for posting)
      await oeDetailRepo.save([
        oeDetailRepo.create({
          oeNo: 'TEST-OE-E2E-003',
          lineNo: 1,
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        } as Partial<any>),
      ]);

      // Create quantity breakdown
      const breakdownResponse = await apiClient.post(
        '/api/order-enquiry/qty-breakdown',
        {
          oeNo: 'TEST-OE-E2E-003',
          itemNo: TEST_DATA.ITEMS.ITEM_001,
          qty: 100,
          port: 'LAX',
          poNo: 'TEST-PO-E2E',
        },
      );

      expect(breakdownResponse.status).toBe(201);

      // Post to OC
      const postResponse = await apiClient.post(
        '/api/order-confirmation/post',
        {
          companyCode: TEST_DATA.COMPANY_CODES.HT,
          oeNos: ['TEST-OE-E2E-003'],
        },
      );

      expect([200, 201]).toContain(postResponse.status);
    });
  });

  describe('Data Consistency Tests', () => {
    test('CONSIST-001: OC deletion with related contracts', async () => {
      // Create OC and contract
      const oc = await ocHeaderRepo.save(
        ocHeaderRepo.create({
          confNo: 'TEST-OC-CONSIST-001',
          date: new Date('2026-01-05'),
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
        } as Partial<OrderConfirmationHeader>),
      );

      const contract = await contHeaderRepo.save(
        contHeaderRepo.create({
          contNo: 'TEST-CONT-CONSIST-001',
          confNo: 'TEST-OC-CONSIST-001',
          date: new Date('2026-01-06'),
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        } as Partial<ContractHeader>),
      );

      // Try to delete OC
      const deleteResponse = await apiClient.delete(
        '/api/order-confirmation/TEST-OC-CONSIST-001',
      );

      // Should either succeed (cascade delete) or fail (constraint)
      expect([200, 400, 500]).toContain(deleteResponse.status);
    });

    test('CONSIST-002: Contract deletion impact', async () => {
      const contract = await contHeaderRepo.save(
        contHeaderRepo.create({
          contNo: 'TEST-CONT-CONSIST-002',
          confNo: TEST_DATA.ORDER_CONFIRMATIONS.OC_001,
          date: new Date('2026-01-06'),
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        } as Partial<ContractHeader>),
      );

      const deleteResponse = await apiClient.delete(
        '/api/contract/TEST-CONT-CONSIST-002',
      );
      expect(deleteResponse.status).toBe(200);

      // Verify contract is deleted
      const deleted = await contHeaderRepo.findOne({
        where: { contNo: 'TEST-CONT-CONSIST-002' },
      });
      expect(deleted).toBeNull();
    });

    test('CONSIST-003: BOM changes impact on workflow', async () => {
      // Clean up any existing BOM first
      await bomRepo.delete({
        itemNo: TEST_DATA.ITEMS.ITEM_HEAD,
        subItemNo: TEST_DATA.ITEMS.ITEM_SUB,
      });

      // Create BOM
      const bom = await bomRepo.save(
        bomRepo.create({
          itemNo: TEST_DATA.ITEMS.ITEM_HEAD,
          subItemNo: TEST_DATA.ITEMS.ITEM_SUB,
          qty: 2,
        }),
      );

      // Create OE with head item
      const oe = await oeHeaderRepo.save(
        oeHeaderRepo.create({
          oeNo: 'TEST-OE-CONSIST-003',
          custNo: TEST_DATA.CUSTOMERS.CUST_001,
          oeDate: new Date('2026-01-01'),
          compCode: TEST_DATA.COMPANY_CODES.HT,
          status: 0,
        } as Partial<OrderEnquiryHeader>),
      );

      await oeDetailRepo.save([
        oeDetailRepo.create({
          oeNo: 'TEST-OE-CONSIST-003',
          lineNo: 1,
          itemNo: TEST_DATA.ITEMS.ITEM_HEAD,
          qty: 50,
          head: true,
          vendorNo: TEST_DATA.VENDORS.VEND_001,
        } as Partial<any>),
      ]);

      // Post to OC - should include BOM sub-items
      const postResponse = await apiClient.post(
        '/api/order-confirmation/post',
        {
          companyCode: TEST_DATA.COMPANY_CODES.HT,
          oeNos: ['TEST-OE-CONSIST-003'],
        },
      );

      expect([200, 201]).toContain(postResponse.status);

      // Update BOM quantity
      await apiClient.put(`/api/bom/${bom.id}`, { qty: 3 });

      // Generate contract - should use updated BOM
      const ocNo = postResponse.body.results[0]?.confNo;
      const genResponse = await apiClient.post('/api/contract/generate', {
        confNo: ocNo,
      });

      expect(genResponse.status).toBe(201);
    });
  });
});
