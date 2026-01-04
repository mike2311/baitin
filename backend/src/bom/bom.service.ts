import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductBom } from '../order-enquiry/entities/product-bom.entity';
import {
  CreateProductBomDto,
  UpdateProductBomDto,
} from './dto/product-bom.dto';

/**
 * BOM Management Service
 *
 * Original Logic Reference:
 * - Legacy Table: mprodbom
 * - Documentation: docs/source/02-business-processes/order-enquiry-process.md (Product BOM Structure)
 */
@Injectable()
export class BomManagementService {
  constructor(
    @InjectRepository(ProductBom)
    private readonly repo: Repository<ProductBom>,
  ) {}

  async list(itemNo: string) {
    const key = (itemNo || '').trim();
    if (!key) throw new BadRequestException('itemNo is required');
    return this.repo.find({ where: { itemNo: key }, order: { id: 'ASC' } });
  }

  async create(dto: CreateProductBomDto) {
    const itemNo = dto.itemNo.trim();
    const subItemNo = dto.subItemNo.trim();
    if (!itemNo || !subItemNo)
      throw new BadRequestException('itemNo and subItemNo are required');
    if (itemNo === subItemNo)
      throw new BadRequestException('itemNo and subItemNo cannot be the same');

    const entity = this.repo.create({
      itemNo,
      subItemNo,
      qty: dto.qty,
      unit: dto.unit?.trim() || null,
    } as Partial<ProductBom>);
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateProductBomDto) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('BOM record not found');
    const updated = this.repo.merge(existing, {
      qty: dto.qty !== undefined ? dto.qty : existing.qty,
      unit: dto.unit !== undefined ? dto.unit?.trim() || null : existing.unit,
    });
    return this.repo.save(updated);
  }

  async remove(id: string) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('BOM record not found');
    await this.repo.remove(existing);
    return { deleted: true };
  }
}
