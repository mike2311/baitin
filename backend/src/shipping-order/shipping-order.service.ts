import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ShippingOrder } from './entities/shipping-order.entity';
import { SoFormat } from './entities/so-format.entity';
import {
  CreateShippingOrderDto,
  CreateShippingOrderFromSourceDto,
} from './dto/create-shipping-order.dto';
import { UpdateShippingOrderDto } from './dto/update-shipping-order.dto';
import {
  ShippingOrderSearchResponseDto,
  AvailableItemsForSoResponseDto,
} from './dto/shipping-order-search-response.dto';

/**
 * Shipping Order Service
 *
 * Original Logic Reference:
 * - Legacy Forms: isetso, pso
 * - Legacy Programs: pso.prg
 * - Documentation: docs/source/02-business-processes/shipping-process.md
 * - Business Rules:
 *   - Create SO from OC or Contract
 *   - Validate item availability
 *   - Apply customer ship marks
 *   - Support format configurations
 *   - Link to invoice generation
 *
 * Reference: Phase 3 - Shipping Order Module
 */
@Injectable()
export class ShippingOrderService {
  constructor(
    @InjectRepository(ShippingOrder)
    private readonly shippingOrderRepository: Repository<ShippingOrder>,
    @InjectRepository(SoFormat)
    private readonly soFormatRepository: Repository<SoFormat>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a single shipping order record
   *
   * Original Logic Reference:
   * - Legacy Form: isetso (manual entry)
   */
  async create(
    createDto: CreateShippingOrderDto,
    userId?: string,
  ): Promise<ShippingOrder> {
    // Validate SO number uniqueness
    const existing = await this.shippingOrderRepository.findOne({
      where: { soNo: createDto.soNo },
    });
    if (existing) {
      throw new ConflictException(
        `Shipping Order ${createDto.soNo} already exists`,
      );
    }

    // Validate references if provided
    if (createDto.confNo) {
      await this.validateOrderConfirmationExists(createDto.confNo);
    }
    if (createDto.contNo) {
      await this.validateContractExists(createDto.contNo);
    }
    await this.validateItemExists(createDto.itemNo);

    // Apply customer ship mark if not provided
    if (!createDto.shipMark && createDto.confNo) {
      createDto.shipMark = await this.getCustomerShipMarkFromOc(
        createDto.confNo,
      );
    }

    const shippingOrder = this.shippingOrderRepository.create({
      ...createDto,
      creUser: userId || createDto.userId,
      userId: userId || createDto.userId,
    });

    return this.shippingOrderRepository.save(shippingOrder);
  }

  /**
   * Create shipping orders from OC or Contract
   *
   * Original Logic Reference:
   * - Legacy Form: isetso (ugrid method)
   * - Business Rules:
   *   - Validate source exists
   *   - Check item availability
   *   - Create SO records for selected items
   */
  async createFromSource(
    createDto: CreateShippingOrderFromSourceDto,
    userId?: string,
  ): Promise<ShippingOrder[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const shippingOrders: ShippingOrder[] = [];

      // Validate source and get available items
      const availableItems = await this.getAvailableItemsForSo(
        createDto.sourceType,
        createDto.sourceNo,
      );

      // Validate selected items
      for (const selectedItem of createDto.selectedItems) {
        const availableItem = availableItems.find(
          (item) => item.itemNo === selectedItem.itemNo,
        );

        if (!availableItem) {
          throw new BadRequestException(
            `Item ${selectedItem.itemNo} not available in ${createDto.sourceType.toUpperCase()} ${createDto.sourceNo}`,
          );
        }

        if (selectedItem.qty > availableItem.remainingQty) {
          throw new BadRequestException(
            `Requested quantity ${selectedItem.qty} exceeds available quantity ${availableItem.remainingQty} for item ${selectedItem.itemNo}`,
          );
        }

        // Create SO record
        const shippingOrder = queryRunner.manager.create(ShippingOrder, {
          soNo: createDto.soNo,
          confNo:
            createDto.sourceType === 'oc' ? createDto.sourceNo : undefined,
          contNo:
            createDto.sourceType === 'contract'
              ? createDto.sourceNo
              : undefined,
          itemNo: selectedItem.itemNo,
          qty: selectedItem.qty,
          ctn: selectedItem.ctn,
          poNo: selectedItem.poNo,
          shipDate: selectedItem.shipDate
            ? new Date(selectedItem.shipDate)
            : undefined,
          shipMark: await this.getCustomerShipMarkFromSource(
            createDto.sourceType,
            createDto.sourceNo,
          ),
          fobPort: await this.getFobPortFromSource(
            createDto.sourceType,
            createDto.sourceNo,
          ),
          creUser: userId || createDto.userId,
          userId: userId || createDto.userId,
        });

        const savedOrder = await queryRunner.manager.save(
          ShippingOrder,
          shippingOrder,
        );
        shippingOrders.push(savedOrder);
      }

      await queryRunner.commitTransaction();
      return shippingOrders;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find shipping order by SO number
   */
  async findOne(soNo: string): Promise<ShippingOrder> {
    const shippingOrder = await this.shippingOrderRepository.findOne({
      where: { soNo },
    });

    if (!shippingOrder) {
      throw new NotFoundException(`Shipping Order ${soNo} not found`);
    }

    return shippingOrder;
  }

  /**
   * Update shipping order
   */
  async update(
    soNo: string,
    updateDto: UpdateShippingOrderDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId?: string,
  ): Promise<ShippingOrder> {
    const shippingOrder = await this.findOne(soNo);

    // Validate references if being updated
    if (updateDto.confNo) {
      await this.validateOrderConfirmationExists(updateDto.confNo);
    }
    if (updateDto.contNo) {
      await this.validateContractExists(updateDto.contNo);
    }
    if (updateDto.itemNo) {
      await this.validateItemExists(updateDto.itemNo);
    }

    Object.assign(shippingOrder, updateDto);
    shippingOrder.modDate = new Date();

    return this.shippingOrderRepository.save(shippingOrder);
  }

  /**
   * Delete shipping order
   */
  async remove(soNo: string): Promise<void> {
    const shippingOrder = await this.findOne(soNo);
    await this.shippingOrderRepository.remove(shippingOrder);
  }

  /**
   * Search shipping orders
   */
  async search(query?: {
    soNo?: string;
    confNo?: string;
    contNo?: string;
    itemNo?: string;
    shipDateFrom?: Date;
    shipDateTo?: Date;
  }): Promise<ShippingOrderSearchResponseDto[]> {
    const qb = this.shippingOrderRepository
      .createQueryBuilder('so')
      .leftJoin('item', 'i', 'so.itemNo = i.itemNo')
      .select([
        'so.soNo',
        'so.confNo',
        'so."contNo"',
        'so.itemNo',
        'i.desp as itemDescription',
        'so.qty',
        'so.ctn',
        'so.shipDate',
        'so.shipMark',
        'so.poNo',
        'so.shipTo',
        'so.loadingPort',
        'so.dest',
        'so.creUser',
        'so.creDate',
        'so.modDate',
      ]);

    if (query?.soNo) {
      qb.andWhere('so.soNo ILIKE :soNo', { soNo: `%${query.soNo}%` });
    }
    if (query?.confNo) {
      qb.andWhere('so.confNo = :confNo', { confNo: query.confNo });
    }
    if (query?.contNo) {
      qb.andWhere('so."contNo" = :contNo', { contNo: query.contNo });
    }
    if (query?.itemNo) {
      qb.andWhere('so.itemNo ILIKE :itemNo', { itemNo: `%${query.itemNo}%` });
    }
    if (query?.shipDateFrom) {
      qb.andWhere('so.shipDate >= :shipDateFrom', {
        shipDateFrom: query.shipDateFrom,
      });
    }
    if (query?.shipDateTo) {
      qb.andWhere('so.shipDate <= :shipDateTo', {
        shipDateTo: query.shipDateTo,
      });
    }

    const results = await qb.getRawMany();
    return results;
  }

  /**
   * Get available items for SO creation from OC or Contract
   *
   * Original Logic Reference:
   * - Legacy Form: isetso (ugrid method)
   */
  async getAvailableItemsForSo(
    sourceType: 'oc' | 'contract',
    sourceNo: string,
  ): Promise<AvailableItemsForSoResponseDto[]> {
    let query: string;
    let parameters: any;

    if (sourceType === 'oc') {
      // Get items from Order Confirmation
      query = `
        SELECT
          oc.conf_no,
          NULL as cont_no,
          oc.item_no,
          i.desp as item_description,
          oc.qty as available_qty,
          COALESCE(SUM(so.qty), 0) as shipped_qty,
          (oc.qty - COALESCE(SUM(so.qty), 0)) as remaining_qty,
          oc.ctn,
          oc.po_no,
          oc.del_date as ship_date,
          c.ename as customer_name
        FROM order_confirmation_detail oc
        LEFT JOIN shipping_order so ON oc.conf_no = so."confNo" AND oc.item_no = so."itemNo"
        LEFT JOIN item i ON oc.item_no = i.item_no
        LEFT JOIN order_confirmation_header och ON oc.conf_no = och.conf_no
        LEFT JOIN customer c ON och.cust_no = c.cust_no
        WHERE oc.conf_no = $1
        GROUP BY oc.conf_no, oc.item_no, i.desp, oc.qty, oc.ctn, oc.po_no, oc.del_date, c.ename
        HAVING (oc.qty - COALESCE(SUM(so.qty), 0)) > 0
      `;
      parameters = [sourceNo];
    } else {
      // Get items from Contract
      query = `
        SELECT
          NULL as conf_no,
          c.cont_no,
          c.item_no,
          i.desp as item_description,
          c.qty as available_qty,
          COALESCE(SUM(so.qty), 0) as shipped_qty,
          (c.qty - COALESCE(SUM(so.qty), 0)) as remaining_qty,
          c.ctn,
          c.po_no,
          c.req_date_to as ship_date,
          cust.ename as customer_name
        FROM contract_detail c
        LEFT JOIN shipping_order so ON c.cont_no = so."contNo" AND c.item_no = so."itemNo"
        LEFT JOIN item i ON c.item_no = i.item_no
        LEFT JOIN contract_header ch ON c.cont_no = ch.cont_no
        LEFT JOIN customer cust ON ch.cust_no = cust.cust_no
        WHERE c.cont_no = $1
        GROUP BY c.cont_no, c.item_no, i.desp, c.qty, c.ctn, c.po_no, c.req_date_to, cust.ename
        HAVING (c.qty - COALESCE(SUM(so.qty), 0)) > 0
      `;
      parameters = [sourceNo];
    }

    const results = await this.dataSource.query(query, parameters);
    return results;
  }

  /**
   * Get SO format configuration
   *
   * Original Logic Reference:
   * - Legacy Table: zsoformat
   * - Legacy Program: pso.prg (format application)
   */
  async getSoFormat(soKey: string): Promise<SoFormat[]> {
    return this.soFormatRepository.find({
      where: { soKey },
      order: { vpos: 'ASC', hpos: 'ASC' },
    });
  }

  /**
   * Get customer ship mark from OC
   */
  private async getCustomerShipMarkFromOc(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _confNo: string,
  ): Promise<string | undefined> {
    // shipmark column doesn't exist in customer table, return undefined
    return undefined;
  }

  /**
   * Get customer ship mark from source
   */
  private async getCustomerShipMarkFromSource(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _sourceType: 'oc' | 'contract',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _sourceNo: string,
  ): Promise<string | undefined> {
    // shipmark column doesn't exist in customer table, return undefined
    return undefined;
  }

  /**
   * Get FOB port from source
   */
  private async getFobPortFromSource(
    sourceType: 'oc' | 'contract',
    sourceNo: string,
  ): Promise<string | undefined> {
    if (sourceType === 'contract') {
      const result = await this.dataSource.query(
        `
        SELECT fob_port FROM contract_header WHERE cont_no = $1
      `,
        [sourceNo],
      );
      return result[0]?.fob_port;
    }
    return undefined;
  }

  /**
   * Validate order confirmation exists
   */
  private async validateOrderConfirmationExists(confNo: string): Promise<void> {
    const result = await this.dataSource.query(
      'SELECT 1 FROM order_confirmation_header WHERE conf_no = $1',
      [confNo],
    );
    if (result.length === 0) {
      throw new NotFoundException(`Order Confirmation ${confNo} not found`);
    }
  }

  /**
   * Validate contract exists
   */
  private async validateContractExists(contNo: string): Promise<void> {
    const result = await this.dataSource.query(
      'SELECT 1 FROM contract_header WHERE cont_no = $1',
      [contNo],
    );
    if (result.length === 0) {
      throw new NotFoundException(`Contract ${contNo} not found`);
    }
  }

  /**
   * Validate item exists
   */
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
