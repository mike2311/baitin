/**
 * Shipping Order Search Response DTO
 *
 * Original Logic Reference:
 * - Legacy Form: isetso (search functionality)
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - Returns formatted SO data for lookup/search
 *   - Includes item descriptions for display
 *   - Supports pagination for large result sets
 *
 * Reference: Phase 3 - Shipping Order Module
 */
export class ShippingOrderSearchResponseDto {
  soNo: string;
  confNo?: string;
  contNo?: string;
  itemNo: string;
  itemDescription?: string; // From mitem.desp
  qty: number;
  ctn?: number;
  shipDate?: Date;
  shipMark?: string;
  poNo?: string;
  shipTo?: string;
  loadingPort?: string;
  dest?: string;
  creUser?: string;
  creDate: Date;
  modDate: Date;
}

/**
 * Shipping Order List Response DTO
 *
 * For paginated list views with summary information.
 */
export class ShippingOrderListResponseDto {
  soNo: string;
  itemCount: number; // Number of items in SO
  totalQty: number; // Total quantity
  totalCtn?: number; // Total cartons
  shipDate?: Date;
  customerName?: string; // From OC/Contract customer
  creUser?: string;
  creDate: Date;
}

/**
 * Available Items for SO Creation Response
 *
 * Original Logic Reference:
 * - Legacy Form: isetso (ugrid method)
 * - Business Rules:
 *   - Shows OC/Contract items available for SO
 *   - Calculates already shipped quantities
 *   - Shows remaining available quantities
 */
export class AvailableItemsForSoResponseDto {
  confNo?: string; // For OC-based SO
  contNo?: string; // For contract-based SO
  itemNo: string;
  itemDescription?: string; // From mitem.desp
  availableQty: number; // From OC/Contract
  shippedQty: number; // Already in SO
  remainingQty: number; // Available for new SO
  ctn?: number; // Carton quantity
  poNo?: string;
  shipDate?: Date;
  customerName?: string;
}