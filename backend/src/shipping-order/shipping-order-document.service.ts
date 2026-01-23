import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ShippingOrder } from './entities/shipping-order.entity';
import { SoFormat } from './entities/so-format.entity';
import { GenerateSoDocumentDto } from './dto/generate-so-document.dto';
import {
  SoDocumentPreviewResponseDto,
  SoDocumentGenerationResponseDto,
} from './dto/so-document-response.dto';
// Using xlsx library (already in package.json dependencies)
import * as XLSX from 'xlsx';

/**
 * Shipping Order Document Service
 *
 * Original Logic Reference:
 * - Legacy Form: pso (Print Shipping Order)
 * - Legacy Program: pso.prg, uwpso.prg
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - Generate SO documents from selected SO numbers
 *   - Apply customer-specific format from zsoformat
 *   - Support single or multiple SO printing
 *   - Include customer and forwarder addresses
 *   - Format items with ship marks and quantities
 *
 * Reference: Phase 3 - SO Document Generation
 */
@Injectable()
export class ShippingOrderDocumentService {
  constructor(
    @InjectRepository(ShippingOrder)
    private readonly shippingOrderRepository: Repository<ShippingOrder>,
    @InjectRepository(SoFormat)
    private readonly soFormatRepository: Repository<SoFormat>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Preview SO document data
   *
   * Returns preview data without generating file
   */
  async previewSoDocument(
    generateDto: GenerateSoDocumentDto,
  ): Promise<SoDocumentPreviewResponseDto> {
    // Load SO data
    const soData = await this.loadSoData(generateDto.soNos);

    if (soData.length === 0) {
      throw new NotFoundException(
        'No shipping orders found for the specified SO numbers',
      );
    }

    return {
      soNos: generateDto.soNos,
      formatKey: generateDto.formatKey,
      data: soData,
    };
  }

  /**
   * Generate SO document file
   *
   * Original Logic Reference:
   * - Legacy Form: pso (uwtable method)
   * - Business Rules:
   *   - Generate PDF or Excel file
   *   - Apply format customizations
   */
  async generateSoDocument(
    generateDto: GenerateSoDocumentDto,
  ): Promise<SoDocumentGenerationResponseDto> {
    const format = generateDto.outputFormat || 'pdf';

    // Load SO data
    const soData = await this.loadSoData(generateDto.soNos);

    if (soData.length === 0) {
      throw new NotFoundException(
        'No shipping orders found for the specified SO numbers',
      );
    }

    // Get format configuration if specified
    let formatConfig: any = null;
    if (generateDto.formatKey) {
      formatConfig = await this.getFormatConfig(generateDto.formatKey);
    }

    // Generate file based on format
    let fileName: string;
    let fileBuffer: Buffer;

    if (format === 'excel') {
      const excelData = await this.generateExcel(soData, formatConfig);
      fileName =
        generateDto.fileName ||
        `SO_${generateDto.soNos.join('_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      fileBuffer = excelData;
    } else if (format === 'pdf') {
      const pdfData = await this.generatePdf(soData);
      fileName =
        generateDto.fileName ||
        `SO_${generateDto.soNos.join('_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      fileBuffer = pdfData;
    } else {
      throw new BadRequestException(`Unsupported output format: ${format}`);
    }

    // TODO: Save file to storage and return URL
    // For now, return file info (actual file saving will be implemented with storage service)

    return {
      soNos: generateDto.soNos,
      formatKey: generateDto.formatKey,
      fileName,
      fileSize: fileBuffer.length,
      format: format as 'pdf' | 'excel' | 'html',
      generatedAt: new Date(),
      fileBuffer, // Include buffer for download
    };
  }

  /**
   * Load SO data for document generation
   *
   * Original Logic Reference:
   * - Legacy Form: pso (uwtable method)
   * - Business Rules:
   *   - Join SO with customer, item, OC data
   *   - Get company address from zpara
   *   - Group items by SO number
   */
  private async loadSoData(soNos: string[]): Promise<any[]> {
    const query = `
      SELECT DISTINCT
        so."soNo" as so_no,
        so."shipDate" as date,
        och.cust_no,
        c.ename as customer_name,
        c.addr1 as customer_addr1,
        c.addr2 as customer_addr2,
        c.addr3 as customer_addr3,
        c.addr4 as customer_addr4,
        -- Forwarder columns do not exist in Customer entity
        -- c.fc_ename as forwarder_name,
        -- c.fc_addr1 as forwarder_addr1,
        -- c.fc_addr2 as forwarder_addr2,
        -- c.fc_addr3 as forwarder_addr3,
        -- c.fc_addr4 as forwarder_addr4,
        so."shipDate" as ship_date,
        so."shipMark" as ship_mark,
        so."fobPort" as fob_port,
        so."poNo" as po_no,
        so."shipTo" as ship_to,
        so."loadingPort" as loading_port,
        so.dest,
        so.remarks
        -- OrderConfirmationHeader columns that don't exist in entity:
        -- och.vessel,
        -- och.disch as discharge,
        -- och.loading,
        -- och.delivery,
        -- och.fpay as payment_terms,
        -- och.bl,
        -- och.status,
        -- och.sdate,
        -- och.collect,
        -- och.amend,
        -- och.tel,
        -- och.fax,
        -- och.contact
      FROM shipping_order so
      LEFT JOIN order_confirmation_header och ON so."confNo" = och.conf_no
      LEFT JOIN customer c ON och.cust_no = c.cust_no
      WHERE so."soNo" = ANY($1)
      ORDER BY so."soNo", so."shipDate"
    `;

    const soHeaders = await this.dataSource.query(query, [soNos]);

    // Load SO items
    const itemsQuery = `
      SELECT
        so."soNo" as so_no,
        so."itemNo" as item_no,
        i.desp as item_description,
        so.qty,
        so.ctn,
        so."shipMark" as ship_mark,
        so."poNo" as po_no,
        so."shipTo" as ship_to,
        so."loadingPort" as loading_port,
        so.dest,
        so."fobPort" as fob_port
      FROM shipping_order so
      LEFT JOIN item i ON so."itemNo" = i.item_no
      WHERE so."soNo" = ANY($1)
      ORDER BY so."soNo", so."itemNo"
    `;

    const soItems = await this.dataSource.query(itemsQuery, [soNos]);

    // Group items by SO number
    const itemsBySo = soItems.reduce((acc: any, item: any) => {
      if (!acc[item.so_no]) {
        acc[item.so_no] = [];
      }
      acc[item.so_no].push({
        itemNo: item.item_no,
        itemDescription: item.item_description,
        qty: parseFloat(item.qty),
        ctn: item.ctn ? parseFloat(item.ctn) : undefined,
        shipMark: item.ship_mark,
        poNo: item.po_no,
        shipTo: item.ship_to,
        loadingPort: item.loading_port,
        dest: item.dest,
        fobPort: item.fob_port,
      });
      return acc;
    }, {});

    // Combine headers with items
    return soHeaders.map((header: any) => ({
      soNo: header.so_no,
      date: header.date,
      custNo: header.cust_no,
      customerName: header.customer_name,
      customerAddress: {
        addr1: header.customer_addr1,
        addr2: header.customer_addr2,
        addr3: header.customer_addr3,
        addr4: header.customer_addr4,
      },
      forwarderAddress: {
        addr1: header.forwarder_addr1,
        addr2: header.forwarder_addr2,
        addr3: header.forwarder_addr3,
        addr4: header.forwarder_addr4,
      },
      items: itemsBySo[header.so_no] || [],
      vessel: header.vessel,
      discharge: header.discharge,
      loading: header.loading,
      delivery: header.delivery,
      paymentTerms: header.payment_terms,
      bl: header.bl,
      status: header.status,
      shipDate: header.ship_date,
      collect: header.collect,
      amend: header.amend,
      tel: header.tel,
      fax: header.fax,
      contact: header.contact,
      remarks: header.remarks,
    }));
  }

  /**
   * Get format configuration from zsoformat
   *
   * Original Logic Reference:
   * - Legacy Form: isoformat (prreport method)
   * - Business Rules:
   *   - Load format by so_key
   *   - Return format elements with positions and styling
   */
  private async getFormatConfig(formatKey: string): Promise<any> {
    const formats = await this.soFormatRepository.find({
      where: { soKey: formatKey },
    });

    if (formats.length === 0) {
      return null; // Use default format
    }

    // Transform to format config object
    return formats.map((format) => ({
      uniqueid: format.uniqueid,
      fieldName: format.fieldName,
      name: format.name,
      expr: format.expr,
      vpos: format.vpos,
      hpos: format.hpos,
      height: format.height,
      width: format.width,
      fontface: format.fontface,
      fontstyle: format.fontstyle,
      fontsize: format.fontsize,
      print: format.print,
    }));
  }

  /**
   * Generate Excel file
   *
   * Original Logic Reference:
   * - Legacy Reports: Excel export functionality
   * - Business Rules:
   *   - Format columns appropriately
   *   - Include all SO data
   */
  private async generateExcel(
    soData: any[],
    _formatConfig: any,
  ): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();

    // Create a worksheet for each SO or combine into one
    if (soData.length === 1) {
      // Single SO - detailed format
      const ws = this.createSoExcelWorksheet(soData[0], _formatConfig);
      XLSX.utils.book_append_sheet(workbook, ws, 'Shipping Order');
    } else {
      // Multiple SOs - summary format
      const ws = this.createSoSummaryExcelWorksheet(soData);
      XLSX.utils.book_append_sheet(workbook, ws, 'Shipping Orders');
    }

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Create detailed SO Excel worksheet
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private createSoExcelWorksheet(so: any, _formatConfig: any): any {
    const data: any[][] = [];

    // Header section
    data.push(['SHIPPING ORDER']);
    data.push(['SO Number:', so.soNo]);
    data.push(['Date:', so.date ? new Date(so.date).toLocaleDateString() : '']);
    data.push([]);

    // Customer section
    if (so.customerName) {
      data.push(['Customer:', so.customerName]);
      if (so.customerAddress) {
        if (so.customerAddress.addr1) data.push(['', so.customerAddress.addr1]);
        if (so.customerAddress.addr2) data.push(['', so.customerAddress.addr2]);
        if (so.customerAddress.addr3) data.push(['', so.customerAddress.addr3]);
        if (so.customerAddress.addr4) data.push(['', so.customerAddress.addr4]);
      }
      data.push([]);
    }

    // Items section
    data.push(['Items:']);
    data.push([
      'Item No',
      'Description',
      'Qty',
      'Cartons',
      'Ship Mark',
      'PO No',
      'Ship To',
      'Loading Port',
      'Destination',
      'FOB Port',
    ]);

    so.items.forEach((item: any) => {
      data.push([
        item.itemNo,
        item.itemDescription || '',
        item.qty,
        item.ctn || '',
        item.shipMark || '',
        item.poNo || '',
        item.shipTo || '',
        item.loadingPort || '',
        item.dest || '',
        item.fobPort || '',
      ]);
    });

    data.push([]);

    // Additional details
    if (so.vessel) data.push(['Vessel:', so.vessel]);
    if (so.loading) data.push(['Loading:', so.loading]);
    if (so.discharge) data.push(['Discharge:', so.discharge]);
    if (so.delivery) data.push(['Delivery:', so.delivery]);
    if (so.paymentTerms) data.push(['Payment Terms:', so.paymentTerms]);
    if (so.shipDate)
      data.push(['Ship Date:', new Date(so.shipDate).toLocaleDateString()]);
    if (so.remarks) data.push(['Remarks:', so.remarks]);

    return XLSX.utils.aoa_to_sheet(data);
  }

  /**
   * Create summary Excel worksheet for multiple SOs
   */
  private createSoSummaryExcelWorksheet(soData: any[]): any {
    const data: any[][] = [];

    // Header row
    data.push([
      'SO No',
      'Date',
      'Customer',
      'Item No',
      'Description',
      'Qty',
      'Cartons',
      'Ship Mark',
      'PO No',
      'Ship Date',
    ]);

    // Data rows
    soData.forEach((so) => {
      if (so.items.length === 0) {
        data.push([
          so.soNo,
          so.date ? new Date(so.date).toLocaleDateString() : '',
          so.customerName || '',
          '',
          '',
          '',
          '',
          '',
          '',
          so.shipDate ? new Date(so.shipDate).toLocaleDateString() : '',
        ]);
      } else {
        so.items.forEach((item: any) => {
          data.push([
            so.soNo,
            so.date ? new Date(so.date).toLocaleDateString() : '',
            so.customerName || '',
            item.itemNo,
            item.itemDescription || '',
            item.qty,
            item.ctn || '',
            item.shipMark || '',
            item.poNo || '',
            so.shipDate ? new Date(so.shipDate).toLocaleDateString() : '',
          ]);
        });
      }
    });

    return XLSX.utils.aoa_to_sheet(data);
  }

  /**
   * Generate PDF file
   *
   * Original Logic Reference:
   * - Legacy Reports: REPORT FORM ... TO FILE
   * - Business Rules:
   *   - Format for printing
   *   - Apply format customizations
   *
   * Note: PDF generation will use a PDF library when added
   * For now, returning a simple text-based representation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async generatePdf(soData: any[]): Promise<Buffer> {
    // TODO: Implement proper PDF generation with pdfkit or similar library
    // For now, return a simple text representation
    let pdfContent = 'SHIPPING ORDER DOCUMENT\n';
    pdfContent += '='.repeat(80) + '\n\n';

    soData.forEach((so, index) => {
      if (index > 0) {
        pdfContent += '\n' + '='.repeat(80) + '\n\n';
      }

      pdfContent += `SO Number: ${so.soNo}\n`;
      pdfContent += `Date: ${so.date ? new Date(so.date).toLocaleDateString() : ''}\n`;
      pdfContent += `Customer: ${so.customerName || ''}\n`;

      if (so.customerAddress) {
        if (so.customerAddress.addr1)
          pdfContent += `Address: ${so.customerAddress.addr1}\n`;
        if (so.customerAddress.addr2)
          pdfContent += `         ${so.customerAddress.addr2}\n`;
        if (so.customerAddress.addr3)
          pdfContent += `         ${so.customerAddress.addr3}\n`;
        if (so.customerAddress.addr4)
          pdfContent += `         ${so.customerAddress.addr4}\n`;
      }

      pdfContent += '\nItems:\n';
      pdfContent += '-'.repeat(80) + '\n';
      pdfContent +=
        'Item No'.padEnd(15) +
        'Description'.padEnd(30) +
        'Qty'.padEnd(10) +
        'Cartons'.padEnd(10) +
        'Ship Mark\n';
      pdfContent += '-'.repeat(80) + '\n';

      so.items.forEach((item: any) => {
        pdfContent +=
          (item.itemNo || '').padEnd(15) +
          (item.itemDescription || '').substring(0, 28).padEnd(30) +
          (item.qty?.toString() || '').padEnd(10) +
          (item.ctn?.toString() || '').padEnd(10) +
          (item.shipMark || '') +
          '\n';
      });

      pdfContent += '\n';
      if (so.vessel) pdfContent += `Vessel: ${so.vessel}\n`;
      if (so.loading) pdfContent += `Loading: ${so.loading}\n`;
      if (so.discharge) pdfContent += `Discharge: ${so.discharge}\n`;
      if (so.shipDate)
        pdfContent += `Ship Date: ${new Date(so.shipDate).toLocaleDateString()}\n`;
      if (so.remarks) pdfContent += `Remarks: ${so.remarks}\n`;
    });

    return Buffer.from(pdfContent);
  }
}
