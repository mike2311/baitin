import { DataSource } from 'typeorm';
import { ShippingOrder } from '../shipping-order/entities/shipping-order.entity';
import { DeliveryNoteHeader } from '../delivery-note/entities/delivery-note-header.entity';
import { LoadingMaster } from '../loading/entities/loading-master.entity';
import { InvoiceHeader } from '../invoice/entities/invoice-header.entity';
import { ReportDefinition } from '../reporting/entities/report-definition.entity';

/**
 * Phase 3 Test Data Seeder
 *
 * Functions:
 * - Seed SO test data
 * - Seed DN test data
 * - Seed Invoice test data
 * - Seed Loading test data
 * - Seed report definitions
 * - Create complete workflow test scenarios
 *
 * Reference: Phase 3 - Test Data Management
 */
export class Phase3TestDataSeeder {
  constructor(private dataSource: DataSource) {}

  /**
   * Seed Shipping Order test data
   * Note: ShippingOrder is a detail table (not a header), so each record needs soNo, itemNo, qty
   */
  async seedShippingOrders(count: number = 10): Promise<ShippingOrder[]> {
    const soRecords: ShippingOrder[] = [];
    const repo = this.dataSource.getRepository(ShippingOrder);

    for (let i = 0; i < count; i++) {
      const soNo = `SO-TEST-${Date.now()}-${i}`;
      const so = repo.create({
        soNo,
        itemNo: 'ITEM001',
        qty: 100,
        creUser: 'test-user',
        userId: 'test-user',
      });

      const saved = await repo.save(so);
      soRecords.push(saved);
    }

    return soRecords;
  }

  /**
   * Seed Delivery Note test data
   */
  async seedDeliveryNotes(count: number = 10): Promise<DeliveryNoteHeader[]> {
    const dnHeaders: DeliveryNoteHeader[] = [];
    const repo = this.dataSource.getRepository(DeliveryNoteHeader);

    for (let i = 0; i < count; i++) {
      const dnNo = `DN-TEST-${Date.now()}-${i}`;
      const dn = repo.create({
        dnNo,
        date: new Date('2025-01-16'),
        custNo: 'CUST001',
        loadingStatus: 'Created',
        creUser: 'test-user',
        userId: 'test-user',
      });

      const saved = await repo.save(dn);
      dnHeaders.push(saved);
    }

    return dnHeaders;
  }

  /**
   * Seed Invoice test data
   */
  async seedInvoices(count: number = 10): Promise<InvoiceHeader[]> {
    const invHeaders: InvoiceHeader[] = [];
    const repo = this.dataSource.getRepository(InvoiceHeader);

    for (let i = 0; i < count; i++) {
      const invNo = `INV-TEST-${Date.now()}-${i}`;
      const inv = repo.create({
        invNo,
        date: new Date('2025-01-18'),
        custNo: 'CUST001',
        plStatus: 'Not Printed',
        plShStatus: 'Not Printed',
        creUser: 'test-user',
        userId: 'test-user',
      });

      const saved = await repo.save(inv);
      invHeaders.push(saved);
    }

    return invHeaders;
  }

  /**
   * Seed Loading test data
   */
  async seedLoadingMasters(count: number = 5): Promise<LoadingMaster[]> {
    const loadingMasters: LoadingMaster[] = [];
    const repo = this.dataSource.getRepository(LoadingMaster);

    for (let i = 0; i < count; i++) {
      const loadingNo = `LOAD-TEST-${Date.now()}-${i}`;
      const loading = repo.create({
        loadingNo,
        date: new Date('2025-01-17'),
        vesselName: `VESSEL-${i}`,
        voyageNo: `VOY-${i}`,
        status: 'Planned',
        creUser: 'test-user',
        userId: 'test-user',
      });

      const saved = await repo.save(loading);
      loadingMasters.push(saved);
    }

    return loadingMasters;
  }

  /**
   * Seed report definitions
   */
  async seedReportDefinitions(): Promise<ReportDefinition[]> {
    const reports: ReportDefinition[] = [];
    const repo = this.dataSource.getRepository(ReportDefinition);

    const reportDefs = [
      {
        reportKey: 'SALES_ANALYSIS',
        reportName: 'Sales Analysis Report',
        category: 'Sales',
        description: 'Sales analysis by customer and date range',
        sqlQuery:
          'SELECT * FROM sales_analysis WHERE date_from = :dateFrom AND date_to = :dateTo',
        parameters: JSON.stringify(['dateFrom', 'dateTo']),
        status: 'Active',
      },
      {
        reportKey: 'ITEM_ENQUIRY',
        reportName: 'Item Enquiry Report',
        category: 'Inventory',
        description: 'Item enquiry with historical data',
        sqlQuery: 'SELECT * FROM item_history WHERE item_no = :itemNo',
        parameters: JSON.stringify(['itemNo']),
        status: 'Active',
      },
    ];

    for (const def of reportDefs) {
      const existing = await repo.findOne({
        where: { reportKey: def.reportKey },
      });
      if (!existing) {
        const report = repo.create(def);
        const saved = await repo.save(report);
        reports.push(saved);
      }
    }

    return reports;
  }

  /**
   * Create complete workflow test scenario
   */
  async createCompleteWorkflowScenario(): Promise<{
    soNo: string;
    dnNo: string;
    loadingNo: string;
    invNo: string;
  }> {
    const timestamp = Date.now();

    // Create SO (ShippingOrder is a detail table)
    const soRepo = this.dataSource.getRepository(ShippingOrder);
    const soNo = `SO-WORKFLOW-${timestamp}`;
    const so = soRepo.create({
      soNo,
      itemNo: 'ITEM001',
      qty: 100,
      creUser: 'test-user',
      userId: 'test-user',
    });
    await soRepo.save(so);

    // Create DN
    const dnRepo = this.dataSource.getRepository(DeliveryNoteHeader);
    const dnNo = `DN-WORKFLOW-${timestamp}`;
    const dn = dnRepo.create({
      dnNo,
      date: new Date('2025-01-16'),
      custNo: 'CUST001',
      soNo,
      loadingStatus: 'Created',
      creUser: 'test-user',
      userId: 'test-user',
    });
    await dnRepo.save(dn);

    // Create Loading
    const loadingRepo = this.dataSource.getRepository(LoadingMaster);
    const loadingNo = `LOAD-WORKFLOW-${timestamp}`;
    const loading = loadingRepo.create({
      loadingNo,
      date: new Date('2025-01-17'),
      vesselName: 'VESSEL-001',
      voyageNo: 'VOY-001',
      status: 'Planned',
      creUser: 'test-user',
      userId: 'test-user',
    });
    await loadingRepo.save(loading);

    // Update DN with loading
    dn.loadingNo = loadingNo;
    dn.loadingStatus = 'Loading';
    await dnRepo.save(dn);

    // Create Invoice
    const invRepo = this.dataSource.getRepository(InvoiceHeader);
    const invNo = `INV-WORKFLOW-${timestamp}`;
    const inv = invRepo.create({
      invNo,
      date: new Date('2025-01-18'),
      custNo: 'CUST001',
      ocNo: 'OC001', // InvoiceHeader uses ocNo, not soNo
      plStatus: 'Not Printed',
      plShStatus: 'Not Printed',
      creUser: 'test-user',
      userId: 'test-user',
    });
    await invRepo.save(inv);

    return { soNo, dnNo, loadingNo, invNo };
  }

  /**
   * Cleanup test data
   */
  async cleanup(): Promise<void> {
    // Note: Repositories retrieved but cleanup logic not yet implemented
    // this.dataSource.getRepository(InvoiceHeader);
    // this.dataSource.getRepository(LoadingMaster);
    // this.dataSource.getRepository(DeliveryNoteHeader);
    // this.dataSource.getRepository(ShippingOrder);
    // Note: RegExp not supported in delete, use Like() from typeorm
    // For now, delete specific test data or skip cleanup
    // await invRepo.delete({ invNo: Like('TEST-%') });
    // await loadingRepo.delete({ loadingNo: Like('TEST-%') });
    // await dnRepo.delete({ dnNo: Like('TEST-%') });
    // await soRepo.delete({ soNo: Like('TEST-%') });
  }
}
