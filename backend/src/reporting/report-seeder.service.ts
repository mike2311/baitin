import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportDefinition } from './entities/report-definition.entity';

/**
 * Report Seeder Service
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Seed report definitions from legacy report inventory
 *   - Create initial report metadata
 *   - Prepare reports for batch migration
 *
 * Reference: Phase 3 - Reporting Batch Migration
 */
@Injectable()
export class ReportSeederService {
  private readonly logger = new Logger(ReportSeederService.name);

  constructor(
    @InjectRepository(ReportDefinition)
    private readonly reportDefinitionRepository: Repository<ReportDefinition>,
  ) {}

  /**
   * Seed all report definitions from the legacy report inventory
   */
  async seedReportDefinitions(): Promise<void> {
    this.logger.log('Starting report definition seeding...');

    const reportDefinitions = this.getLegacyReportDefinitions();
    let created = 0;
    let skipped = 0;

    for (const definition of reportDefinitions) {
      try {
        // Check if report already exists
        const existing = await this.reportDefinitionRepository.findOne({
          where: { reportKey: definition.reportKey },
        });

        if (!existing) {
          await this.reportDefinitionRepository.save(definition);
          created++;
          this.logger.debug(
            `Created report definition: ${definition.reportKey}`,
          );
        } else {
          skipped++;
          this.logger.debug(`Skipped existing report: ${definition.reportKey}`);
        }
      } catch (error) {
        this.logger.error(
          `Failed to create report definition ${definition.reportKey}:`,
          error,
        );
      }
    }

    this.logger.log(
      `Report seeding completed. Created: ${created}, Skipped: ${skipped}, Total: ${reportDefinitions.length}`,
    );
  }

  /**
   * Get all legacy report definitions
   * Based on docs/source/06-reporting/report-inventory.md
   */
  private getLegacyReportDefinitions(): Partial<ReportDefinition>[] {
    return [
      // Transaction Reports - Order Enquiry
      {
        reportKey: 'pordenq',
        reportName: 'Order Enquiry Report',
        category: 'Transaction',
        description: 'Order enquiry report showing order details',
        sqlQuery: 'SELECT * FROM order_enquiry_header WHERE 1=1',
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: false },
          dateTo: { type: 'date', label: 'Date To', required: false },
          custNo: { type: 'string', label: 'Customer No', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pordenq.frx',
      },
      {
        reportKey: 'pordenq2',
        reportName: 'Order Enquiry (New)',
        category: 'Transaction',
        description: 'New format order enquiry report',
        sqlQuery:
          'SELECT * FROM order_enquiry_header h JOIN order_enquiry_detail d ON h.oe_no = d.oe_no WHERE 1=1',
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: false },
          dateTo: { type: 'date', label: 'Date To', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pordenq2.frx',
      },
      {
        reportKey: 'pordenq_pdf',
        reportName: 'Order Enquiry PDF',
        category: 'Transaction',
        description: 'Order enquiry report in PDF format',
        sqlQuery: 'SELECT * FROM order_enquiry_header WHERE 1=1',
        parameters: {
          oeNo: { type: 'string', label: 'Order No', required: true },
        },
        status: 'Active',
        legacyReportFile: 'pordenq_pdf.frx',
      },
      {
        reportKey: 'poedoc',
        reportName: 'OE Doc (OE, OC, CONT)',
        category: 'Transaction',
        description: 'Combined OE, OC, Contract documents',
        sqlQuery:
          'SELECT * FROM order_enquiry_header WHERE 1=1 UNION SELECT * FROM order_confirmation WHERE 1=1',
        parameters: {
          docType: {
            type: 'select',
            label: 'Document Type',
            options: ['OE', 'OC', 'CONTRACT'],
            required: true,
          },
        },
        status: 'Active',
        legacyReportFile: 'poedoc.frx',
      },

      // Transaction Reports - Order Confirmation
      {
        reportKey: 'pconfirm',
        reportName: 'Order Confirmation',
        category: 'Transaction',
        description: 'Order confirmation report',
        sqlQuery: 'SELECT * FROM order_confirmation WHERE 1=1',
        parameters: {
          ocNo: { type: 'string', label: 'OC Number', required: false },
          dateFrom: { type: 'date', label: 'Date From', required: false },
          dateTo: { type: 'date', label: 'Date To', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pconfirm.frx',
      },
      {
        reportKey: 'pconfirm_pdf',
        reportName: 'Order Confirmation PDF',
        category: 'Transaction',
        description: 'Order confirmation in PDF format',
        sqlQuery: 'SELECT * FROM order_confirmation WHERE 1=1',
        parameters: {
          ocNo: { type: 'string', label: 'OC Number', required: true },
        },
        status: 'Active',
        legacyReportFile: 'pconfirm_pdf.frx',
      },
      {
        reportKey: 'pocbrk',
        reportName: 'OC Qty Breakdown',
        category: 'Transaction',
        description: 'Order confirmation quantity breakdown',
        sqlQuery: 'SELECT * FROM order_confirmation_detail WHERE 1=1',
        parameters: {
          ocNo: { type: 'string', label: 'OC Number', required: true },
        },
        status: 'Active',
        legacyReportFile: 'pocbrk.frx',
      },
      {
        reportKey: 'pocqty',
        reportName: 'OC Qty & Pricing Report',
        category: 'Transaction',
        description: 'OC quantity and pricing details',
        sqlQuery: 'SELECT * FROM order_confirmation_detail WHERE 1=1',
        parameters: {
          ocNo: { type: 'string', label: 'OC Number', required: false },
          dateFrom: { type: 'date', label: 'Date From', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pocqty.frx',
      },

      // Transaction Reports - Contract
      {
        reportKey: 'pcontract_2018',
        reportName: 'Contract (2018)',
        category: 'Transaction',
        description: 'Contract report 2018 format',
        sqlQuery: 'SELECT * FROM contract WHERE 1=1',
        parameters: {
          contractNo: {
            type: 'string',
            label: 'Contract Number',
            required: false,
          },
        },
        status: 'Active',
        legacyReportFile: 'pcontract@_2018.frx',
      },
      {
        reportKey: 'pcontract_pdf',
        reportName: 'Contract PDF',
        category: 'Transaction',
        description: 'Contract in PDF format',
        sqlQuery: 'SELECT * FROM contract WHERE 1=1',
        parameters: {
          contractNo: {
            type: 'string',
            label: 'Contract Number',
            required: true,
          },
        },
        status: 'Active',
        legacyReportFile: 'pcontract_pdf.frx',
      },
      {
        reportKey: 'pcontbrk',
        reportName: 'Contract Qty Breakdown',
        category: 'Transaction',
        description: 'Contract quantity breakdown',
        sqlQuery: 'SELECT * FROM contract_detail WHERE 1=1',
        parameters: {
          contractNo: {
            type: 'string',
            label: 'Contract Number',
            required: true,
          },
        },
        status: 'Active',
        legacyReportFile: 'pcontbrk.frx',
      },
      {
        reportKey: 'pcontamdrmk',
        reportName: 'Contract Amendment',
        category: 'Transaction',
        description: 'Contract amendment report',
        sqlQuery: 'SELECT * FROM contract_amendment WHERE 1=1',
        parameters: {
          contractNo: {
            type: 'string',
            label: 'Contract Number',
            required: true,
          },
        },
        status: 'Active',
        legacyReportFile: 'pcontamdrmk.frx',
      },

      // Transaction Reports - Shipping Order
      {
        reportKey: 'pso',
        reportName: 'Shipping Order',
        category: 'Transaction',
        description: 'Shipping order report',
        sqlQuery: 'SELECT * FROM shipping_order WHERE 1=1',
        parameters: {
          soNo: { type: 'string', label: 'SO Number', required: false },
          dateFrom: { type: 'date', label: 'Date From', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pso.frx',
      },
      {
        reportKey: 'pso_pdf',
        reportName: 'Shipping Order PDF',
        category: 'Transaction',
        description: 'Shipping order in PDF format',
        sqlQuery: 'SELECT * FROM shipping_order WHERE 1=1',
        parameters: {
          soNo: { type: 'string', label: 'SO Number', required: true },
        },
        status: 'Active',
        legacyReportFile: 'pso_pdf.frx',
      },

      // Transaction Reports - Invoice
      {
        reportKey: 'pinv',
        reportName: 'Invoice (New)',
        category: 'Transaction',
        description: 'New format invoice report',
        sqlQuery: 'SELECT * FROM invoice_header WHERE 1=1',
        parameters: {
          invNo: { type: 'string', label: 'Invoice Number', required: false },
          dateFrom: { type: 'date', label: 'Date From', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pinv@.frx',
      },
      {
        reportKey: 'pinv_pdf',
        reportName: 'Invoice PDF',
        category: 'Transaction',
        description: 'Invoice in PDF format',
        sqlQuery: 'SELECT * FROM invoice_header WHERE 1=1',
        parameters: {
          invNo: { type: 'string', label: 'Invoice Number', required: true },
        },
        status: 'Active',
        legacyReportFile: 'pinv_pdf.frx',
      },
      {
        reportKey: 'pinv_xls',
        reportName: 'Invoice to XLS',
        category: 'Export',
        description: 'Invoice export to Excel',
        sqlQuery:
          'SELECT * FROM invoice_header h JOIN invoice_detail d ON h.inv_no = d.inv_no WHERE 1=1',
        parameters: {
          invNo: { type: 'string', label: 'Invoice Number', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pinv_xls.frx',
      },
      {
        reportKey: 'ppacklist_new',
        reportName: 'Packing List (New)',
        category: 'Transaction',
        description: 'New format packing list',
        sqlQuery: 'SELECT * FROM invoice_detail WHERE 1=1',
        parameters: {
          invNo: { type: 'string', label: 'Invoice Number', required: true },
        },
        status: 'Active',
        legacyReportFile: 'ppacklist_new.frx',
      },
      {
        reportKey: 'ppacklist_xls',
        reportName: 'Packing List to XLS',
        category: 'Export',
        description: 'Packing list export to Excel',
        sqlQuery: 'SELECT * FROM invoice_detail WHERE 1=1',
        parameters: {
          invNo: { type: 'string', label: 'Invoice Number', required: true },
        },
        status: 'Active',
        legacyReportFile: 'ppacklist_xls.frx',
      },
      {
        reportKey: 'ppacklist_xls_spencer',
        reportName: 'Packing List (Spencer Format)',
        category: 'Export',
        description: 'Spencer-specific packing list format',
        sqlQuery: 'SELECT * FROM invoice_detail WHERE 1=1',
        parameters: {
          invNo: { type: 'string', label: 'Invoice Number', required: true },
        },
        status: 'Active',
        legacyReportFile: 'ppacklist_xls_spencer.frx',
      },

      // Transaction Reports - Delivery Note
      {
        reportKey: 'pdn',
        reportName: 'Delivery Note',
        category: 'Transaction',
        description: 'Delivery note report',
        sqlQuery: 'SELECT * FROM delivery_note_header WHERE 1=1',
        parameters: {
          dnNo: { type: 'string', label: 'DN Number', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pdn.frx',
      },
      {
        reportKey: 'pdnorg',
        reportName: 'D/N Original List',
        category: 'Transaction',
        description: 'Original delivery note list',
        sqlQuery: 'SELECT * FROM delivery_note_header WHERE 1=1',
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pdnorg.frx',
      },
      {
        reportKey: 'pla',
        reportName: 'Loading Advice',
        category: 'Transaction',
        description: 'Loading advice report',
        sqlQuery: 'SELECT * FROM loading_advice_header WHERE 1=1',
        parameters: {
          laNo: { type: 'string', label: 'LA Number', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pla.frx',
      },

      // Transaction Reports - Debit Note
      {
        reportKey: 'pdebitnote',
        reportName: 'Debit Note',
        category: 'Transaction',
        description: 'Debit note report',
        sqlQuery: 'SELECT * FROM debit_note WHERE 1=1',
        parameters: {
          dnNo: { type: 'string', label: 'Debit Note Number', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pdebitnote.frx',
      },

      // Summary Reports
      {
        reportKey: 'poesumry',
        reportName: 'OE Summary',
        category: 'Summary',
        description: 'Order enquiry summary report',
        sqlQuery:
          "SELECT COUNT(*) as total_oe, DATE_TRUNC('month', date) as month FROM order_enquiry_header GROUP BY DATE_TRUNC('month', date)",
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: false },
          dateTo: { type: 'date', label: 'Date To', required: false },
        },
        status: 'Active',
        legacyReportFile: 'poesumry.frx',
      },
      {
        reportKey: 'pocsumry',
        reportName: 'OC Summary',
        category: 'Summary',
        description: 'Order confirmation summary',
        sqlQuery:
          "SELECT COUNT(*) as total_oc, DATE_TRUNC('month', date) as month FROM order_confirmation GROUP BY DATE_TRUNC('month', date)",
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pocsumry.frx',
      },
      {
        reportKey: 'einvsumry',
        reportName: 'Invoice Summary',
        category: 'Summary',
        description: 'Invoice summary report',
        sqlQuery:
          'SELECT COUNT(*) as total_inv, SUM(total_amount) as total_value FROM invoice_header',
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: false },
        },
        status: 'Active',
        legacyReportFile: 'einvsumry.frx',
      },
      {
        reportKey: 'econtsumry',
        reportName: 'Contract Summary',
        category: 'Summary',
        description: 'Contract summary report',
        sqlQuery: 'SELECT COUNT(*) as total_contracts FROM contract',
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: false },
        },
        status: 'Active',
        legacyReportFile: 'econtsumry.frx',
      },

      // Analysis Reports
      {
        reportKey: 'psabycust',
        reportName: 'Sales Analysis By Customer',
        category: 'Analysis',
        description: 'Sales analysis grouped by customer',
        sqlQuery:
          'SELECT c.ename, SUM(i.total_amount) as total_sales FROM invoice_header i JOIN customer c ON i.cust_no = c.cust_no GROUP BY c.ename',
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: true },
          dateTo: { type: 'date', label: 'Date To', required: true },
        },
        status: 'Active',
        legacyReportFile: 'psabycust.frx',
      },
      {
        reportKey: 'psabydt',
        reportName: 'Sales Analysis By Customer - Date',
        category: 'Analysis',
        description: 'Sales analysis by customer and date',
        sqlQuery:
          'SELECT c.ename, i.date, SUM(i.total_amount) as sales FROM invoice_header i JOIN customer c ON i.cust_no = c.cust_no GROUP BY c.ename, i.date',
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: true },
          dateTo: { type: 'date', label: 'Date To', required: true },
        },
        status: 'Active',
        legacyReportFile: 'psabydt.frx',
      },
      {
        reportKey: 'psabyitem',
        reportName: 'Sales Analysis By Item - Date',
        category: 'Analysis',
        description: 'Sales analysis by item and date',
        sqlQuery:
          'SELECT it.item_name, i.date, SUM(id.amount) as sales FROM invoice_detail id JOIN invoice_header i ON id.inv_no = i.inv_no JOIN item it ON id.item_no = it.item_no GROUP BY it.item_name, i.date',
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: true },
          dateTo: { type: 'date', label: 'Date To', required: true },
        },
        status: 'Active',
        legacyReportFile: 'psabyitem.frx',
      },
      {
        reportKey: 'pordbyitem',
        reportName: 'Order Report By Item',
        category: 'Analysis',
        description: 'Order analysis by item',
        sqlQuery:
          'SELECT it.item_name, COUNT(*) as order_count FROM order_enquiry_detail oed JOIN item it ON oed.item_no = it.item_no GROUP BY it.item_name',
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pordbyitem.frx',
      },
      {
        reportKey: 'polbymk',
        reportName: 'Order List By Maker',
        category: 'Analysis',
        description: 'Order list grouped by maker',
        sqlQuery:
          'SELECT v.maker_name, COUNT(*) as orders FROM order_enquiry_header oeh JOIN vendor v ON oeh.vendor_no = v.vendor_no GROUP BY v.maker_name',
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: false },
        },
        status: 'Active',
        legacyReportFile: 'polbymk.frx',
      },
      {
        reportKey: 'ecostbrk',
        reportName: 'Cost Breakdown',
        category: 'Analysis',
        description: 'Cost breakdown analysis',
        sqlQuery:
          'SELECT item_no, cost, price, (price - cost) as margin FROM item WHERE cost > 0',
        parameters: {
          itemNo: { type: 'string', label: 'Item Number', required: false },
        },
        status: 'Active',
        legacyReportFile: 'ecostbrk.frx',
      },

      // Item Reports
      {
        reportKey: 'pitem',
        reportName: 'Item Detail Report',
        category: 'Transaction',
        description: 'Detailed item information report',
        sqlQuery: 'SELECT * FROM item WHERE 1=1',
        parameters: {
          itemNo: { type: 'string', label: 'Item Number', required: false },
          grpCode: { type: 'string', label: 'Group Code', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pitem.frx',
      },
      {
        reportKey: 'pitemsum',
        reportName: 'Item Bought (Excel)',
        category: 'Export',
        description: 'Item purchase summary in Excel',
        sqlQuery:
          'SELECT i.item_no, i.item_name, SUM(oed.qty) as total_bought FROM item i LEFT JOIN order_enquiry_detail oed ON i.item_no = oed.item_no GROUP BY i.item_no, i.item_name',
        parameters: {
          dateFrom: { type: 'date', label: 'Date From', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pitemsum.frx',
      },
      {
        reportKey: 'pitemmeas',
        reportName: 'Item Measurement (Excel)',
        category: 'Export',
        description: 'Item measurements export to Excel',
        sqlQuery:
          'SELECT item_no, item_name, l, w, h, wt, cube FROM item WHERE l IS NOT NULL',
        parameters: {
          itemNo: { type: 'string', label: 'Item Number', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pitemmeas.frx',
      },

      // Export Reports
      {
        reportKey: 'pdn_xls',
        reportName: 'D/N to Excel',
        category: 'Export',
        description: 'Delivery note export to Excel',
        sqlQuery:
          'SELECT * FROM delivery_note_header h JOIN delivery_note_detail d ON h.dn_no = d.dn_no WHERE 1=1',
        parameters: {
          dnNo: { type: 'string', label: 'DN Number', required: false },
        },
        status: 'Active',
        legacyReportFile: 'pdn_xls.frx',
      },
      {
        reportKey: 'psm_to_xls',
        reportName: 'Shipmark to XLS',
        category: 'Export',
        description: 'Shipmark export to Excel',
        sqlQuery:
          'SELECT DISTINCT ship_mark FROM shipping_order WHERE ship_mark IS NOT NULL',
        parameters: {
          soNo: { type: 'string', label: 'SO Number', required: false },
        },
        status: 'Active',
        legacyReportFile: 'psm_to_xls.frx',
      },

      // Add remaining reports as placeholders (would need full SQL definitions)
      // This covers the major categories from the inventory
    ].map((def) => ({
      ...def,
      creUser: 'SYSTEM_SEEDER',
      creDate: new Date(),
      modDate: new Date(),
    }));
  }

  /**
   * Get count of seeded reports
   */
  async getReportCount(): Promise<{
    total: number;
    active: number;
    migrated: number;
  }> {
    const total = await this.reportDefinitionRepository.count();
    const active = await this.reportDefinitionRepository.count({
      where: { status: 'Active' },
    });
    const migrated = await this.reportDefinitionRepository.count({
      where: { status: 'Migrated' },
    });

    return { total, active, migrated };
  }

  /**
   * Clear all report definitions (for testing)
   */
  async clearAllReports(): Promise<void> {
    await this.reportDefinitionRepository.clear();
    this.logger.log('All report definitions cleared');
  }
}
