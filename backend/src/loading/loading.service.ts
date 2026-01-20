import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LoadingMaster } from './entities/loading-master.entity';
import { LoadingAdviceHeader } from './entities/loading-advice-header.entity';
import { LoadingAdviceDetail } from './entities/loading-advice-detail.entity';
import {
  CreateLoadingMasterDto,
  CreateLoadingAdviceDto,
} from './dto/create-loading-master.dto';
// Note: Not importing DeliveryNoteService to avoid circular dependency
// DN status updates done via direct DataSource queries

/**
 * Loading Service
 *
 * Original Logic Reference:
 * - Legacy Forms: iload, isetla, pla
 * - Documentation: docs/source/02-business-processes/delivery-note-process.md
 * - Business Rules:
 *   - Coordinate multiple DNs for container loading
 *   - Generate loading advice documents
 *   - Update DN statuses when assigned to loading
 *   - Track container assignments and positions
 *
 * Reference: Phase 3 - Loading Module
 */
@Injectable()
export class LoadingService {
  constructor(
    @InjectRepository(LoadingMaster)
    private readonly loadingMasterRepository: Repository<LoadingMaster>,
    @InjectRepository(LoadingAdviceHeader)
    private readonly loadingAdviceHeaderRepository: Repository<LoadingAdviceHeader>,
    @InjectRepository(LoadingAdviceDetail)
    private readonly loadingAdviceDetailRepository: Repository<LoadingAdviceDetail>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create loading master
   *
   * Original Logic Reference:
   * - Legacy Form: iload
   */
  async createLoadingMaster(
    createDto: CreateLoadingMasterDto,
    userId?: string,
  ): Promise<LoadingMaster> {
    // Validate loading number uniqueness
    const existing = await this.loadingMasterRepository.findOne({
      where: { loadingNo: createDto.loadingNo },
    });
    if (existing) {
      throw new ConflictException(
        `Loading Master ${createDto.loadingNo} already exists`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create loading master
      const loadingMaster = queryRunner.manager.create(LoadingMaster, {
        loadingNo: createDto.loadingNo,
        date: new Date(createDto.date),
        vesselName: createDto.vesselName,
        voyageNo: createDto.voyageNo,
        totalWeight: createDto.totalWeight,
        totalCube: createDto.totalCube,
        totalCartons: createDto.totalCartons,
        remarks: createDto.remarks,
        status: 'Planned',
        creUser: userId || createDto.userId,
        userId: userId || createDto.userId,
      });

      const savedMaster = await queryRunner.manager.save(
        LoadingMaster,
        loadingMaster,
      );

      // Update DN statuses if DNs provided
      if (createDto.dnNos && createDto.dnNos.length > 0) {
        for (const dnNo of createDto.dnNos) {
          // Update DN status to Loading and assign loading number
          await queryRunner.manager.query(
            `UPDATE delivery_note_header SET loading_status = 'Loading', loading_no = $1 WHERE dn_no = $2`,
            [createDto.loadingNo, dnNo],
          );
        }
      }

      await queryRunner.commitTransaction();
      return savedMaster;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create loading advice
   *
   * Original Logic Reference:
   * - Legacy Form: isetla
   */
  async createLoadingAdvice(
    createDto: CreateLoadingAdviceDto,
    userId?: string,
  ): Promise<LoadingAdviceHeader> {
    // Validate loading master exists
    const loadingMaster = await this.loadingMasterRepository.findOne({
      where: { loadingNo: createDto.loadingNo },
    });
    if (!loadingMaster) {
      throw new NotFoundException(
        `Loading Master ${createDto.loadingNo} not found`,
      );
    }

    // Validate LA number uniqueness
    const existing = await this.loadingAdviceHeaderRepository.findOne({
      where: { laNo: createDto.laNo },
    });
    if (existing) {
      throw new ConflictException(
        `Loading Advice ${createDto.laNo} already exists`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create loading advice header
      const header = queryRunner.manager.create(LoadingAdviceHeader, {
        laNo: createDto.laNo,
        date: new Date(createDto.date),
        loadingNo: createDto.loadingNo,
        vesselName: createDto.vesselName || loadingMaster.vesselName,
        voyageNo: createDto.voyageNo || loadingMaster.voyageNo,
        remarks: createDto.remarks,
        creUser: userId || createDto.userId,
        userId: userId || createDto.userId,
      });

      const savedHeader = await queryRunner.manager.save(
        LoadingAdviceHeader,
        header,
      );

      // Create loading advice details
      for (const detailDto of createDto.details) {
        await this.validateItemExists(detailDto.itemNo);

        const detail = queryRunner.manager.create(LoadingAdviceDetail, {
          laNo: savedHeader.laNo,
          itemNo: detailDto.itemNo,
          qty: detailDto.qty,
          ctn: detailDto.ctn,
          weight: detailDto.weight,
          cube: detailDto.cube,
          containerNo: detailDto.containerNo,
          position: detailDto.position,
          remarks: detailDto.remarks,
          creUser: userId || createDto.userId,
          userId: userId || createDto.userId,
        });

        await queryRunner.manager.save(LoadingAdviceDetail, detail);
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
   * Find loading master by loading number
   */
  async findLoadingMaster(loadingNo: string): Promise<LoadingMaster> {
    const master = await this.loadingMasterRepository.findOne({
      where: { loadingNo },
      relations: ['adviceHeaders'],
    });

    if (!master) {
      throw new NotFoundException(`Loading Master ${loadingNo} not found`);
    }

    return master;
  }

  /**
   * Find loading advice by LA number
   */
  async findLoadingAdvice(laNo: string): Promise<LoadingAdviceHeader> {
    const advice = await this.loadingAdviceHeaderRepository.findOne({
      where: { laNo },
      relations: ['details', 'loadingMaster'],
    });

    if (!advice) {
      throw new NotFoundException(`Loading Advice ${laNo} not found`);
    }

    return advice;
  }

  /**
   * Get DNs assigned to loading master
   */
  async getDnsForLoading(loadingNo: string): Promise<any[]> {
    const query = `
      SELECT
        dn.dn_no,
        dn.date,
        dn.cust_no,
        c.ename as customer_name,
        dn.so_no,
        dn.loading_status,
        COUNT(DISTINCT dnd.item_no) as item_count,
        COALESCE(SUM(dnd.qty), 0) as total_qty
      FROM delivery_note_header dn
      LEFT JOIN customer c ON dn.cust_no = c.cust_no
      LEFT JOIN delivery_note_detail dnd ON dn.dn_no = dnd.dn_no
      WHERE dn.loading_no = $1
      GROUP BY dn.dn_no, dn.date, dn.cust_no, c.ename, dn.so_no, dn.loading_status
      ORDER BY dn.date, dn.dn_no
    `;

    return this.dataSource.query(query, [loadingNo]);
  }

  /**
   * Update loading master status
   */
  async updateLoadingMasterStatus(
    loadingNo: string,
    status: string,
    userId?: string,
  ): Promise<LoadingMaster> {
    const master = await this.findLoadingMaster(loadingNo);

    // Validate status transition
    const validStatuses = ['Planned', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status: ${status}. Valid statuses: ${validStatuses.join(', ')}`,
      );
    }

    master.status = status;
    master.modDate = new Date();

    return this.loadingMasterRepository.save(master);
  }

  /**
   * Assign DNs to loading master
   *
   * Original Logic Reference:
   * - Legacy Form: iload (assign DNs)
   */
  async assignDnsToLoading(
    loadingNo: string,
    dnNos: string[],
    userId?: string,
  ): Promise<void> {
    const master = await this.findLoadingMaster(loadingNo);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const dnNo of dnNos) {
        // Validate DN exists
        const dn = await queryRunner.manager.query(
          'SELECT 1 FROM delivery_note_header WHERE dn_no = $1',
          [dnNo],
        );
        if (dn.length === 0) {
          throw new NotFoundException(`Delivery Note ${dnNo} not found`);
        }

        // Update DN status and assign loading number
        await queryRunner.manager.query(
          `UPDATE delivery_note_header 
           SET loading_status = 'Loading', loading_no = $1, mod_date = CURRENT_TIMESTAMP
           WHERE dn_no = $2`,
          [loadingNo, dnNo],
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Search loading masters
   */
  async searchLoadingMasters(query?: {
    loadingNo?: string;
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
  }): Promise<LoadingMaster[]> {
    const qb = this.loadingMasterRepository.createQueryBuilder('lm');

    if (query?.loadingNo) {
      qb.andWhere('lm.loadingNo ILIKE :loadingNo', {
        loadingNo: `%${query.loadingNo}%`,
      });
    }
    if (query?.dateFrom) {
      qb.andWhere('lm.date >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query?.dateTo) {
      qb.andWhere('lm.date <= :dateTo', { dateTo: query.dateTo });
    }
    if (query?.status) {
      qb.andWhere('lm.status = :status', { status: query.status });
    }

    return qb.getMany();
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
