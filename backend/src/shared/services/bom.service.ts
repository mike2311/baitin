import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductBom } from '../../order-enquiry/entities/product-bom.entity';

/**
 * BOM Service
 *
 * Implements the core BOM quantity algorithm used across documents.
 *
 * Original Logic Reference:
 * - Documentation: docs/source/05-business-logic/core-algorithms.md
 * - Business Rule: sub_item_qty = (head_qty * bom_qty) / total_bom_qty
 */
@Injectable()
export class BomService {
  constructor(
    @InjectRepository(ProductBom)
    private readonly bomRepo: Repository<ProductBom>,
  ) {}

  async getComponents(
    itemNo: string,
  ): Promise<{ subItemNo: string; qty: number }[]> {
    const rows = await this.bomRepo.find({
      where: { itemNo },
      order: { id: 'ASC' },
    });
    return rows.map((r) => ({ subItemNo: r.subItemNo, qty: Number(r.qty) }));
  }

  async hasBom(itemNo: string): Promise<boolean> {
    const count = await this.bomRepo.count({ where: { itemNo } });
    return count > 0;
  }

  calculateSubItemQtys(
    headQty: number,
    components: { subItemNo: string; qty: number }[],
  ) {
    const totalBomQty = components.reduce(
      (sum, c) => sum + Number(c.qty || 0),
      0,
    );
    if (totalBomQty <= 0) {
      return [];
    }
    return components.map((c) => ({
      subItemNo: c.subItemNo,
      qty: (Number(headQty) * Number(c.qty)) / totalBomQty,
    }));
  }
}
