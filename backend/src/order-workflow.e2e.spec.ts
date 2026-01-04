import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Customer } from './customers/entities/customer.entity';
import { Item } from './items/entities/item.entity';
import { Vendor } from './vendors/entities/vendor.entity';

import { OrderEnquiryHeader } from './order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from './order-enquiry/entities/order-enquiry-detail.entity';
import { ProductBom } from './order-enquiry/entities/product-bom.entity';

import { OrderConfirmationHeader } from './order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from './order-confirmation/entities/order-confirmation-detail.entity';
import { PostOeToOcService } from './order-confirmation/services/post-oe-to-oc.service';

import { ContractHeader } from './contract/entities/contract-header.entity';
import { ContractDetail } from './contract/entities/contract-detail.entity';
import { ContractGenerationService } from './contract/services/contract-generation.service';

import { BomService } from './shared/services/bom.service';

/**
 * Phase 2 MVP Integration Test: OE → OC → Contract
 *
 * Original Logic Reference:
 * - docs/modernization-strategy/11-phased-delivery-plan/phased-delivery-plan.md (Phase 2 core workflow)
 * - docs/source/02-business-processes/workflow-overview.md
 * - docs/source/02-business-processes/order-confirmation-process.md
 * - docs/source/02-business-processes/contract-process.md
 */
describe('Phase 2 Workflow (OE → OC → Contract)', () => {
  let customerRepo: Repository<Customer>;
  let itemRepo: Repository<Item>;
  let vendorRepo: Repository<Vendor>;
  let oeHeaderRepo: Repository<OrderEnquiryHeader>;
  let oeDetailRepo: Repository<OrderEnquiryDetail>;
  let bomRepo: Repository<ProductBom>;
  let ocHeaderRepo: Repository<OrderConfirmationHeader>;
  let ocDetailRepo: Repository<OrderConfirmationDetail>;
  let contHeaderRepo: Repository<ContractHeader>;
  let contDetailRepo: Repository<ContractDetail>;

  let postOeToOc: PostOeToOcService;
  let genContract: ContractGenerationService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            Customer,
            Vendor,
            Item,
            OrderEnquiryHeader,
            OrderEnquiryDetail,
            ProductBom,
            OrderConfirmationHeader,
            OrderConfirmationDetail,
            ContractHeader,
            ContractDetail,
          ],
        }),
        TypeOrmModule.forFeature([
          Customer,
          Vendor,
          Item,
          OrderEnquiryHeader,
          OrderEnquiryDetail,
          ProductBom,
          OrderConfirmationHeader,
          OrderConfirmationDetail,
          ContractHeader,
          ContractDetail,
        ]),
      ],
      providers: [BomService, PostOeToOcService, ContractGenerationService],
    }).compile();

    customerRepo = moduleRef.get(getRepositoryToken(Customer));
    vendorRepo = moduleRef.get(getRepositoryToken(Vendor));
    itemRepo = moduleRef.get(getRepositoryToken(Item));
    oeHeaderRepo = moduleRef.get(getRepositoryToken(OrderEnquiryHeader));
    oeDetailRepo = moduleRef.get(getRepositoryToken(OrderEnquiryDetail));
    bomRepo = moduleRef.get(getRepositoryToken(ProductBom));
    ocHeaderRepo = moduleRef.get(getRepositoryToken(OrderConfirmationHeader));
    ocDetailRepo = moduleRef.get(getRepositoryToken(OrderConfirmationDetail));
    contHeaderRepo = moduleRef.get(getRepositoryToken(ContractHeader));
    contDetailRepo = moduleRef.get(getRepositoryToken(ContractDetail));

    postOeToOc = moduleRef.get(PostOeToOcService);
    genContract = moduleRef.get(ContractGenerationService);
  });

  it('posts OE to OC and generates contracts grouped by vendor with BOM expansion', async () => {
    await customerRepo.save(
      customerRepo.create({
        custNo: 'CUST1',
        ename: 'Customer 1',
      } as any),
    );

    await vendorRepo.save(
      vendorRepo.create({
        vendorNo: 'VEND_A',
        ename: 'Vendor A',
      } as any),
    );
    await vendorRepo.save(
      vendorRepo.create({
        vendorNo: 'VEND_B',
        ename: 'Vendor B',
      } as any),
    );

    await itemRepo.save(
      itemRepo.create({ itemNo: 'ITEM_HEAD', desp: 'Head Item' } as any),
    );
    await itemRepo.save(
      itemRepo.create({ itemNo: 'ITEM_SUB', desp: 'Sub Item' } as any),
    );
    await itemRepo.save(
      itemRepo.create({ itemNo: 'ITEM_2', desp: 'Another Item' } as any),
    );

    // BOM: ITEM_HEAD -> ITEM_SUB (qty ratio 2)
    await bomRepo.save(
      bomRepo.create({
        itemNo: 'ITEM_HEAD',
        subItemNo: 'ITEM_SUB',
        qty: 2,
      } as any),
    );

    // OE with two vendors (should produce 2 contracts after OC)
    await oeHeaderRepo.save(
      oeHeaderRepo.create({
        oeNo: 'OE001',
        custNo: 'CUST1',
        oeDate: new Date('2026-01-03'),
        status: 0,
        compCode: 'HT',
      } as any),
    );

    await oeDetailRepo.save(
      oeDetailRepo.create({
        oeNo: 'OE001',
        lineNo: 1,
        itemNo: 'ITEM_HEAD',
        qty: 10,
        head: true,
        vendorNo: 'VEND_A',
      } as any),
    );
    await oeDetailRepo.save(
      oeDetailRepo.create({
        oeNo: 'OE001',
        lineNo: 2,
        itemNo: 'ITEM_2',
        qty: 5,
        head: false,
        vendorNo: 'VEND_B',
      } as any),
    );

    const postRes = await postOeToOc.post(
      { companyCode: 'HT', oeNos: ['OE001'] },
      'tester',
    );
    expect(postRes.posted).toBe(1);
    expect(postRes.results[0].confNo).toBe('HT-OC/OE001');

    const ocHeader = await ocHeaderRepo.findOne({
      where: { confNo: 'HT-OC/OE001' },
    });
    expect(ocHeader).toBeTruthy();

    const ocDetails = await ocDetailRepo.find({
      where: { confNo: 'HT-OC/OE001' },
      order: { lineNo: 'ASC' },
    });
    // Expect head + sub for VEND_A, plus ITEM_2 for VEND_B
    expect(
      ocDetails.some((d) => d.itemNo === 'ITEM_HEAD' && d.head === true),
    ).toBe(true);
    expect(
      ocDetails.some((d) => d.itemNo === 'ITEM_SUB' && d.head === false),
    ).toBe(true);
    expect(ocDetails.some((d) => d.itemNo === 'ITEM_2')).toBe(true);

    const genRes = await genContract.generateFromOc('HT-OC/OE001', 'tester');
    expect(genRes.contracts).toBe(2);

    const contHeaders = await contHeaderRepo.find({
      where: { confNo: 'HT-OC/OE001' },
    });
    expect(contHeaders.length).toBe(2);

    const contA = contHeaders.find((h) => h.vendorNo === 'VEND_A');
    const contB = contHeaders.find((h) => h.vendorNo === 'VEND_B');
    expect(contA).toBeTruthy();
    expect(contB).toBeTruthy();

    const contADetails = await contDetailRepo.find({
      where: { contNo: contA!.contNo },
      order: { lineNo: 'ASC' },
    });
    expect(
      contADetails.some((d) => d.itemNo === 'ITEM_HEAD' && d.head === true),
    ).toBe(true);
    expect(
      contADetails.some((d) => d.itemNo === 'ITEM_SUB' && d.head === false),
    ).toBe(true);

    const contBDetails = await contDetailRepo.find({
      where: { contNo: contB!.contNo },
    });
    expect(contBDetails.some((d) => d.itemNo === 'ITEM_2')).toBe(true);
  });
});
