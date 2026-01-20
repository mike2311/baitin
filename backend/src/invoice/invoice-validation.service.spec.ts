import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceValidationService } from './invoice-validation.service';

/**
 * Invoice Validation Service Tests
 *
 * Original Logic Reference:
 * - Legacy Forms: iinvdt2@ validation
 * - Documentation: docs/source/02-business-processes/invoice-process.md
 * - Business Rules:
 *   - Test qty/carton mismatch validation with override
 *   - Test date range validation
 *   - Test item availability validation
 *   - Test customer credit limit validation
 *
 * Reference: Phase 3 - Invoice Validation
 */
describe('InvoiceValidationService', () => {
  let service: InvoiceValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceValidationService],
    }).compile();

    service = module.get<InvoiceValidationService>(InvoiceValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateQtyCartonMatch', () => {
    it('should validate correct qty/carton ratio', async () => {
      const items = [
        { itemNo: 'ITEM001', qty: 100, ctn: 2, qctn: 50 },
        { itemNo: 'ITEM002', qty: 120, ctn: 3, qctn: 40 },
      ];

      const result = await service.validateQtyCartonMatch(items);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect qty/carton mismatch', async () => {
      const items = [
        { itemNo: 'ITEM001', qty: 100, ctn: 2, qctn: 50 }, // Valid: 2 * 50 = 100
        { itemNo: 'ITEM002', qty: 150, ctn: 3, qctn: 40 }, // Invalid: 3 * 40 = 120 ≠ 150
      ];

      const result = await service.validateQtyCartonMatch(items);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Qty/carton mismatch for item ITEM002: expected 120, got 150');
    });

    it('should allow override for qty/carton mismatch', async () => {
      const items = [
        {
          itemNo: 'ITEM001',
          qty: 150,
          ctn: 3,
          qctn: 40,
          overrideQtyCarton: true
        },
      ];

      const result = await service.validateQtyCartonMatch(items);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should calculate expected quantity correctly', async () => {
      const item = { qty: 150, ctn: 3, qctn: 40 };

      const expectedQty = (service as any).calculateExpectedQty(item);

      expect(expectedQty).toBe(120); // 3 * 40
    });

    it('should handle zero cartons', async () => {
      const item = { qty: 100, ctn: 0, qctn: 50 };

      const expectedQty = (service as any).calculateExpectedQty(item);

      expect(expectedQty).toBe(0);
    });
  });

  describe('validateDateRange', () => {
    it('should validate correct date range', async () => {
      const fromDate = new Date('2025-01-01');
      const toDate = new Date('2025-01-31');

      const result = await service.validateDateRange(fromDate, toDate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject from date after to date', async () => {
      const fromDate = new Date('2025-01-31');
      const toDate = new Date('2025-01-01');

      const result = await service.validateDateRange(fromDate, toDate);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('From date cannot be after To date');
    });

    it('should allow null dates', async () => {
      const result = await service.validateDateRange(null, null);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should allow only from date', async () => {
      const fromDate = new Date('2025-01-01');

      const result = await service.validateDateRange(fromDate, null);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should allow only to date', async () => {
      const toDate = new Date('2025-01-31');

      const result = await service.validateDateRange(null, toDate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateItemAvailability', () => {
    it('should validate available item quantities', async () => {
      const items = [
        { itemNo: 'ITEM001', qty: 100 },
        { itemNo: 'ITEM002', qty: 50 },
      ];

      const availableItems = [
        { itemNo: 'ITEM001', availableQty: 200 },
        { itemNo: 'ITEM002', availableQty: 75 },
      ];

      const result = await service.validateItemAvailability(items, availableItems);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect insufficient item quantities', async () => {
      const items = [
        { itemNo: 'ITEM001', qty: 300 }, // Requesting 300
      ];

      const availableItems = [
        { itemNo: 'ITEM001', availableQty: 200 }, // Only 200 available
      ];

      const result = await service.validateItemAvailability(items, availableItems);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Insufficient quantity for item ITEM001: requested 300, available 200');
    });

    it('should handle missing items', async () => {
      const items = [
        { itemNo: 'ITEM001', qty: 100 },
      ];

      const availableItems = []; // No items available

      const result = await service.validateItemAvailability(items, availableItems);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item ITEM001 not available for invoicing');
    });
  });

  describe('validateCustomerCredit', () => {
    it('should validate customer within credit limit', async () => {
      const customer = {
        custNo: 'CUST001',
        creditLimit: 10000,
        currentBalance: 5000,
      };

      const invoiceTotal = 3000; // Total would be 8000, within limit

      const result = await service.validateCustomerCredit(customer, invoiceTotal);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect credit limit exceeded', async () => {
      const customer = {
        custNo: 'CUST001',
        creditLimit: 10000,
        currentBalance: 8000,
      };

      const invoiceTotal = 3000; // Total would be 11000, over limit

      const result = await service.validateCustomerCredit(customer, invoiceTotal);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Credit limit exceeded for customer CUST001: limit 10000, would be 11000');
    });

    it('should handle unlimited credit', async () => {
      const customer = {
        custNo: 'CUST001',
        creditLimit: 0, // No limit
        currentBalance: 50000,
      };

      const invoiceTotal = 100000;

      const result = await service.validateCustomerCredit(customer, invoiceTotal);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should calculate projected balance correctly', async () => {
      const customer = { creditLimit: 10000, currentBalance: 5000 };
      const invoiceTotal = 3000;

      const projectedBalance = (service as any).calculateProjectedBalance(customer, invoiceTotal);

      expect(projectedBalance).toBe(8000);
    });
  });

  describe('validateInvoiceData', () => {
    it('should pass all validations', async () => {
      const invoiceData = {
        invNo: 'INV001',
        custNo: 'CUST001',
        date: new Date('2025-01-15'),
        invDtFrDate: new Date('2025-01-01'),
        invDtToDate: new Date('2025-01-31'),
        details: [
          { itemNo: 'ITEM001', qty: 100, ctn: 2, qctn: 50 },
        ],
      };

      const result = await service.validateInvoiceData(invoiceData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect multiple validation errors', async () => {
      const invoiceData = {
        invNo: 'INV001',
        custNo: 'CUST001',
        date: new Date('2025-01-15'),
        invDtFrDate: new Date('2025-01-31'), // Invalid: from > to
        invDtToDate: new Date('2025-01-01'),
        details: [
          { itemNo: 'ITEM001', qty: 150, ctn: 2, qctn: 50 }, // Invalid: qty mismatch
        ],
      };

      const result = await service.validateInvoiceData(invoiceData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('From date cannot be after To date');
      expect(result.errors).toContain('Qty/carton mismatch for item ITEM001: expected 100, got 150');
    });
  });

  describe('getValidationSummary', () => {
    it('should provide validation summary', async () => {
      const validationResults = {
        qtyCartonValid: false,
        dateRangeValid: true,
        itemAvailabilityValid: true,
        customerCreditValid: false,
      };

      const summary = await service.getValidationSummary(validationResults);

      expect(summary.totalChecks).toBe(4);
      expect(summary.passedChecks).toBe(2);
      expect(summary.failedChecks).toBe(2);
      expect(summary.overallValid).toBe(false);
    });

    it('should show all passed when valid', async () => {
      const validationResults = {
        qtyCartonValid: true,
        dateRangeValid: true,
        itemAvailabilityValid: true,
        customerCreditValid: true,
      };

      const summary = await service.getValidationSummary(validationResults);

      expect(summary.totalChecks).toBe(4);
      expect(summary.passedChecks).toBe(4);
      expect(summary.failedChecks).toBe(0);
      expect(summary.overallValid).toBe(true);
    });
  });

  describe('validateWithOverride', () => {
    it('should allow override for specific validations', async () => {
      const validationType = 'qtyCarton';
      const isValid = false;
      const overrideAllowed = true;

      const result = await service.validateWithOverride(validationType, isValid, overrideAllowed);

      expect(result.canProceed).toBe(true);
      expect(result.requiresOverride).toBe(true);
      expect(result.overrideUsed).toBe(true);
    });

    it('should block invalid data without override', async () => {
      const validationType = 'qtyCarton';
      const isValid = false;
      const overrideAllowed = false;

      const result = await service.validateWithOverride(validationType, isValid, overrideAllowed);

      expect(result.canProceed).toBe(false);
      expect(result.requiresOverride).toBe(true);
      expect(result.overrideUsed).toBe(false);
    });

    it('should allow valid data without override', async () => {
      const validationType = 'qtyCarton';
      const isValid = true;
      const overrideAllowed = false;

      const result = await service.validateWithOverride(validationType, isValid, overrideAllowed);

      expect(result.canProceed).toBe(true);
      expect(result.requiresOverride).toBe(false);
      expect(result.overrideUsed).toBe(false);
    });
  });
});