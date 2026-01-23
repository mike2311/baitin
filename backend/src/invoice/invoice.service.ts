import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InvoiceHeader } from './entities/invoice-header.entity';
import { InvoiceDetail } from './entities/invoice-detail.entity';
import {
  CreateInvoiceDto,
  CreateInvoiceFromSourceDto,
  SelectInvoiceItemsByContainerDto,
} from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  InvoiceSearchResponseDto,
  AvailableItemsForInvoiceResponseDto,
  ContainerRefSelectionResponseDto,
} from './dto/invoice-search-response.dto';
import { InvoiceValidationService } from './invoice-validation.service';

/**
 * Invoice Service
 *
 * Original Logic Reference:
 * - Legacy Forms: iinvhd@, iinvdt2@
 * - Documentation: docs/source/02-business-processes/invoice-process.md
 * - Business Rules:
 *   - Create invoice from SO or DN
 *   - Container/ref-driven item selection
 *   - Complex validation with override prompts
 *   - Multi-page invoice support
 *   - Packing list generation
 *
 * Reference: Phase 3 - Invoice Module
 */
@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceHeader)
    private readonly invoiceHeaderRepository: Repository<InvoiceHeader>,
    @InjectRepository(InvoiceDetail)
    private readonly invoiceDetailRepository: Repository<InvoiceDetail>,
    private readonly dataSource: DataSource,
    private readonly validationService: InvoiceValidationService,
  ) {}

  /**
   * Create an invoice
   *
   * Original Logic Reference:
   * - Legacy Form: iinvhd@ (manual entry)
   */
  async create(
    createDto: CreateInvoiceDto,
    userId?: string,
  ): Promise<InvoiceHeader> {
    // Validate invoice number uniqueness
    const existing = await this.invoiceHeaderRepository.findOne({
      where: { invNo: createDto.invNo },
    });
    if (existing) {
      throw new ConflictException(`Invoice ${createDto.invNo} already exists`);
    }

    // Validate date range if provided
    if (createDto.invDtFrDate || createDto.invDtToDate) {
      if (!createDto.invDtFrDate || !createDto.invDtToDate) {
        throw new BadRequestException(
          'Both invoice date from and to must be provided or both empty',
        );
      }
      if (new Date(createDto.invDtToDate) < new Date(createDto.invDtFrDate)) {
        throw new BadRequestException(
          'Invoice date to must be greater than or equal to invoice date from',
        );
      }
    }

    // Validate references if provided
    if (createDto.custNo) {
      await this.validateCustomerExists(createDto.custNo);
    }
    if (createDto.ocNo) {
      await this.validateOrderConfirmationExists(createDto.ocNo);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create header
      const header = queryRunner.manager.create(InvoiceHeader, {
        invNo: createDto.invNo,
        date: new Date(createDto.date),
        custNo: createDto.custNo,
        ocNo: createDto.ocNo,
        ship: createDto.ship,
        delDate: createDto.delDate ? new Date(createDto.delDate) : undefined,
        loadingPort: createDto.loadingPort,
        dest: createDto.dest,
        paymentTerms: createDto.paymentTerms,
        remarks: createDto.remarks,
        plStatus: 'Not Printed',
        plShStatus: 'Not Printed',
        creUser: userId || createDto.userId,
        userId: userId || createDto.userId,
      });

      const savedHeader = await queryRunner.manager.save(InvoiceHeader, header);

      // Create details if provided
      if (createDto.details && createDto.details.length > 0) {
        for (let i = 0; i < createDto.details.length; i++) {
          const detailDto = createDto.details[i];
          await this.validateItemExists(detailDto.itemNo);

          const detail = queryRunner.manager.create(InvoiceDetail, {
            invNo: savedHeader.invNo,
            itemNo: detailDto.itemNo,
            lineNo: i + 1,
            qty: detailDto.qty,
            price: detailDto.price,
            amount:
              detailDto.amount ||
              (detailDto.price ? detailDto.qty * detailDto.price : undefined),
            ctn: detailDto.ctn,
            qctn: detailDto.qctn,
            net: detailDto.net,
            wt: detailDto.wt,
            cube: detailDto.cube,
            dim: detailDto.dim,
            unit: detailDto.unit,
            despMemo: detailDto.despMemo,
            poNo: detailDto.poNo,
            shipNo: detailDto.shipNo,
            cntrNo: detailDto.cntrNo,
            refNo: detailDto.refNo,
            ocNo: detailDto.ocNo,
            confNo: detailDto.confNo,
            soNo: detailDto.soNo,
            head: detailDto.head !== undefined ? detailDto.head : true,
            creUser: userId || createDto.userId,
            userId: userId || createDto.userId,
          });

          await queryRunner.manager.save(InvoiceDetail, detail);
        }
      }

      await queryRunner.commitTransaction();
      return savedHeader;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create invoice from SO or DN
   *
   * Original Logic Reference:
   * - Legacy Form: iinvhd@ (create from SO/DN)
   */
  async createFromSource(
    createDto: CreateInvoiceFromSourceDto,
    userId?: string,
  ): Promise<InvoiceHeader> {
    // Validate invoice number uniqueness
    const existing = await this.invoiceHeaderRepository.findOne({
      where: { invNo: createDto.invNo },
    });
    if (existing) {
      throw new ConflictException(`Invoice ${createDto.invNo} already exists`);
    }

    // Get source items
    const sourceItems = await this.getSourceItems(
      createDto.sourceType,
      createDto.sourceNo,
    );
    if (sourceItems.length === 0) {
      throw new NotFoundException(
        `No items found in ${createDto.sourceType.toUpperCase()} ${createDto.sourceNo}`,
      );
    }

    // Filter selected items if provided
    const itemsToInclude =
      createDto.selectedItemNos && createDto.selectedItemNos.length > 0
        ? sourceItems.filter((item) =>
            createDto.selectedItemNos!.includes(item.item_no),
          )
        : sourceItems;

    if (itemsToInclude.length === 0) {
      throw new BadRequestException('No items selected for invoice');
    }

    // Get source header for customer info
    const sourceHeader = await this.getSourceHeader(
      createDto.sourceType,
      createDto.sourceNo,
    );
    if (!sourceHeader) {
      throw new NotFoundException(
        `${createDto.sourceType.toUpperCase()} ${createDto.sourceNo} not found`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create invoice header
      const header = queryRunner.manager.create(InvoiceHeader, {
        invNo: createDto.invNo,
        date: new Date(createDto.date),
        custNo: sourceHeader.cust_no,
        ocNo: sourceHeader.oc_no,
        ship: createDto.ship,
        delDate: createDto.delDate ? new Date(createDto.delDate) : undefined,
        loadingPort: createDto.loadingPort,
        dest: createDto.dest,
        plStatus: 'Not Printed',
        plShStatus: 'Not Printed',
        creUser: userId || createDto.userId,
        userId: userId || createDto.userId,
      });

      const savedHeader = await queryRunner.manager.save(InvoiceHeader, header);

      // Create invoice details from source items
      for (let i = 0; i < itemsToInclude.length; i++) {
        const sourceItem = itemsToInclude[i];

        const detail = queryRunner.manager.create(InvoiceDetail, {
          invNo: savedHeader.invNo,
          itemNo: sourceItem.item_no,
          lineNo: i + 1,
          qty: sourceItem.qty,
          price: sourceItem.price,
          amount: sourceItem.price
            ? sourceItem.qty * sourceItem.price
            : undefined,
          ctn: sourceItem.ctn,
          qctn: sourceItem.qctn,
          net: sourceItem.net,
          wt: sourceItem.wt,
          cube: sourceItem.cube,
          poNo: sourceItem.po_no,
          shipNo: sourceItem.ship_no,
          cntrNo: sourceItem.cntr_no,
          refNo: sourceItem.ref_no,
          ocNo: sourceItem.oc_no,
          confNo: sourceItem.conf_no,
          soNo:
            createDto.sourceType === 'so'
              ? createDto.sourceNo
              : sourceItem.so_no,
          head: true,
          creUser: userId || createDto.userId,
          userId: userId || createDto.userId,
        });

        await queryRunner.manager.save(InvoiceDetail, detail);

        // Get item description and OC data
        const itemData = await this.getItemAndOcData(
          sourceItem.item_no,
          sourceItem.conf_no,
        );
        if (itemData) {
          detail.despMemo = itemData.desc_memo;
          detail.price = itemData.price || detail.price;
          await queryRunner.manager.save(InvoiceDetail, detail);
        }
      }

      await queryRunner.commitTransaction();
      return savedHeader;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get available items for invoice creation from SO or DN
   *
   * Original Logic Reference:
   * - Legacy Form: iinvdt2@ (getitemno method)
   */
  async getAvailableItemsForInvoice(
    sourceType: 'so' | 'dn',
    sourceNo: string,
    cntrNo?: string,
    refNo?: string,
  ): Promise<AvailableItemsForInvoiceResponseDto[]> {
    let query: string;
    let parameters: any[];

    if (sourceType === 'so') {
      query = `
        SELECT
          'so' as source_type,
          so."soNo" as source_no,
          so."itemNo" as item_no,
          i.desp as item_description,
          so.qty as source_qty,
          COALESCE(SUM(invd.qty), 0) as invoiced_qty,
          (so.qty - COALESCE(SUM(invd.qty), 0)) as remaining_qty,
          so.ctn,
          so."poNo" as po_no,
          so."shipNo" as ship_no,
          so."cntrNo" as cntr_no,
          so."refNo" as ref_no,
          so."ocNo" as oc_no,
          so."confNo" as conf_no,
          so."soNo" as so_no,
          c.ename as customer_name
        FROM shipping_order so
        LEFT JOIN invoice_detail invd ON so."soNo" = invd."soNo" AND so."itemNo" = invd."itemNo"
        LEFT JOIN item i ON so."itemNo" = i.item_no
        LEFT JOIN order_confirmation_header och ON so."confNo" = och.conf_no
        LEFT JOIN customer c ON och.cust_no = c.cust_no
        WHERE so."soNo" = $1
        ${cntrNo ? 'AND so."cntrNo" = $2' : ''}
        ${refNo ? `AND so."refNo" = $${cntrNo ? '3' : '2'}` : ''}
        GROUP BY so."soNo", so."itemNo", i.desp, so.qty, so.ctn, so."poNo", so."shipNo", so."cntrNo", so."refNo", so."ocNo", so."confNo", c.ename
        HAVING (so.qty - COALESCE(SUM(invd.qty), 0)) > 0
      `;
      parameters = [sourceNo];
      if (cntrNo) parameters.push(cntrNo);
      if (refNo) parameters.push(refNo);
    } else {
      query = `
        SELECT
          'dn' as source_type,
          dn.dn_no as source_no,
          dnd.item_no,
          i.desp as item_description,
          dnd.qty as source_qty,
          COALESCE(SUM(invd.qty), 0) as invoiced_qty,
          (dnd.qty - COALESCE(SUM(invd.qty), 0)) as remaining_qty,
          dnd.ctn,
          dnd.po_no,
          dnd.ship_no,
          dnd.cntr_no,
          dnd.ref_no,
          dnd.oc_no,
          dnd.conf_no,
          dn.so_no,
          c.ename as customer_name
        FROM delivery_note_detail dnd
        JOIN delivery_note_header dn ON dnd.dn_no = dn.dn_no
        LEFT JOIN invoice_detail invd ON dnd.dn_no = invd.so_no AND dnd.item_no = invd.item_no
        LEFT JOIN item i ON dnd.item_no = i.item_no
        LEFT JOIN customer c ON dn.cust_no = c.cust_no
        WHERE dn.dn_no = $1
        ${cntrNo ? 'AND dnd.cntr_no = $2' : ''}
        ${refNo ? `AND dnd.ref_no = ${cntrNo ? '$3' : '$2'}` : ''}
        GROUP BY dn.dn_no, dnd.item_no, i.desp, dnd.qty, dnd.ctn, dnd.po_no, dnd.ship_no, dnd.cntr_no, dnd.ref_no, dnd.oc_no, dnd.conf_no, dn.so_no, c.ename
        HAVING (dnd.qty - COALESCE(SUM(invd.qty), 0)) > 0
      `;
      parameters = [sourceNo];
      if (cntrNo) parameters.push(cntrNo);
      if (refNo) parameters.push(refNo);
    }

    const results = await this.dataSource.query(query, parameters);
    return results.map((row) => ({
      sourceType: row.source_type,
      sourceNo: row.source_no,
      itemNo: row.item_no,
      itemDescription: row.item_description,
      sourceQty: parseFloat(row.source_qty),
      invoicedQty: parseFloat(row.invoiced_qty),
      remainingQty: parseFloat(row.remaining_qty),
      ctn: row.ctn ? parseFloat(row.ctn) : undefined,
      poNo: row.po_no,
      shipNo: row.ship_no,
      cntrNo: row.cntr_no,
      refNo: row.ref_no,
      ocNo: row.oc_no,
      confNo: row.conf_no,
      soNo: row.so_no,
      customerName: row.customer_name,
    }));
  }

  /**
   * Get container/ref selection options
   *
   * Original Logic Reference:
   * - Legacy Form: iinvdt2@ (getcntrno method)
   */
  async getContainerRefSelection(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _invNo: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _invDtFrDate?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _invDtToDate?: string,
  ): Promise<ContainerRefSelectionResponseDto[]> {
    // This would query available containers/refs from SO/DN based on invoice date range
    // For now, return empty array - will be implemented with full container logic
    return [];
  }

  /**
   * Select invoice items by container/ref
   *
   * Original Logic Reference:
   * - Legacy Form: iinvdt2@ (container selection workflow)
   * - Business Rules:
   *   - Complex container/ref matching logic
   *   - Date range filtering
   *   - Item selection and validation
   */
  async selectItemsByContainer(
    selectDto: SelectInvoiceItemsByContainerDto,
    userId?: string,
  ): Promise<InvoiceDetail[]> {
    const header = await this.invoiceHeaderRepository.findOne({
      where: { invNo: selectDto.invNo },
    });
    if (!header) {
      throw new NotFoundException(`Invoice ${selectDto.invNo} not found`);
    }

    // Get available items filtered by container/ref
    const availableItems = await this.getAvailableItemsForInvoice(
      'so', // Default to SO - can be extended
      '', // Will need source number from header
      selectDto.cntrNo,
      selectDto.refNo,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdDetails: InvoiceDetail[] = [];

      // Filter by selected items if provided
      const itemsToInclude =
        selectDto.selectedItemNos && selectDto.selectedItemNos.length > 0
          ? availableItems.filter((item) =>
              selectDto.selectedItemNos!.includes(item.itemNo),
            )
          : availableItems;

      // Get current max line number
      const maxLineResult = await queryRunner.manager.query(
        'SELECT COALESCE(MAX(line_no), 0) as max_line FROM invoice_detail WHERE inv_no = $1',
        [selectDto.invNo],
      );
      let lineNo = (maxLineResult[0]?.max_line || 0) + 1;

      // Create invoice details
      for (const item of itemsToInclude) {
        const detail = queryRunner.manager.create(InvoiceDetail, {
          invNo: header.invNo,
          itemNo: item.itemNo,
          lineNo: lineNo++,
          qty: item.remainingQty,
          ctn: item.ctn,
          poNo: item.poNo,
          shipNo: item.shipNo,
          cntrNo: item.cntrNo,
          refNo: item.refNo,
          ocNo: item.ocNo,
          confNo: item.confNo,
          soNo: item.soNo,
          head: true,
          creUser: userId,
          userId: userId,
        });

        const savedDetail = await queryRunner.manager.save(
          InvoiceDetail,
          detail,
        );
        createdDetails.push(savedDetail);
      }

      await queryRunner.commitTransaction();
      return createdDetails;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find invoice by invoice number
   */
  async findOne(invNo: string): Promise<InvoiceHeader> {
    const header = await this.invoiceHeaderRepository.findOne({
      where: { invNo },
      relations: ['details'],
    });

    if (!header) {
      throw new NotFoundException(`Invoice ${invNo} not found`);
    }

    return header;
  }

  /**
   * Update invoice
   */
  async update(
    invNo: string,
    updateDto: UpdateInvoiceDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId?: string,
  ): Promise<InvoiceHeader> {
    const header = await this.findOne(invNo);

    // Validate date range if being updated
    if (updateDto.invDtFrDate || updateDto.invDtToDate) {
      if (!updateDto.invDtFrDate || !updateDto.invDtToDate) {
        throw new BadRequestException(
          'Both invoice date from and to must be provided or both empty',
        );
      }
      if (new Date(updateDto.invDtToDate) < new Date(updateDto.invDtFrDate)) {
        throw new BadRequestException(
          'Invoice date to must be greater than or equal to invoice date from',
        );
      }
    }

    // Validate references if being updated
    if (updateDto.custNo) {
      await this.validateCustomerExists(updateDto.custNo);
    }
    if (updateDto.ocNo) {
      await this.validateOrderConfirmationExists(updateDto.ocNo);
    }

    // Update header fields
    if (updateDto.date) header.date = new Date(updateDto.date);
    if (updateDto.custNo !== undefined) header.custNo = updateDto.custNo;
    if (updateDto.ocNo !== undefined) header.ocNo = updateDto.ocNo;
    if (updateDto.ship !== undefined) header.ship = updateDto.ship;
    if (updateDto.delDate) header.delDate = new Date(updateDto.delDate);
    if (updateDto.loadingPort !== undefined)
      header.loadingPort = updateDto.loadingPort;
    if (updateDto.dest !== undefined) header.dest = updateDto.dest;
    if (updateDto.paymentTerms !== undefined)
      header.paymentTerms = updateDto.paymentTerms;
    if (updateDto.remarks !== undefined) header.remarks = updateDto.remarks;
    header.modDate = new Date();

    return this.invoiceHeaderRepository.save(header);
  }

  /**
   * Delete invoice
   */
  async remove(invNo: string): Promise<void> {
    const header = await this.findOne(invNo);
    await this.invoiceHeaderRepository.remove(header);
  }

  /**
   * Search invoices
   */
  async search(query?: {
    invNo?: string;
    custNo?: string;
    ocNo?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<InvoiceSearchResponseDto[]> {
    const qb = this.invoiceHeaderRepository
      .createQueryBuilder('inv')
      .leftJoin('customer', 'c', 'inv.custNo = c.custNo')
      .leftJoin('invoice_detail', 'invd', 'inv.invNo = invd.invNo')
      .select([
        'inv.invNo',
        'inv.date',
        'inv.custNo',
        'c.ename as customerName',
        'inv.ocNo',
        'inv.ship',
        'inv.delDate',
        'inv.plStatus',
        'inv.plShStatus',
        'inv.creUser',
        'inv.creDate',
        'inv.modDate',
      ])
      .addSelect('COUNT(DISTINCT invd.itemNo)', 'itemCount')
      .addSelect('COALESCE(SUM(invd.amount), 0)', 'totalAmount')
      .groupBy(
        'inv.invNo, inv.date, inv.custNo, c.ename, inv.ocNo, inv.ship, inv.delDate, inv.plStatus, inv.plShStatus, inv.creUser, inv.creDate, inv.modDate',
      );

    if (query?.invNo) {
      qb.andWhere('inv.invNo ILIKE :invNo', { invNo: `%${query.invNo}%` });
    }
    if (query?.custNo) {
      qb.andWhere('inv.custNo = :custNo', { custNo: query.custNo });
    }
    if (query?.ocNo) {
      qb.andWhere('inv.ocNo = :ocNo', { ocNo: query.ocNo });
    }
    if (query?.dateFrom) {
      qb.andWhere('inv.date >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query?.dateTo) {
      qb.andWhere('inv.date <= :dateTo', { dateTo: query.dateTo });
    }

    const results = await qb.getRawMany();
    return results.map((row) => ({
      invNo: row.inv_invNo,
      date: row.inv_date,
      custNo: row.inv_custNo,
      customerName: row.customerName,
      ocNo: row.inv_ocNo,
      ship: row.inv_ship,
      delDate: row.inv_delDate,
      itemCount: parseInt(row.itemCount) || 0,
      totalAmount: parseFloat(row.totalAmount) || 0,
      plStatus: row.inv_plStatus,
      plShStatus: row.inv_plShStatus,
      creUser: row.inv_creUser,
      creDate: row.inv_creDate,
      modDate: row.inv_modDate,
    }));
  }

  // Private helper methods

  private async getSourceItems(
    sourceType: 'so' | 'dn',
    sourceNo: string,
  ): Promise<any[]> {
    if (sourceType === 'so') {
      const query = `
        SELECT
          so."itemNo" as item_no,
          so.qty,
          so.ctn,
          so."poNo" as po_no,
          so."shipNo" as ship_no,
          so."cntrNo" as cntr_no,
          so."refNo" as ref_no,
          so."ocNo" as oc_no,
          so."confNo" as conf_no,
          NULL as price,
          NULL as net,
          NULL as wt,
          NULL as cube
        FROM shipping_order so
        WHERE so."soNo" = $1
      `;
      return this.dataSource.query(query, [sourceNo]);
    } else {
      const query = `
        SELECT
          dnd."itemNo" as item_no,
          dnd.qty,
          dnd.ctn,
          dnd."poNo" as po_no,
          dnd."shipNo" as ship_no,
          dnd."cntrNo" as cntr_no,
          dnd."refNo" as ref_no,
          dnd."ocNo" as oc_no,
          dnd."confNo" as conf_no,
          dn."soNo" as so_no,
          NULL as price,
          NULL as net,
          NULL as wt,
          NULL as cube
        FROM delivery_note_detail dnd
        JOIN delivery_note_header dn ON dnd."dnNo" = dn."dnNo"
        WHERE dn."dnNo" = $1
      `;
      return this.dataSource.query(query, [sourceNo]);
    }
  }

  private async getSourceHeader(
    sourceType: 'so' | 'dn',
    sourceNo: string,
  ): Promise<any> {
    if (sourceType === 'so') {
      const query = `
        SELECT DISTINCT
          och.cust_no,
          och.conf_no as oc_no
        FROM shipping_order so
        LEFT JOIN order_confirmation_header och ON so.conf_no = och.conf_no
        WHERE so.so_no = $1
        LIMIT 1
      `;
      const results = await this.dataSource.query(query, [sourceNo]);
      return results[0];
    } else {
      const query = `
        SELECT
          "custNo" as cust_no,
          NULL as oc_no
        FROM delivery_note_header
        WHERE "dnNo" = $1
      `;
      const results = await this.dataSource.query(query, [sourceNo]);
      return results[0];
    }
  }

  private async getItemAndOcData(
    itemNo: string,
    confNo?: string,
  ): Promise<any> {
    if (!confNo) return null;

    const query = `
      SELECT
        morddt.price,
        morddt.desc_memo
      FROM order_confirmation_detail morddt
      WHERE morddt.conf_no = $1 AND morddt.item_no = $2
      LIMIT 1
    `;
    const results = await this.dataSource.query(query, [confNo, itemNo]);
    return results[0];
  }

  private async validateCustomerExists(custNo: string): Promise<void> {
    const result = await this.dataSource.query(
      'SELECT 1 FROM customer WHERE cust_no = $1',
      [custNo],
    );
    if (result.length === 0) {
      throw new NotFoundException(`Customer ${custNo} not found`);
    }
  }

  private async validateOrderConfirmationExists(ocNo: string): Promise<void> {
    const result = await this.dataSource.query(
      'SELECT 1 FROM order_confirmation_header WHERE conf_no = $1',
      [ocNo],
    );
    if (result.length === 0) {
      throw new NotFoundException(`Order Confirmation ${ocNo} not found`);
    }
  }

  private async validateItemExists(itemNo: string): Promise<void> {
    const result = await this.dataSource.query(
      'SELECT 1 FROM item WHERE item_no = $1',
      [itemNo],
    );
    if (result.length === 0) {
      throw new NotFoundException(`Item ${itemNo} not found`);
    }
  }
}
