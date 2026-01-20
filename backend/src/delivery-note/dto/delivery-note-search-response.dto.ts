/**
 * Delivery Note Search Response DTO
 *
 * Original Logic Reference:
 * - Legacy Form: idn (search functionality)
 * - Documentation: docs/source/04-forms-and-screens/delivery-note-forms.md
 * - Business Rules:
 *   - Returns formatted DN data for lookup/search
 *   - Includes item descriptions for display
 *   - Supports pagination for large result sets
 *
 * Reference: Phase 3 - Delivery Note Module
 */
export class DeliveryNoteSearchResponseDto {
  dnNo: string;
  date: Date;
  custNo?: string;
  customerName?: string; // From mcustom.ename
  soNo?: string;
  delAddr1?: string;
  delAddr2?: string;
  delAddr3?: string;
  delAddr4?: string;
  delDate?: Date;
  loadingStatus: string;
  loadingNo?: string;
  itemCount: number; // Number of items in DN
  totalQty: number; // Total quantity
  creUser?: string;
  creDate: Date;
  modDate: Date;
}

/**
 * Delivery Note Detail Response DTO
 *
 * For viewing DN details with all items and breakdowns.
 */
export class DeliveryNoteDetailResponseDto {
  header: DeliveryNoteSearchResponseDto;
  items: Array<{
    itemNo: string;
    itemDescription?: string;
    qty: number;
    ctn?: number;
    qctn?: number;
    unit?: string;
    poNo?: string;
    shipNo?: string;
    cntrNo?: string;
    refNo?: string;
    ocNo?: string;
    confNo?: string;
    head: boolean;
    lineNo: number;
  }>;
  breakdowns?: Array<{
    itemNo: string;
    port: string;
    poNo: string;
    qty?: number;
    delFrom?: Date;
    delTo?: Date;
  }>;
}

/**
 * Available Items for DN Creation Response
 *
 * Original Logic Reference:
 * - Legacy Form: idn (create from SO)
 * - Business Rules:
 *   - Shows SO items available for DN
 *   - Calculates already delivered quantities
 *   - Shows remaining available quantities
 */
export class AvailableItemsForDnResponseDto {
  soNo: string;
  itemNo: string;
  itemDescription?: string;
  soQty: number; // Quantity in SO
  deliveredQty: number; // Already in DNs
  remainingQty: number; // Available for new DN
  ctn?: number;
  poNo?: string;
  shipDate?: Date;
  customerName?: string;
}