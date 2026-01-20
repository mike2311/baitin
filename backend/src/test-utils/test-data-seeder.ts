import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Item } from '../items/entities/item.entity';
import { OrderEnquiryHeader } from '../order-enquiry/entities/order-enquiry-header.entity';
import { OrderEnquiryDetail } from '../order-enquiry/entities/order-enquiry-detail.entity';
import { OrderConfirmationHeader } from '../order-confirmation/entities/order-confirmation-header.entity';
import { OrderConfirmationDetail } from '../order-confirmation/entities/order-confirmation-detail.entity';
import { ContractHeader } from '../contract/entities/contract-header.entity';
import { ContractDetail } from '../contract/entities/contract-detail.entity';
import { ProductBom } from '../order-enquiry/entities/product-bom.entity';
import { OrderEnquiryQtyBreakdown } from '../order-enquiry/entities/order-enquiry-qty-breakdown.entity';
import { TEST_DATA } from './test-data.config';

/**
 * Test Data Seeder
 *
 * Generates consistent test data for automated testing.
 * Supports different scenarios: minimal data, full data, edge cases.
 */
export class TestDataSeeder {
  constructor(
    private customerRepo: Repository<Customer>,
    private vendorRepo: Repository<Vendor>,
    private itemRepo: Repository<Item>,
    private oeHeaderRepo: Repository<OrderEnquiryHeader>,
    private oeDetailRepo: Repository<OrderEnquiryDetail>,
    private ocHeaderRepo: Repository<OrderConfirmationHeader>,
    private ocDetailRepo: Repository<OrderConfirmationDetail>,
    private contHeaderRepo: Repository<ContractHeader>,
    private contDetailRepo: Repository<ContractDetail>,
    private bomRepo: Repository<ProductBom>,
    private qtyBreakdownRepo: Repository<OrderEnquiryQtyBreakdown>,
    private userId: string = TEST_DATA.USER.ID,
  ) {}

  /**
   * Seed master data (customers, vendors, items)
   */
  async seedMasterData(): Promise<{
    customers: Customer[];
    vendors: Vendor[];
    items: Item[];
  }> {
    const customers = await this.seedCustomers();
    const vendors = await this.seedVendors();
    const items = await this.seedItems();

    return { customers, vendors, items };
  }

  /**
   * Seed test customers
   */
  async seedCustomers(): Promise<Customer[]> {
    const customers = [
      this.customerRepo.create({
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        ename: 'Test Customer 1',
        sname: 'TC1',
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      }),
      this.customerRepo.create({
        custNo: TEST_DATA.CUSTOMERS.CUST_002,
        ename: 'Test Customer 2',
        sname: 'TC2',
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      }),
      this.customerRepo.create({
        custNo: TEST_DATA.CUSTOMERS.CUST_003,
        ename: 'Test Customer 3',
        sname: 'TC3',
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      }),
    ];

    return await this.customerRepo.save(customers);
  }

  /**
   * Seed test vendors
   */
  async seedVendors(): Promise<Vendor[]> {
    const vendors = [
      this.vendorRepo.create({
        vendorNo: TEST_DATA.VENDORS.VEND_001,
        ename: 'Test Vendor 1',
        sname: 'TV1',
        type: 1, // Vendor
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      }),
      this.vendorRepo.create({
        vendorNo: TEST_DATA.VENDORS.VEND_002,
        ename: 'Test Vendor 2',
        sname: 'TV2',
        type: 1, // Vendor
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      }),
      this.vendorRepo.create({
        vendorNo: TEST_DATA.VENDORS.VEND_003,
        ename: 'Test Vendor 3',
        sname: 'TV3',
        type: 2, // Maker
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      }),
    ];

    return await this.vendorRepo.save(vendors);
  }

  /**
   * Seed test items
   */
  async seedItems(): Promise<Item[]> {
    const items = [
      this.itemRepo.create({
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        shortName: 'Test Item 1',
        desp: 'Test Item Description 1',
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      }),
      this.itemRepo.create({
        itemNo: TEST_DATA.ITEMS.ITEM_002,
        shortName: 'Test Item 2',
        desp: 'Test Item Description 2',
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      }),
      this.itemRepo.create({
        itemNo: TEST_DATA.ITEMS.ITEM_003,
        shortName: 'Test Item 3',
        desp: 'Test Item Description 3',
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      }),
      this.itemRepo.create({
        itemNo: TEST_DATA.ITEMS.ITEM_HEAD,
        shortName: 'Test Head Item',
        desp: 'BOM Head Item',
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      }),
      this.itemRepo.create({
        itemNo: TEST_DATA.ITEMS.ITEM_SUB,
        shortName: 'Test Sub Item',
        desp: 'BOM Sub Item',
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      }),
    ];

    return await this.itemRepo.save(items);
  }

  /**
   * Seed test order enquiries
   */
  async seedOrderEnquiries(): Promise<{
    headers: OrderEnquiryHeader[];
    details: OrderEnquiryDetail[];
  }> {
    const headers = [
      this.oeHeaderRepo.create({
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_001,
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        oeDate: new Date('2026-01-01'),
        compCode: TEST_DATA.COMPANY_CODES.HT,
        status: 0, // Draft
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      } as Partial<OrderEnquiryHeader>),
      this.oeHeaderRepo.create({
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_002,
        custNo: TEST_DATA.CUSTOMERS.CUST_002,
        oeDate: new Date('2026-01-02'),
        compCode: TEST_DATA.COMPANY_CODES.HT,
        status: 0, // Draft
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      } as Partial<OrderEnquiryHeader>),
    ];

    const savedHeaders = await this.oeHeaderRepo.save(headers);

    const details = [
      this.oeDetailRepo.create({
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_001,
        lineNo: 1,
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        qty: 100,
        price: 10.5,
        amount: 1050,
        head: false,
        vendorNo: TEST_DATA.VENDORS.VEND_001,
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      } as Partial<OrderEnquiryDetail>),
      this.oeDetailRepo.create({
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_001,
        lineNo: 2,
        itemNo: TEST_DATA.ITEMS.ITEM_HEAD,
        qty: 50,
        price: 20.0,
        amount: 1000,
        head: true,
        vendorNo: TEST_DATA.VENDORS.VEND_001,
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      } as Partial<OrderEnquiryDetail>),
      this.oeDetailRepo.create({
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_002,
        lineNo: 1,
        itemNo: TEST_DATA.ITEMS.ITEM_002,
        qty: 200,
        price: 15.0,
        amount: 3000,
        head: false,
        vendorNo: TEST_DATA.VENDORS.VEND_002,
        creDate: new Date(),
        creUser: this.userId,
        userId: this.userId,
      } as Partial<OrderEnquiryDetail>),
    ];

    const savedDetails = await this.oeDetailRepo.save(details);

    return { headers: savedHeaders, details: savedDetails };
  }

  /**
   * Seed test order confirmations
   */
  async seedOrderConfirmations(): Promise<{
    headers: OrderConfirmationHeader[];
    details: OrderConfirmationDetail[];
  }> {
    const headers = [
      this.ocHeaderRepo.create({
        confNo: TEST_DATA.ORDER_CONFIRMATIONS.OC_001,
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_001,
        date: new Date('2026-01-03'),
        custNo: TEST_DATA.CUSTOMERS.CUST_001,
        compCode: TEST_DATA.COMPANY_CODES.HT,
        userId: this.userId,
      } as Partial<OrderConfirmationHeader>),
    ];

    const savedHeaders = await this.ocHeaderRepo.save(headers);

    const details = [
      this.ocDetailRepo.create({
        confNo: TEST_DATA.ORDER_CONFIRMATIONS.OC_001,
        lineNo: 1,
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        qty: 100,
        price: 10.5,
        head: false,
        vendorNo: TEST_DATA.VENDORS.VEND_001,
      } as Partial<OrderConfirmationDetail>),
      this.ocDetailRepo.create({
        confNo: TEST_DATA.ORDER_CONFIRMATIONS.OC_001,
        lineNo: 2,
        itemNo: TEST_DATA.ITEMS.ITEM_HEAD,
        qty: 50,
        price: 20.0,
        head: true,
        vendorNo: TEST_DATA.VENDORS.VEND_001,
      } as Partial<OrderConfirmationDetail>),
    ];

    const savedDetails = await this.ocDetailRepo.save(details);

    return { headers: savedHeaders, details: savedDetails };
  }

  /**
   * Seed test contracts
   */
  async seedContracts(): Promise<{
    headers: ContractHeader[];
    details: ContractDetail[];
  }> {
    const headers = [
      this.contHeaderRepo.create({
        contNo: TEST_DATA.CONTRACTS.CONT_001,
        confNo: TEST_DATA.ORDER_CONFIRMATIONS.OC_001,
        date: new Date('2026-01-04'),
        vendorNo: TEST_DATA.VENDORS.VEND_001,
        userId: this.userId,
      } as Partial<ContractHeader>),
    ];

    const savedHeaders = await this.contHeaderRepo.save(headers);

    const details = [
      this.contDetailRepo.create({
        contNo: TEST_DATA.CONTRACTS.CONT_001,
        confNo: TEST_DATA.ORDER_CONFIRMATIONS.OC_001, // Required field
        lineNo: 1,
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        qty: 100,
        price: 10.5,
        head: false,
      } as Partial<ContractDetail>),
    ];

    const savedDetails = await this.contDetailRepo.save(details);

    return { headers: savedHeaders, details: savedDetails };
  }

  /**
   * Seed test BOMs
   */
  async seedBoms(): Promise<ProductBom[]> {
    const boms = [
      this.bomRepo.create({
        itemNo: TEST_DATA.ITEMS.ITEM_HEAD,
        subItemNo: TEST_DATA.ITEMS.ITEM_SUB,
        qty: 2,
        unit: 'PC',
      }),
    ];

    return await this.bomRepo.save(boms);
  }

  /**
   * Seed test quantity breakdowns
   */
  async seedQtyBreakdowns(): Promise<OrderEnquiryQtyBreakdown[]> {
    const breakdowns = [
      this.qtyBreakdownRepo.create({
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_001,
        itemNo: TEST_DATA.ITEMS.ITEM_001,
        qty: 50,
        port: 'LAX',
        poNo: 'TEST-PO-001',
      } as Partial<OrderEnquiryQtyBreakdown>),
    ];

    return await this.qtyBreakdownRepo.save(breakdowns);
  }

  /**
   * Cleanup all test data
   */
  async cleanup(): Promise<void> {
    // Delete in reverse order of dependencies
    // First delete all dependent records that reference items
    try {
      await this.qtyBreakdownRepo.delete({
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_001,
      });
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Delete all BOMs that reference test items (must be before deleting items)
    try {
      await this.bomRepo.delete({ itemNo: TEST_DATA.ITEMS.ITEM_HEAD });
      await this.bomRepo.delete({ itemNo: TEST_DATA.ITEMS.ITEM_001 });
      await this.bomRepo.delete({ itemNo: TEST_DATA.ITEMS.ITEM_002 });
      await this.bomRepo.delete({ itemNo: TEST_DATA.ITEMS.ITEM_003 });
      // Also delete BOMs where test items are sub-items
      await this.bomRepo
        .createQueryBuilder()
        .delete()
        .where('subItemNo IN (:...items)', {
          items: [
            TEST_DATA.ITEMS.ITEM_HEAD,
            TEST_DATA.ITEMS.ITEM_001,
            TEST_DATA.ITEMS.ITEM_002,
            TEST_DATA.ITEMS.ITEM_003,
            TEST_DATA.ITEMS.ITEM_SUB,
          ],
        })
        .execute();
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await this.contDetailRepo.delete({
        contNo: TEST_DATA.CONTRACTS.CONT_001,
      });
      await this.contHeaderRepo.delete({
        contNo: TEST_DATA.CONTRACTS.CONT_001,
      });
      await this.ocDetailRepo.delete({
        confNo: TEST_DATA.ORDER_CONFIRMATIONS.OC_001,
      });
      await this.ocHeaderRepo.delete({
        confNo: TEST_DATA.ORDER_CONFIRMATIONS.OC_001,
      });
      await this.oeDetailRepo.delete({
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_001,
      });
      await this.oeDetailRepo.delete({
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_002,
      });
      await this.oeHeaderRepo.delete({
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_001,
      });
      await this.oeHeaderRepo.delete({
        oeNo: TEST_DATA.ORDER_ENQUIRIES.OE_002,
      });
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Now safe to delete items (all BOMs referencing them are deleted)
    try {
      await this.itemRepo.delete({ itemNo: TEST_DATA.ITEMS.ITEM_001 });
      await this.itemRepo.delete({ itemNo: TEST_DATA.ITEMS.ITEM_002 });
      await this.itemRepo.delete({ itemNo: TEST_DATA.ITEMS.ITEM_003 });
      await this.itemRepo.delete({ itemNo: TEST_DATA.ITEMS.ITEM_HEAD });
      await this.itemRepo.delete({ itemNo: TEST_DATA.ITEMS.ITEM_SUB });
      await this.vendorRepo.delete({ vendorNo: TEST_DATA.VENDORS.VEND_001 });
      await this.vendorRepo.delete({ vendorNo: TEST_DATA.VENDORS.VEND_002 });
      await this.vendorRepo.delete({ vendorNo: TEST_DATA.VENDORS.VEND_003 });
      await this.customerRepo.delete({ custNo: TEST_DATA.CUSTOMERS.CUST_001 });
      await this.customerRepo.delete({ custNo: TEST_DATA.CUSTOMERS.CUST_002 });
      await this.customerRepo.delete({ custNo: TEST_DATA.CUSTOMERS.CUST_003 });
    } catch (e) {
      // Ignore if doesn't exist
    }
  }

  /**
   * Cleanup test users (called separately as users are created per test)
   */
  async cleanupUsers(userRepo: Repository<any>): Promise<void> {
    try {
      await userRepo.delete({ username: { $like: 'testuser_%' } as any });
    } catch (e) {
      // Ignore if doesn't exist or query fails
    }
  }
}
