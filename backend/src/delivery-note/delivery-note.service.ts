import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DeliveryNoteHeader } from './entities/delivery-note-header.entity';
import { DeliveryNoteDetail } from './entities/delivery-note-detail.entity';
import { DeliveryNoteBreakdown } from './entities/delivery-note-breakdown.entity';
import { CreateDeliveryNoteDto, CreateDeliveryNoteFromSoDto } from './dto/create-delivery-note.dto';
import { UpdateDeliveryNoteDto } from './dto/update-delivery-note.dto';
import { DeliveryNoteSearchResponseDto, AvailableItemsForDnResponseDto } from './dto/delivery-note-search-response.dto';

/**
 * Delivery Note Service
 *
 * Original Logic Reference:
 * - Legacy Forms: idn, idnbrk
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Create DN from SO
 *   - Copy breakdowns from OE if available
 *   - Support loading coordination
 *   - Status transitions: Created → Loading → Shipped → Delivered → Invoiced
 *
 * Reference: Phase 3 - Delivery Note Module
 */
@Injectable()
export class DeliveryNoteService {
  constructor(
    @InjectRepository(DeliveryNoteHeader)
    private readonly dnHeaderRepository: Repository<DeliveryNoteHeader>,
    @InjectRepository(DeliveryNoteDetail)
    private readonly dnDetailRepository: Repository<DeliveryNoteDetail>,
    @InjectRepository(DeliveryNoteBreakdown)
    private readonly dnBreakdownRepository: Repository<DeliveryNoteBreakdown>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a delivery note
   *
   * Original Logic Reference:
   * - Legacy Form: idn (manual entry)
   */
  async create(createDto: CreateDeliveryNoteDto, userId?: string): Promise<DeliveryNoteHeader> {
    // Validate DN number uniqueness
    const existing = await this.dnHeaderRepository.findOne({
      where: { dnNo: createDto.dnNo },
    });
    if (existing) {
      throw new ConflictException(`Delivery Note ${createDto.dnNo} already exists`);
    }

    // Validate references if provided
    if (createDto.custNo) {
      await this.validateCustomerExists(createDto.custNo);
    }
    if (createDto.soNo) {
      await this.validateShippingOrderExists(createDto.soNo);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create header
      const header = queryRunner.manager.create(DeliveryNoteHeader, {
        dnNo: createDto.dnNo,
        date: new Date(createDto.date),
        custNo: createDto.custNo,
        soNo: createDto.soNo,
        delAddr1: createDto.delAddr1,
        delAddr2: createDto.delAddr2,
        delAddr3: createDto.delAddr3,
        delAddr4: createDto.delAddr4,
        delDate: createDto.delDate ? new Date(createDto.delDate) : undefined,
        remarks: createDto.remarks,
        loadingStatus: 'Created',
        creUser: userId || createDto.userId,
        userId: userId || createDto.userId,
      });

      const savedHeader = await queryRunner.manager.save(DeliveryNoteHeader, header);

      // Create details
      for (let i = 0; i < createDto.details.length; i++) {
        const detailDto = createDto.details[i];
        await this.validateItemExists(detailDto.itemNo);

        const detail = queryRunner.manager.create(DeliveryNoteDetail, {
          dnNo: savedHeader.dnNo,
          itemNo: detailDto.itemNo,
          lineNo: i + 1,
          qty: detailDto.qty,
          ctn: detailDto.ctn,
          qctn: detailDto.qctn,
          unit: detailDto.unit,
          poNo: detailDto.poNo,
          shipNo: detailDto.shipNo,
          cntrNo: detailDto.cntrNo,
          refNo: detailDto.refNo,
          ocNo: detailDto.ocNo,
          confNo: detailDto.confNo,
          head: detailDto.head !== undefined ? detailDto.head : true,
          creUser: userId || createDto.userId,
          userId: userId || createDto.userId,
        });

        await queryRunner.manager.save(DeliveryNoteDetail, detail);

        // Get item description
        const itemDesc = await this.getItemDescription(detailDto.itemNo);
        if (itemDesc) {
          detail.itemDesc = itemDesc;
          await queryRunner.manager.save(DeliveryNoteDetail, detail);
        }
      }

      // Create breakdowns if provided
      if (createDto.breakdowns && createDto.breakdowns.length > 0) {
        for (const breakdownDto of createDto.breakdowns) {
          const breakdown = queryRunner.manager.create(DeliveryNoteBreakdown, {
            dnNo: savedHeader.dnNo,
            itemNo: breakdownDto.itemNo,
            port: breakdownDto.port,
            poNo: breakdownDto.poNo,
            qty: breakdownDto.qty,
            delFrom: breakdownDto.delFrom ? new Date(breakdownDto.delFrom) : undefined,
            delTo: breakdownDto.delTo ? new Date(breakdownDto.delTo) : undefined,
            creUser: userId || createDto.userId,
            userId: userId || createDto.userId,
          });

          await queryRunner.manager.save(DeliveryNoteBreakdown, breakdown);
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
   * Create delivery note from Shipping Order
   *
   * Original Logic Reference:
   * - Legacy Form: idn (create from SO)
   * - Business Rules:
   *   - Copy items from SO
   *   - Copy breakdowns from OE if available
   *   - Validate quantities don't exceed SO
   */
  async createFromSo(createDto: CreateDeliveryNoteFromSoDto, userId?: string): Promise<DeliveryNoteHeader> {
    // Validate DN number uniqueness
    const existing = await this.dnHeaderRepository.findOne({
      where: { dnNo: createDto.dnNo },
    });
    if (existing) {
      throw new ConflictException(`Delivery Note ${createDto.dnNo} already exists`);
    }

    // Get SO items
    const soItems = await this.getSoItems(createDto.soNo);
    if (soItems.length === 0) {
      throw new NotFoundException(`No items found in Shipping Order ${createDto.soNo}`);
    }

    // Filter selected items if provided
    const itemsToInclude = createDto.selectedItemNos && createDto.selectedItemNos.length > 0
      ? soItems.filter(item => createDto.selectedItemNos!.includes(item.item_no))
      : soItems;

    if (itemsToInclude.length === 0) {
      throw new BadRequestException('No items selected for delivery note');
    }

    // Get SO header for customer info
    const soHeader = await this.getSoHeader(createDto.soNo);
    if (!soHeader) {
      throw new NotFoundException(`Shipping Order ${createDto.soNo} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create DN header
      const header = queryRunner.manager.create(DeliveryNoteHeader, {
        dnNo: createDto.dnNo,
        date: new Date(createDto.date),
        custNo: soHeader.cust_no,
        soNo: createDto.soNo,
        delAddr1: createDto.delAddr1,
        delAddr2: createDto.delAddr2,
        delAddr3: createDto.delAddr3,
        delAddr4: createDto.delAddr4,
        delDate: createDto.delDate ? new Date(createDto.delDate) : undefined,
        loadingStatus: 'Created',
        creUser: userId || createDto.userId,
        userId: userId || createDto.userId,
      });

      const savedHeader = await queryRunner.manager.save(DeliveryNoteHeader, header);

      // Create DN details from SO items
      for (let i = 0; i < itemsToInclude.length; i++) {
        const soItem = itemsToInclude[i];

        const detail = queryRunner.manager.create(DeliveryNoteDetail, {
          dnNo: savedHeader.dnNo,
          itemNo: soItem.item_no,
          lineNo: i + 1,
          qty: soItem.qty,
          ctn: soItem.ctn,
          poNo: soItem.po_no,
          shipNo: soItem.ship_no,
          cntrNo: soItem.cntr_no,
          refNo: soItem.ref_no,
          ocNo: soItem.oc_no,
          confNo: soItem.conf_no,
          head: true,
          creUser: userId || createDto.userId,
          userId: userId || createDto.userId,
        });

        await queryRunner.manager.save(DeliveryNoteDetail, detail);

        // Get item description
        const itemDesc = await this.getItemDescription(soItem.item_no);
        if (itemDesc) {
          detail.itemDesc = itemDesc;
          await queryRunner.manager.save(DeliveryNoteDetail, detail);
        }

        // Copy breakdowns from OE if requested
        if (createDto.copyBreakdowns && soItem.conf_no) {
          const breakdowns = await this.getOeBreakdowns(soItem.conf_no, soItem.item_no);
          for (const breakdown of breakdowns) {
            const dnBreakdown = queryRunner.manager.create(DeliveryNoteBreakdown, {
              dnNo: savedHeader.dnNo,
              itemNo: soItem.item_no,
              port: breakdown.port,
              poNo: breakdown.po_no,
              qty: breakdown.qty,
              delFrom: breakdown.del_from,
              delTo: breakdown.del_to,
              creUser: userId || createDto.userId,
              userId: userId || createDto.userId,
            });

            await queryRunner.manager.save(DeliveryNoteBreakdown, dnBreakdown);
          }
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
   * Find delivery note by DN number
   */
  async findOne(dnNo: string): Promise<DeliveryNoteHeader> {
    const header = await this.dnHeaderRepository.findOne({
      where: { dnNo },
      relations: ['details'],
    });

    if (!header) {
      throw new NotFoundException(`Delivery Note ${dnNo} not found`);
    }

    return header;
  }

  /**
   * Update delivery note
   */
  async update(dnNo: string, updateDto: UpdateDeliveryNoteDto, userId?: string): Promise<DeliveryNoteHeader> {
    const header = await this.findOne(dnNo);

    // Validate references if being updated
    if (updateDto.custNo) {
      await this.validateCustomerExists(updateDto.custNo);
    }
    if (updateDto.soNo) {
      await this.validateShippingOrderExists(updateDto.soNo);
    }

    // Update header fields
    if (updateDto.date) header.date = new Date(updateDto.date);
    if (updateDto.custNo !== undefined) header.custNo = updateDto.custNo;
    if (updateDto.soNo !== undefined) header.soNo = updateDto.soNo;
    if (updateDto.delAddr1 !== undefined) header.delAddr1 = updateDto.delAddr1;
    if (updateDto.delAddr2 !== undefined) header.delAddr2 = updateDto.delAddr2;
    if (updateDto.delAddr3 !== undefined) header.delAddr3 = updateDto.delAddr3;
    if (updateDto.delAddr4 !== undefined) header.delAddr4 = updateDto.delAddr4;
    if (updateDto.delDate) header.delDate = new Date(updateDto.delDate);
    if (updateDto.remarks !== undefined) header.remarks = updateDto.remarks;
    header.modDate = new Date();

    // Update details if provided
    if (updateDto.details && updateDto.details.length > 0) {
      // Delete existing details
      await this.dnDetailRepository.delete({ dnNo });

      // Create new details
      for (let i = 0; i < updateDto.details.length; i++) {
        const detailDto = updateDto.details[i];
        await this.validateItemExists(detailDto.itemNo);

        const detail = this.dnDetailRepository.create({
          dnNo: header.dnNo,
          itemNo: detailDto.itemNo,
          lineNo: i + 1,
          qty: detailDto.qty,
          ctn: detailDto.ctn,
          qctn: detailDto.qctn,
          unit: detailDto.unit,
          poNo: detailDto.poNo,
          shipNo: detailDto.shipNo,
          cntrNo: detailDto.cntrNo,
          refNo: detailDto.refNo,
          ocNo: detailDto.ocNo,
          confNo: detailDto.confNo,
          head: detailDto.head !== undefined ? detailDto.head : true,
          creUser: userId || updateDto.userId,
          userId: userId || updateDto.userId,
        });

        await this.dnDetailRepository.save(detail);
      }
    }

    return this.dnHeaderRepository.save(header);
  }

  /**
   * Delete delivery note
   */
  async remove(dnNo: string): Promise<void> {
    const header = await this.findOne(dnNo);
    await this.dnHeaderRepository.remove(header);
  }

  /**
   * Search delivery notes
   */
  async search(query?: {
    dnNo?: string;
    custNo?: string;
    soNo?: string;
    dateFrom?: Date;
    dateTo?: Date;
    loadingStatus?: string;
  }): Promise<DeliveryNoteSearchResponseDto[]> {
    const qb = this.dnHeaderRepository
      .createQueryBuilder('dn')
      .leftJoin('customer', 'c', 'dn.custNo = c.custNo')
      .leftJoin('delivery_note_detail', 'dnd', 'dn.dnNo = dnd.dnNo')
      .select([
        'dn.dnNo',
        'dn.date',
        'dn.custNo',
        'c.ename as customerName',
        'dn.soNo',
        'dn.delAddr1',
        'dn.delAddr2',
        'dn.delAddr3',
        'dn.delAddr4',
        'dn.delDate',
        'dn.loadingStatus',
        'dn.loadingNo',
        'dn.creUser',
        'dn.creDate',
        'dn.modDate',
      ])
      .addSelect('COUNT(DISTINCT dnd.itemNo)', 'itemCount')
      .addSelect('COALESCE(SUM(dnd.qty), 0)', 'totalQty')
      .groupBy('dn.dnNo, dn.date, dn.custNo, c.ename, dn.soNo, dn.delAddr1, dn.delAddr2, dn.delAddr3, dn.delAddr4, dn.delDate, dn.loadingStatus, dn.loadingNo, dn.creUser, dn.creDate, dn.modDate');

    if (query?.dnNo) {
      qb.andWhere('dn.dnNo ILIKE :dnNo', { dnNo: `%${query.dnNo}%` });
    }
    if (query?.custNo) {
      qb.andWhere('dn.custNo = :custNo', { custNo: query.custNo });
    }
    if (query?.soNo) {
      qb.andWhere('dn.soNo = :soNo', { soNo: query.soNo });
    }
    if (query?.dateFrom) {
      qb.andWhere('dn.date >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query?.dateTo) {
      qb.andWhere('dn.date <= :dateTo', { dateTo: query.dateTo });
    }
    if (query?.loadingStatus) {
      qb.andWhere('dn.loadingStatus = :loadingStatus', { loadingStatus: query.loadingStatus });
    }

    const results = await qb.getRawMany();
    return results.map(row => ({
      dnNo: row.dn_dnNo,
      date: row.dn_date,
      custNo: row.dn_custNo,
      customerName: row.customerName,
      soNo: row.dn_soNo,
      delAddr1: row.dn_delAddr1,
      delAddr2: row.dn_delAddr2,
      delAddr3: row.dn_delAddr3,
      delAddr4: row.dn_delAddr4,
      delDate: row.dn_delDate,
      loadingStatus: row.dn_loadingStatus,
      loadingNo: row.dn_loadingNo,
      itemCount: parseInt(row.itemCount) || 0,
      totalQty: parseFloat(row.totalQty) || 0,
      creUser: row.dn_creUser,
      creDate: row.dn_creDate,
      modDate: row.dn_modDate,
    }));
  }

  /**
   * Get available items for DN creation from SO
   *
   * Original Logic Reference:
   * - Legacy Form: idn (create from SO)
   */
  async getAvailableItemsForDn(soNo: string): Promise<AvailableItemsForDnResponseDto[]> {
    const query = `
      SELECT
        so.so_no,
        so.item_no,
        i.desp as item_description,
        so.qty as so_qty,
        COALESCE(SUM(dnd.qty), 0) as delivered_qty,
        (so.qty - COALESCE(SUM(dnd.qty), 0)) as remaining_qty,
        so.ctn,
        so.po_no,
        so.ship_date,
        c.ename as customer_name
      FROM shipping_order so
      LEFT JOIN delivery_note_detail dnd ON so.so_no = dnd.so_no AND so.item_no = dnd.item_no
      LEFT JOIN item i ON so.item_no = i.item_no
      LEFT JOIN order_confirmation_header och ON so.conf_no = och.conf_no
      LEFT JOIN customer c ON och.cust_no = c.cust_no
      WHERE so.so_no = $1
      GROUP BY so.so_no, so.item_no, i.desp, so.qty, so.ctn, so.po_no, so.ship_date, c.ename
      HAVING (so.qty - COALESCE(SUM(dnd.qty), 0)) > 0
    `;

    const results = await this.dataSource.query(query, [soNo]);
    return results.map(row => ({
      soNo: row.so_no,
      itemNo: row.item_no,
      itemDescription: row.item_description,
      soQty: parseFloat(row.so_qty),
      deliveredQty: parseFloat(row.delivered_qty),
      remainingQty: parseFloat(row.remaining_qty),
      ctn: row.ctn ? parseFloat(row.ctn) : undefined,
      poNo: row.po_no,
      shipDate: row.ship_date,
      customerName: row.customer_name,
    }));
  }

  /**
   * Update DN status
   */
  async updateStatus(dnNo: string, status: string, userId?: string): Promise<DeliveryNoteHeader> {
    const header = await this.findOne(dnNo);

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'Created': ['Loading', 'Shipped'],
      'Loading': ['Shipped', 'Delivered'],
      'Shipped': ['Delivered', 'Invoiced'],
      'Delivered': ['Invoiced'],
      'Invoiced': [],
    };

    const allowedStatuses = validTransitions[header.loadingStatus] || [];
    if (!allowedStatuses.includes(status) && status !== header.loadingStatus) {
      throw new BadRequestException(
        `Cannot transition from ${header.loadingStatus} to ${status}. Allowed transitions: ${allowedStatuses.join(', ')}`
      );
    }

    header.loadingStatus = status;
    header.modDate = new Date();

    return this.dnHeaderRepository.save(header);
  }

  // Private helper methods

  private async getSoItems(soNo: string): Promise<any[]> {
    const query = `
      SELECT
        so.item_no,
        so.qty,
        so.ctn,
        so.po_no,
        so.ship_no,
        so.cntr_no,
        so.ref_no,
        so.oc_no,
        so.conf_no
      FROM shipping_order so
      WHERE so.so_no = $1
    `;
    return this.dataSource.query(query, [soNo]);
  }

  private async getSoHeader(soNo: string): Promise<any> {
    const query = `
      SELECT DISTINCT
        och.cust_no
      FROM shipping_order so
      LEFT JOIN order_confirmation_header och ON so.conf_no = och.conf_no
      WHERE so.so_no = $1
      LIMIT 1
    `;
    const results = await this.dataSource.query(query, [soNo]);
    return results[0];
  }

  private async getOeBreakdowns(confNo: string, itemNo: string): Promise<any[]> {
    const query = `
      SELECT
        port,
        po_no,
        qty,
        del_from,
        del_to
      FROM order_enquiry_qty_breakdown
      WHERE oe_no IN (
        SELECT oe_no FROM order_enquiry_detail
        WHERE conf_no = $1 AND item_no = $2
      )
    `;
    return this.dataSource.query(query, [confNo, itemNo]);
  }

  private async getItemDescription(itemNo: string): Promise<string | undefined> {
    const result = await this.dataSource.query(
      'SELECT desp FROM item WHERE item_no = $1',
      [itemNo]
    );
    return result[0]?.desp;
  }

  private async validateCustomerExists(custNo: string): Promise<void> {
    const result = await this.dataSource.query(
      'SELECT 1 FROM customer WHERE cust_no = $1',
      [custNo]
    );
    if (result.length === 0) {
      throw new NotFoundException(`Customer ${custNo} not found`);
    }
  }

  private async validateShippingOrderExists(soNo: string): Promise<void> {
    const result = await this.dataSource.query(
      'SELECT 1 FROM shipping_order WHERE so_no = $1',
      [soNo]
    );
    if (result.length === 0) {
      throw new NotFoundException(`Shipping Order ${soNo} not found`);
    }
  }

  private async validateItemExists(itemNo: string): Promise<void> {
    const result = await this.dataSource.query(
      'SELECT 1 FROM item WHERE item_no = $1',
      [itemNo]
    );
    if (result.length === 0) {
      throw new NotFoundException(`Item ${itemNo} not found`);
    }
  }
}