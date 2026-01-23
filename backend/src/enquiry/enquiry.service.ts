import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  SalesAnalysisQuery,
  ItemEnquiryQuery,
  SoEnquiryQuery,
  DnEnquiryQuery,
  InvoiceEnquiryQuery,
} from './entities/enquiry-query.entity';
import {
  SalesAnalysisResponseDto,
  ItemEnquiryResponseDto,
  SoEnquiryResponseDto,
  DnEnquiryResponseDto,
  InvoiceEnquiryResponseDto,
} from './dto/enquiry-response.dto';

/**
 * Enquiry Service
 *
 * Original Logic Reference:
 * - Legacy Forms: Various enquiry forms (40+ enquiry forms)
 * - Documentation: docs/source/04-forms-and-screens/enquiry-forms.md
 * - Business Rules:
 *   - Read-only queries over transaction tables
 *   - Various filters and aggregations
 *   - Sales analysis calculations
 *
 * Reference: Phase 3 - Enquiry Module
 */
@Injectable()
export class EnquiryService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Sales Analysis Enquiry
   *
   * Original Logic Reference:
   * - Legacy Forms: Sales analysis enquiry forms
   * - Business Rules:
   *   - Aggregate sales by customer, item, or date
   *   - Calculate totals and counts
   */
  async salesAnalysis(
    query: SalesAnalysisQuery,
  ): Promise<SalesAnalysisResponseDto[]> {
    let sqlQuery: string;
    const parameters: any[] = [];
    let paramIndex = 1;

    if (query.groupBy === 'customer') {
      sqlQuery = `
        SELECT
          inv."custNo" as cust_no,
          c.ename as customer_name,
          COUNT(DISTINCT inv."invNo") as invoice_count,
          COUNT(DISTINCT invd."soNo") as so_count,
          COALESCE(SUM(invd.qty), 0) as total_qty,
          COALESCE(SUM(invd.amount), 0) as total_amount
        FROM invoice_header inv
        LEFT JOIN invoice_detail invd ON inv."invNo" = invd."invNo"
        LEFT JOIN customer c ON inv."custNo" = c.cust_no
        WHERE 1=1
      `;
    } else if (query.groupBy === 'item') {
      sqlQuery = `
        SELECT
          invd."itemNo" as item_no,
          i.desp as item_description,
          COUNT(DISTINCT inv."invNo") as invoice_count,
          COUNT(DISTINCT invd."soNo") as so_count,
          COALESCE(SUM(invd.qty), 0) as total_qty,
          COALESCE(SUM(invd.amount), 0) as total_amount
        FROM invoice_detail invd
        JOIN invoice_header inv ON invd."invNo" = inv."invNo"
        LEFT JOIN item i ON invd."itemNo" = i.item_no
        WHERE 1=1
      `;
    } else {
      // Group by date
      sqlQuery = `
        SELECT
          inv.date,
          COUNT(DISTINCT inv."invNo") as invoice_count,
          COUNT(DISTINCT invd."soNo") as so_count,
          COALESCE(SUM(invd.qty), 0) as total_qty,
          COALESCE(SUM(invd.amount), 0) as total_amount
        FROM invoice_header inv
        LEFT JOIN invoice_detail invd ON inv."invNo" = invd."invNo"
        WHERE 1=1
      `;
    }

    if (query.custNo) {
      sqlQuery += ` AND inv."custNo" = $${paramIndex++}`;
      parameters.push(query.custNo);
    }
    if (query.itemNo) {
      sqlQuery += ` AND invd."itemNo" = $${paramIndex++}`;
      parameters.push(query.itemNo);
    }
    if (query.dateFrom) {
      sqlQuery += ` AND inv.date >= $${paramIndex++}`;
      parameters.push(query.dateFrom);
    }
    if (query.dateTo) {
      sqlQuery += ` AND inv.date <= $${paramIndex++}`;
      parameters.push(query.dateTo);
    }

    sqlQuery += ` GROUP BY `;
    if (query.groupBy === 'customer') {
      sqlQuery += `inv."custNo", c.ename`;
    } else if (query.groupBy === 'item') {
      sqlQuery += `invd."itemNo", i.desp`;
    } else {
      sqlQuery += `inv.date`;
    }

    sqlQuery += ` ORDER BY total_amount DESC`;

    const results = await this.dataSource.query(sqlQuery, parameters);
    return results.map((row) => ({
      custNo: row.cust_no,
      customerName: row.customer_name,
      itemNo: row.item_no,
      itemDescription: row.item_description,
      date: row.date,
      totalQty: parseFloat(row.total_qty) || 0,
      totalAmount: parseFloat(row.total_amount) || 0,
      invoiceCount: parseInt(row.invoice_count) || 0,
      soCount: parseInt(row.so_count) || 0,
    }));
  }

  /**
   * Item Enquiry
   *
   * Original Logic Reference:
   * - Legacy Forms: Item enquiry forms
   * - Business Rules:
   *   - Item details with order/invoice history
   */
  async itemEnquiry(
    query: ItemEnquiryQuery,
  ): Promise<ItemEnquiryResponseDto[]> {
    let sqlQuery = `
      SELECT
        i.item_no,
        i.desp as item_description,
        i.std_code,
        i.origin,
        i.price,
        i.cost,
        COALESCE(SUM(oe.qty), 0) as total_ordered_qty,
        COALESCE(SUM(oc.qty), 0) as total_confirmed_qty,
        COALESCE(SUM(so.qty), 0) as total_shipped_qty,
        COALESCE(SUM(invd.qty), 0) as total_invoiced_qty,
        MAX(oeh.oe_date) as last_order_date,
        MAX(inv.date) as last_invoice_date
      FROM item i
      LEFT JOIN order_enquiry_detail oe ON i.item_no = oe.item_no
      LEFT JOIN order_enquiry_header oeh ON oe.oe_no = oeh.oe_no
      LEFT JOIN order_confirmation_detail oc ON i.item_no = oc.item_no
      LEFT JOIN shipping_order so ON i.item_no = so."itemNo"
      LEFT JOIN invoice_detail invd ON i.item_no = invd."itemNo"
      LEFT JOIN invoice_header inv ON invd."invNo" = inv."invNo"
      WHERE 1=1
    `;
    const parameters: any[] = [];
    let paramIndex = 1;

    if (query.itemNo) {
      sqlQuery += ` AND i.item_no ILIKE $${paramIndex++}`;
      parameters.push(`%${query.itemNo}%`);
    }
    if (query.itemDescription) {
      sqlQuery += ` AND i.desp ILIKE $${paramIndex++}`;
      parameters.push(`%${query.itemDescription}%`);
    }

    sqlQuery += ` GROUP BY i.item_no, i.desp, i.std_code, i.origin, i.price, i.cost`;
    sqlQuery += ` ORDER BY i.item_no`;

    const results = await this.dataSource.query(sqlQuery, parameters);
    return results.map((row) => ({
      itemNo: row.item_no,
      itemDescription: row.item_description,
      stdCode: row.std_code,
      origin: row.origin,
      price: row.price ? parseFloat(row.price) : undefined,
      cost: row.cost ? parseFloat(row.cost) : undefined,
      totalOrderedQty: parseFloat(row.total_ordered_qty) || 0,
      totalConfirmedQty: parseFloat(row.total_confirmed_qty) || 0,
      totalShippedQty: parseFloat(row.total_shipped_qty) || 0,
      totalInvoicedQty: parseFloat(row.total_invoiced_qty) || 0,
      lastOrderDate: row.last_order_date,
      lastInvoiceDate: row.last_invoice_date,
    }));
  }

  /**
   * SO Enquiry
   *
   * Original Logic Reference:
   * - Legacy Forms: SO enquiry forms
   */
  async soEnquiry(query: SoEnquiryQuery): Promise<SoEnquiryResponseDto[]> {
    let sqlQuery = `
      SELECT
        so."soNo" as so_no,
        so."confNo" as conf_no,
        so."contNo" as cont_no,
        so."itemNo" as item_no,
        i.desp as item_description,
        so.qty,
        so.ctn,
        so."shipDate" as ship_date,
        c.ename as customer_name,
        so."creDate" as cre_date
      FROM shipping_order so
      LEFT JOIN item i ON so."itemNo" = i.item_no
      LEFT JOIN order_confirmation_header och ON so."confNo" = och.conf_no
      LEFT JOIN customer c ON och.cust_no = c.cust_no
      WHERE 1=1
    `;
    const parameters: any[] = [];
    let paramIndex = 1;

    if (query.soNo) {
      sqlQuery += ` AND so."soNo" ILIKE $${paramIndex++}`;
      parameters.push(`%${query.soNo}%`);
    }
    if (query.custNo) {
      sqlQuery += ` AND och.cust_no = $${paramIndex++}`;
      parameters.push(query.custNo);
    }
    if (query.itemNo) {
      sqlQuery += ` AND so."itemNo" ILIKE $${paramIndex++}`;
      parameters.push(`%${query.itemNo}%`);
    }
    if (query.dateFrom) {
      sqlQuery += ` AND so."shipDate" >= $${paramIndex++}`;
      parameters.push(query.dateFrom);
    }
    if (query.dateTo) {
      sqlQuery += ` AND so."shipDate" <= $${paramIndex++}`;
      parameters.push(query.dateTo);
    }

    sqlQuery += ` ORDER BY so."soNo", so."itemNo"`;

    const results = await this.dataSource.query(sqlQuery, parameters);
    return results.map((row) => ({
      soNo: row.so_no,
      confNo: row.conf_no,
      contNo: row.cont_no,
      itemNo: row.item_no,
      itemDescription: row.item_description,
      qty: parseFloat(row.qty),
      ctn: row.ctn ? parseFloat(row.ctn) : undefined,
      shipDate: row.ship_date,
      customerName: row.customer_name,
      creDate: row.cre_date,
    }));
  }

  /**
   * DN Enquiry
   *
   * Original Logic Reference:
   * - Legacy Forms: DN enquiry forms
   */
  async dnEnquiry(query: DnEnquiryQuery): Promise<DnEnquiryResponseDto[]> {
    let sqlQuery = `
      SELECT
        dn."dnNo" as dn_no,
        dn.date,
        dn."custNo" as cust_no,
        c.ename as customer_name,
        dn."soNo" as so_no,
        COUNT(DISTINCT dnd."itemNo") as item_count,
        COALESCE(SUM(dnd.qty), 0) as total_qty,
        dn."loadingStatus" as loading_status,
        dn."loadingNo" as loading_no,
        dn."creDate" as cre_date
      FROM delivery_note_header dn
      LEFT JOIN customer c ON dn."custNo" = c.cust_no
      LEFT JOIN delivery_note_detail dnd ON dn."dnNo" = dnd."dnNo"
      WHERE 1=1
    `;
    const parameters: any[] = [];
    let paramIndex = 1;

    if (query.dnNo) {
      sqlQuery += ` AND dn."dnNo" ILIKE $${paramIndex++}`;
      parameters.push(`%${query.dnNo}%`);
    }
    if (query.custNo) {
      sqlQuery += ` AND dn."custNo" = $${paramIndex++}`;
      parameters.push(query.custNo);
    }
    if (query.soNo) {
      sqlQuery += ` AND dn."soNo" = $${paramIndex++}`;
      parameters.push(query.soNo);
    }
    if (query.dateFrom) {
      sqlQuery += ` AND dn.date >= $${paramIndex++}`;
      parameters.push(query.dateFrom);
    }
    if (query.dateTo) {
      sqlQuery += ` AND dn.date <= $${paramIndex++}`;
      parameters.push(query.dateTo);
    }
    if (query.loadingStatus) {
      sqlQuery += ` AND dn."loadingStatus" = $${paramIndex++}`;
      parameters.push(query.loadingStatus);
    }

    sqlQuery += ` GROUP BY dn."dnNo", dn.date, dn."custNo", c.ename, dn."soNo", dn."loadingStatus", dn."loadingNo", dn."creDate"`;
    sqlQuery += ` ORDER BY dn.date DESC, dn."dnNo"`;

    const results = await this.dataSource.query(sqlQuery, parameters);
    return results.map((row) => ({
      dnNo: row.dn_no,
      date: row.date,
      custNo: row.cust_no,
      customerName: row.customer_name,
      soNo: row.so_no,
      itemCount: parseInt(row.item_count) || 0,
      totalQty: parseFloat(row.total_qty) || 0,
      loadingStatus: row.loading_status,
      loadingNo: row.loading_no,
      creDate: row.cre_date,
    }));
  }

  /**
   * Invoice Enquiry
   *
   * Original Logic Reference:
   * - Legacy Form: einvoice
   */
  async invoiceEnquiry(
    query: InvoiceEnquiryQuery,
  ): Promise<InvoiceEnquiryResponseDto[]> {
    let sqlQuery = `
      SELECT
        inv."invNo" as inv_no,
        inv.date,
        inv."custNo" as cust_no,
        c.ename as customer_name,
        inv."ocNo" as oc_no,
        COUNT(DISTINCT invd."itemNo") as item_count,
        COALESCE(SUM(invd.amount), 0) as total_amount,
        inv."plStatus" as pl_status,
        inv."creDate" as cre_date
      FROM invoice_header inv
      LEFT JOIN customer c ON inv."custNo" = c.cust_no
      LEFT JOIN invoice_detail invd ON inv."invNo" = invd."invNo"
      WHERE 1=1
    `;
    const parameters: any[] = [];
    let paramIndex = 1;

    if (query.invNo) {
      sqlQuery += ` AND inv."invNo" ILIKE $${paramIndex++}`;
      parameters.push(`%${query.invNo}%`);
    }
    if (query.custNo) {
      sqlQuery += ` AND inv."custNo" = $${paramIndex++}`;
      parameters.push(query.custNo);
    }
    if (query.ocNo) {
      sqlQuery += ` AND inv."ocNo" = $${paramIndex++}`;
      parameters.push(query.ocNo);
    }
    if (query.dateFrom) {
      sqlQuery += ` AND inv.date >= $${paramIndex++}`;
      parameters.push(query.dateFrom);
    }
    if (query.dateTo) {
      sqlQuery += ` AND inv.date <= $${paramIndex++}`;
      parameters.push(query.dateTo);
    }

    sqlQuery += ` GROUP BY inv."invNo", inv.date, inv."custNo", c.ename, inv."ocNo", inv."plStatus", inv."creDate"`;
    sqlQuery += ` ORDER BY inv.date DESC, inv."invNo"`;

    const results = await this.dataSource.query(sqlQuery, parameters);
    return results.map((row) => ({
      invNo: row.inv_no,
      date: row.date,
      custNo: row.cust_no,
      customerName: row.customer_name,
      ocNo: row.oc_no,
      itemCount: parseInt(row.item_count) || 0,
      totalAmount: parseFloat(row.total_amount) || 0,
      plStatus: row.pl_status,
      creDate: row.cre_date,
    }));
  }
}
