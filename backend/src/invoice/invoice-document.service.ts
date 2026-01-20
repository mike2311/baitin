import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InvoiceHeader } from './entities/invoice-header.entity';
import { InvoiceDetail } from './entities/invoice-detail.entity';
import {
  GenerateInvoiceDocumentDto,
  InvoiceDocumentType,
} from './dto/generate-invoice-document.dto';
import {
  InvoiceDocumentPreviewResponseDto,
  InvoiceDocumentGenerationResponseDto,
} from './dto/invoice-document-response.dto';
const XLSX = require('xlsx');

/**
 * Invoice Document Service
 *
 * Original Logic Reference:
 * - Legacy Forms: ppacklist_new, ppacklist_xls, ppacklist_xls_spencer, pshadvice, pdebitnote
 * - Legacy Program: uwpacklist.prg
 * - Documentation: docs/source/02-business-processes/invoice-process.md
 * - Business Rules:
 *   - Generate packing lists with carton breakdown
 *   - Weight unit conversion (kg to lbs if wt_unit = 2)
 *   - Customer-specific formats (Spencer)
 *   - Shipment advice and debit note generation
 *
 * Reference: Phase 3 - Invoice Document Generation
 */
@Injectable()
export class InvoiceDocumentService {
  constructor(
    @InjectRepository(InvoiceHeader)
    private readonly invoiceHeaderRepository: Repository<InvoiceHeader>,
    @InjectRepository(InvoiceDetail)
    private readonly invoiceDetailRepository: Repository<InvoiceDetail>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Preview invoice document data
   *
   * Returns preview data without generating file
   */
  async previewInvoiceDocument(
    generateDto: GenerateInvoiceDocumentDto,
  ): Promise<InvoiceDocumentPreviewResponseDto> {
    // Load invoice data based on document type
    const invoiceData = await this.loadInvoiceData(
      generateDto.invNos,
      generateDto.documentType,
      generateDto.containerNo,
    );

    if (invoiceData.length === 0) {
      throw new NotFoundException(
        'No invoices found for the specified invoice numbers',
      );
    }

    return {
      invNos: generateDto.invNos,
      documentType: generateDto.documentType,
      data: invoiceData,
    };
  }

  /**
   * Generate invoice document file
   *
   * Original Logic Reference:
   * - Legacy Forms: ppacklist_new, ppacklist_xls_spencer, pshadvice, pdebitnote
   * - Business Rules:
   *   - Generate PDF or Excel file
   *   - Apply customer-specific formatting
   */
  async generateInvoiceDocument(
    generateDto: GenerateInvoiceDocumentDto,
  ): Promise<InvoiceDocumentGenerationResponseDto> {
    const format =
      generateDto.outputFormat ||
      (generateDto.documentType.includes('spencer') ? 'excel' : 'pdf');

    // Load invoice data
    const invoiceData = await this.loadInvoiceData(
      generateDto.invNos,
      generateDto.documentType,
      generateDto.containerNo,
    );

    if (invoiceData.length === 0) {
      throw new NotFoundException(
        'No invoices found for the specified invoice numbers',
      );
    }

    // Generate file based on document type and format
    let fileName: string;
    let fileBuffer: Buffer;

    if (format === 'excel') {
      const excelData = await this.generateExcel(
        invoiceData,
        generateDto.documentType,
      );
      const extension = 'xlsx';
      fileName =
        generateDto.fileName ||
        `${generateDto.documentType}_${generateDto.invNos.join('_')}_${new Date().toISOString().split('T')[0]}.${extension}`;
      fileBuffer = excelData;
    } else if (format === 'pdf') {
      const pdfData = await this.generatePdf(
        invoiceData,
        generateDto.documentType,
      );
      fileName =
        generateDto.fileName ||
        `${generateDto.documentType}_${generateDto.invNos.join('_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      fileBuffer = pdfData;
    } else {
      throw new BadRequestException(`Unsupported output format: ${format}`);
    }

    return {
      invNos: generateDto.invNos,
      documentType: generateDto.documentType,
      fileName,
      fileSize: fileBuffer.length,
      format: format as 'pdf' | 'excel' | 'html',
      generatedAt: new Date(),
      fileBuffer,
    };
  }

  /**
   * Load invoice data for document generation
   *
   * Original Logic Reference:
   * - Legacy Program: uwpacklist.prg
   * - Business Rules:
   *   - Join invoice with customer, item, OC data
   *   - Weight unit conversion (kg to lbs)
   *   - Extract description memo
   *   - Calculate totals
   */
  private async loadInvoiceData(
    invNos: string[],
    documentType: InvoiceDocumentType,
    containerNo?: string,
  ): Promise<any[]> {
    let query: string;
    const parameters: any[] = [invNos];
    let paramIndex = 2;

    if (
      documentType === InvoiceDocumentType.PACKING_LIST ||
      documentType === InvoiceDocumentType.PACKING_LIST_SPENCER
    ) {
      // Packing list query
      query = `
        SELECT DISTINCT
          inv.inv_no,
          inv.date,
          inv.cust_no,
          c.ename as customer_name,
          c.addr1 as customer_addr1,
          c.addr2 as customer_addr2,
          c.addr3 as customer_addr3,
          c.addr4 as customer_addr4,
          c.wt_unit,
          c.pl_name,
          c.dim_2,
          inv.oc_no as conf_no,
          inv.ship,
          inv.loading,
          inv.dest,
          inv.del_date,
          inv.remarks as covering
        FROM invoice_header inv
        LEFT JOIN customer c ON inv.cust_no = c.cust_no
        WHERE inv.inv_no = ANY($1)
        ORDER BY inv.inv_no, inv.date
      `;
    } else {
      // Standard invoice query
      query = `
        SELECT DISTINCT
          inv.inv_no,
          inv.date,
          inv.cust_no,
          c.ename as customer_name,
          c.addr1 as customer_addr1,
          c.addr2 as customer_addr2,
          c.addr3 as customer_addr3,
          c.addr4 as customer_addr4,
          inv.oc_no as conf_no,
          inv.ship,
          inv.loading,
          inv.dest,
          inv.del_date,
          inv.payment_terms
        FROM invoice_header inv
        LEFT JOIN customer c ON inv.cust_no = c.cust_no
        WHERE inv.inv_no = ANY($1)
        ORDER BY inv.inv_no, inv.date
      `;
    }

    const invoiceHeaders = await this.dataSource.query(query, parameters);

    // Load invoice items
    let itemsQuery = `
      SELECT
        invd.inv_no,
        invd.item_no,
        i.desp as item_description,
        invd.qty,
        invd.price,
        invd.amount,
        invd.ctn,
        invd.qctn,
        invd.net,
        invd.wt,
        invd.cube,
        invd.dim,
        invd.unit,
        invd.desp_memo,
        invd.po_no,
        invd.ship_no,
        invd.cntr_no,
        invd.ref_no,
        invd.oc_no,
        invd.conf_no,
        invd.so_no,
        invd.head,
        i.skn_no,
        i.short_name as item_name,
        NULL as ol,
        NULL as ow,
        NULL as oh,
        NULL as il,
        NULL as iw,
        NULL as ih,
        NULL as op_desp,
        NULL as ip_desp
      FROM invoice_detail invd
      LEFT JOIN item i ON invd.item_no = i.item_no
      WHERE invd.inv_no = ANY($1)
    `;

    if (containerNo) {
      itemsQuery += ` AND invd.cntr_no = $${paramIndex++}`;
      parameters.push(containerNo);
    }

    itemsQuery += ` ORDER BY invd.inv_no, invd.item_no, invd.line_no`;

    const invoiceItems = await this.dataSource.query(itemsQuery, parameters);

    // Get ship marks from SO
    const shipMarksQuery = `
      SELECT DISTINCT
        so.so_no,
        so.ship_mark
      FROM shipping_order so
      WHERE so.so_no IN (
        SELECT DISTINCT invd.so_no
        FROM invoice_detail invd
        WHERE invd.inv_no = ANY($1)
      )
    `;
    const shipMarks = await this.dataSource.query(shipMarksQuery, [invNos]);
    const shipMarkMap = shipMarks.reduce((acc: any, row: any) => {
      acc[row.so_no] = row.ship_mark;
      return acc;
    }, {});

    // Group items by invoice
    const itemsByInv = invoiceItems.reduce((acc: any, item: any) => {
      if (!acc[item.inv_no]) {
        acc[item.inv_no] = [];
      }
      acc[item.inv_no].push({
        itemNo: item.item_no,
        itemName: item.item_name || this.extractFirstLine(item.desp_memo),
        itemDescription: item.item_description,
        sknNo: item.skn_no,
        qty: parseFloat(item.qty),
        ctn: item.ctn ? parseFloat(item.ctn) : undefined,
        qctn: item.qctn ? parseFloat(item.qctn) : undefined,
        net: item.net ? parseFloat(item.net) : undefined,
        wt: item.wt ? parseFloat(item.wt) : undefined,
        cube: item.cube ? parseFloat(item.cube) : undefined,
        dim: item.dim,
        outerDim:
          item.ol && item.ow && item.oh
            ? `${item.ol}x${item.ow}x${item.oh}=${this.calculateCube(item.ol, item.ow, item.oh)}`
            : item.dim || undefined,
        innerDim:
          item.il && item.iw && item.ih
            ? `${item.il}x${item.iw}x${item.ih}=${this.calculateCube(item.il, item.iw, item.ih)}`
            : undefined,
        shipMark: shipMarkMap[item.so_no],
        poNo: item.po_no,
        cntrNo: item.cntr_no,
        unit: item.unit,
        head: item.head,
        headItem: item.head ? item.item_no : undefined,
      });
      return acc;
    }, {});

    // Combine headers with items and apply weight conversion
    return invoiceHeaders.map((header: any) => {
      const items = itemsByInv[header.inv_no] || [];

      // Apply weight unit conversion if needed (kg to lbs)
      const convertedItems = items.map((item: any) => {
        if (header.wt_unit === 2 && item.net) {
          // Convert kg to lbs (divide by 2.2)
          item.net = item.net / 2.2;
          item.wt = item.wt ? item.wt / 2.2 : undefined;
        }
        return item;
      });

      // Calculate totals
      const totals = convertedItems.reduce((acc: any, item: any) => {
        acc.totalCartons = (acc.totalCartons || 0) + (item.ctn || 0);
        acc.totalQty = (acc.totalQty || 0) + item.qty;
        acc.totalNet = (acc.totalNet || 0) + (item.net || 0);
        acc.totalWt = (acc.totalWt || 0) + (item.wt || 0);
        acc.totalCube = (acc.totalCube || 0) + (item.cube || 0);
        return acc;
      }, {});

      return {
        invNo: header.inv_no,
        date: header.date,
        custNo: header.cust_no,
        customerName: header.customer_name,
        customerAddress: {
          addr1: header.customer_addr1,
          addr2: header.customer_addr2,
          addr3: header.customer_addr3,
          addr4: header.customer_addr4,
        },
        items: convertedItems,
        confNo: header.conf_no,
        ship: header.ship,
        loading: header.loading,
        dest: header.dest,
        delDate: header.del_date,
        covering: header.covering,
        plName: header.pl_name || 'Packing List',
        dim2: header.dim_2,
        ...totals,
      };
    });
  }

  /**
   * Generate Excel file for packing list
   *
   * Original Logic Reference:
   * - Legacy Form: ppacklist_xls_spencer
   * - Business Rules:
   *   - Spencer format has specific Excel layout
   *   - BOM items with sub-items (head items with a, b, c suffixes)
   *   - Dimension calculations (outer and inner)
   */
  private async generateExcel(
    invoiceData: any[],
    documentType: InvoiceDocumentType,
  ): Promise<Buffer> {
    if (documentType === InvoiceDocumentType.PACKING_LIST_SPENCER) {
      return this.generateSpencerPackingListExcel(invoiceData);
    } else if (documentType === InvoiceDocumentType.PACKING_LIST) {
      return this.generateStandardPackingListExcel(invoiceData);
    } else if (documentType === InvoiceDocumentType.SHIPMENT_ADVICE) {
      return this.generateShipmentAdviceExcel(invoiceData);
    } else if (documentType === InvoiceDocumentType.DEBIT_NOTE) {
      return this.generateDebitNoteExcel(invoiceData);
    } else {
      return this.generateInvoiceExcel(invoiceData);
    }
  }

  /**
   * Generate Spencer packing list Excel format
   *
   * Original Logic Reference:
   * - Legacy Form: ppacklist_xls_spencer
   * - Business Rules:
   *   - Custom Excel layout with specific formatting
   *   - BOM item handling (head items with sub-items)
   *   - Dimension calculations
   */
  private async generateSpencerPackingListExcel(
    invoiceData: any[],
  ): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();

    invoiceData.forEach((inv) => {
      const data: any[][] = [];

      // Header section
      data.push([inv.plName || 'Packing List']);
      data.push([]);
      data.push(['Consignee:', inv.customerName || '']);
      if (inv.customerAddress) {
        if (inv.customerAddress.addr1)
          data.push(['', inv.customerAddress.addr1]);
        if (inv.customerAddress.addr2)
          data.push(['', inv.customerAddress.addr2]);
        if (inv.customerAddress.addr3)
          data.push(['', inv.customerAddress.addr3]);
        if (inv.customerAddress.addr4)
          data.push(['', inv.customerAddress.addr4]);
      }
      data.push([]);
      data.push([
        'Date:',
        inv.date ? new Date(inv.date).toLocaleDateString() : '',
      ]);
      data.push(['Invoice No:', inv.invNo]);
      data.push(['Confirmation No:', inv.confNo || '']);
      data.push(['Covering:', inv.covering || '']);
      data.push([]);

      // Items header
      data.push([
        'No',
        'Item No',
        'SKN No',
        'PO No',
        'Item Name',
        'Cartons',
        'Qty',
        'Qty/Ctn',
        'NNW',
        'NW',
        'Total NW',
        'GW',
        'Total GW',
        'Cube',
        'Total Cube',
        'Dimensions',
        'Total Dim Cube',
      ]);

      // Process items with BOM handling
      let itemCount = 0;
      let sonCount = 0;
      let currentHeadItem: any = null;

      inv.items.forEach((item: any) => {
        if (item.head) {
          // Head item
          itemCount++;
          sonCount = 0;
          currentHeadItem = item;
          data.push([
            itemCount,
            item.itemNo,
            item.sknNo || '',
            item.poNo || '',
            item.itemName || item.itemDescription || '',
            item.ctn || 0,
            item.qty,
            item.qctn || 0,
            item.net ? (item.net * 0.9).toFixed(2) : '',
            item.net ? item.net.toFixed(2) : '',
            item.net && item.ctn ? (item.net * item.ctn).toFixed(2) : '',
            item.wt ? item.wt.toFixed(2) : '',
            item.wt && item.ctn ? (item.wt * item.ctn).toFixed(2) : '',
            item.cube ? item.cube.toFixed(2) : '',
            item.cube && item.ctn ? (item.cube * item.ctn).toFixed(2) : '',
            item.outerDim || '',
            item.outerDim && item.ctn
              ? this.calculateTotalDimCube(item.outerDim, item.ctn)
              : '',
          ]);
        } else {
          // Sub-item (BOM component)
          sonCount++;
          const subItemNo = `${itemCount}${String.fromCharCode(96 + sonCount)}`;
          data.push([
            subItemNo,
            item.itemNo,
            item.sknNo || '',
            item.poNo || '',
            item.itemName || item.itemDescription || '',
            '',
            item.qty,
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            item.outerDim || item.innerDim || '',
            '',
          ]);
        }
      });

      data.push([]);
      data.push(['Total Cartons:', inv.totalCartons || 0]);
      data.push(['Total Qty:', inv.totalQty || 0]);
      data.push(['Total NW:', inv.totalNet ? inv.totalNet.toFixed(2) : '']);
      data.push(['Total GW:', inv.totalWt ? inv.totalWt.toFixed(2) : '']);
      data.push(['Total Cube:', inv.totalCube ? inv.totalCube.toFixed(2) : '']);

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, `PL_${inv.invNo}`);
    });

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Generate standard packing list Excel
   */
  private async generateStandardPackingListExcel(
    invoiceData: any[],
  ): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();

    invoiceData.forEach((inv) => {
      const data: any[][] = [];

      // Header
      data.push(['PACKING LIST']);
      data.push(['Invoice No:', inv.invNo]);
      data.push([
        'Date:',
        inv.date ? new Date(inv.date).toLocaleDateString() : '',
      ]);
      data.push(['Customer:', inv.customerName || '']);
      data.push([]);

      // Items
      data.push([
        'Item No',
        'Description',
        'Qty',
        'Cartons',
        'Qty/Ctn',
        'Net Wt',
        'Gross Wt',
        'Cube',
        'Ship Mark',
        'PO No',
        'Container No',
      ]);

      inv.items.forEach((item: any) => {
        data.push([
          item.itemNo,
          item.itemName || item.itemDescription || '',
          item.qty,
          item.ctn || '',
          item.qctn || '',
          item.net ? item.net.toFixed(2) : '',
          item.wt ? item.wt.toFixed(2) : '',
          item.cube ? item.cube.toFixed(2) : '',
          item.shipMark || '',
          item.poNo || '',
          item.cntrNo || '',
        ]);
      });

      data.push([]);
      data.push([
        'Totals:',
        '',
        inv.totalQty || 0,
        inv.totalCartons || 0,
        '',
        inv.totalNet ? inv.totalNet.toFixed(2) : '',
        inv.totalWt ? inv.totalWt.toFixed(2) : '',
        inv.totalCube ? inv.totalCube.toFixed(2) : '',
      ]);

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, `PL_${inv.invNo}`);
    });

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Generate shipment advice Excel
   */
  private async generateShipmentAdviceExcel(
    invoiceData: any[],
  ): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();

    invoiceData.forEach((inv) => {
      const data: any[][] = [];

      data.push(['SHIPMENT ADVICE']);
      data.push(['Invoice No:', inv.invNo]);
      data.push([
        'Date:',
        inv.date ? new Date(inv.date).toLocaleDateString() : '',
      ]);
      data.push(['Customer:', inv.customerName || '']);
      data.push(['Ship:', inv.ship || '']);
      data.push(['Loading:', inv.loading || '']);
      data.push(['Destination:', inv.dest || '']);
      data.push([]);

      data.push([
        'Item No',
        'Description',
        'Qty',
        'Cartons',
        'Ship Mark',
        'PO No',
      ]);

      inv.items.forEach((item: any) => {
        data.push([
          item.itemNo,
          item.itemName || item.itemDescription || '',
          item.qty,
          item.ctn || '',
          item.shipMark || '',
          item.poNo || '',
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, `SA_${inv.invNo}`);
    });

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Generate debit note Excel
   */
  private async generateDebitNoteExcel(invoiceData: any[]): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();

    invoiceData.forEach((inv) => {
      const data: any[][] = [];

      data.push(['DEBIT NOTE']);
      data.push(['Invoice No:', inv.invNo]);
      data.push([
        'Date:',
        inv.date ? new Date(inv.date).toLocaleDateString() : '',
      ]);
      data.push(['Customer:', inv.customerName || '']);
      data.push([]);

      data.push(['Item No', 'Description', 'Qty', 'Price', 'Amount']);

      inv.items.forEach((item: any) => {
        data.push([
          item.itemNo,
          item.itemName || item.itemDescription || '',
          item.qty,
          item.price ? item.price.toFixed(4) : '',
          item.amount ? item.amount.toFixed(2) : '',
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, `DN_${inv.invNo}`);
    });

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Generate invoice Excel
   */
  private async generateInvoiceExcel(invoiceData: any[]): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();

    invoiceData.forEach((inv) => {
      const data: any[][] = [];

      data.push(['INVOICE']);
      data.push(['Invoice No:', inv.invNo]);
      data.push([
        'Date:',
        inv.date ? new Date(inv.date).toLocaleDateString() : '',
      ]);
      data.push(['Customer:', inv.customerName || '']);
      data.push([]);

      data.push(['Item No', 'Description', 'Qty', 'Unit', 'Price', 'Amount']);

      inv.items.forEach((item: any) => {
        data.push([
          item.itemNo,
          item.itemName || item.itemDescription || '',
          item.qty,
          item.unit || '',
          item.price ? item.price.toFixed(4) : '',
          item.amount ? item.amount.toFixed(2) : '',
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, `INV_${inv.invNo}`);
    });

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Generate PDF file
   *
   * Original Logic Reference:
   * - Legacy Reports: REPORT FORM ... TO FILE
   * - Business Rules:
   *   - Format for printing
   *
   * Note: PDF generation will use a PDF library when added
   */
  private async generatePdf(
    invoiceData: any[],
    documentType: InvoiceDocumentType,
  ): Promise<Buffer> {
    // TODO: Implement proper PDF generation with pdfkit or similar library
    // For now, return a simple text representation
    let pdfContent = `${documentType.toUpperCase()} DOCUMENT\n`;
    pdfContent += '='.repeat(80) + '\n\n';

    invoiceData.forEach((inv, index) => {
      if (index > 0) {
        pdfContent += '\n' + '='.repeat(80) + '\n\n';
      }

      pdfContent += `Invoice Number: ${inv.invNo}\n`;
      pdfContent += `Date: ${inv.date ? new Date(inv.date).toLocaleDateString() : ''}\n`;
      pdfContent += `Customer: ${inv.customerName || ''}\n`;
      pdfContent += '\nItems:\n';
      pdfContent += '-'.repeat(80) + '\n';

      inv.items.forEach((item: any) => {
        pdfContent += `${item.itemNo} - ${item.itemName || item.itemDescription || ''} - Qty: ${item.qty}`;
        if (item.ctn) pdfContent += ` - Cartons: ${item.ctn}`;
        if (item.net) pdfContent += ` - Net Wt: ${item.net.toFixed(2)}`;
        if (item.wt) pdfContent += ` - Gross Wt: ${item.wt.toFixed(2)}`;
        pdfContent += '\n';
      });

      pdfContent += '\nTotals:\n';
      pdfContent += `Total Qty: ${inv.totalQty || 0}\n`;
      pdfContent += `Total Cartons: ${inv.totalCartons || 0}\n`;
      if (inv.totalNet)
        pdfContent += `Total Net Weight: ${inv.totalNet.toFixed(2)}\n`;
      if (inv.totalWt)
        pdfContent += `Total Gross Weight: ${inv.totalWt.toFixed(2)}\n`;
      if (inv.totalCube)
        pdfContent += `Total Cube: ${inv.totalCube.toFixed(2)}\n`;
    });

    return Buffer.from(pdfContent);
  }

  // Helper methods

  private extractFirstLine(memo?: string): string | undefined {
    if (!memo) return undefined;
    const lines = memo.split('\n');
    return lines[0]?.trim();
  }

  private calculateCube(l: number, w: number, h: number): string {
    // Convert mm to m³: (l * w * h) / 1,000,000
    const cube = (l * w * h) / 1000000;
    return cube.toFixed(4);
  }

  private calculateTotalDimCube(dimStr: string, ctn: number): string {
    // Extract cube value from dimension string (format: "l x w x h = cube")
    const match = dimStr.match(/=([\d.]+)/);
    if (match) {
      const cube = parseFloat(match[1]);
      return (cube * ctn).toFixed(2);
    }
    return '';
  }
}
