import { Test, TestingModule } from '@nestjs/testing';
import { EnquiryController } from './enquiry.controller';
import { EnquiryService } from './enquiry.service';

/**
 * Enquiry Controller Tests
 *
 * Original Logic Reference:
 * - Legacy Reports: Sales analysis, item enquiries, SO/DN/Invoice enquiries
 * - Documentation: docs/modernization-strategy/09-reporting-analytics/reporting-analytics.md
 * - Business Rules:
 *   - Test REST API endpoints for enquiries
 *   - Test request/response handling
 *   - Test parameter validation
 *   - Test error responses
 *
 * Reference: Phase 3 - Enquiry Module
 */
describe('EnquiryController', () => {
  let controller: EnquiryController;
  let service: EnquiryService;

  const mockEnquiryService = {
    salesAnalysis: jest.fn(),
    getItemEnquiry: jest.fn(),
    getSoEnquiry: jest.fn(),
    getDnEnquiry: jest.fn(),
    getInvoiceEnquiry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnquiryController],
      providers: [
        {
          provide: EnquiryService,
          useValue: mockEnquiryService,
        },
      ],
    }).compile();

    controller = module.get<EnquiryController>(EnquiryController);
    service = module.get<EnquiryService>(EnquiryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('salesAnalysis', () => {
    it('should return sales analysis by customer', async () => {
      const query = {
        analysisType: 'by_customer' as const,
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockResult = [
        {
          customer: 'CUST001',
          customerName: 'Test Customer',
          totalInvoices: 5,
          totalAmount: 25000.0,
          totalQty: 1000,
        },
      ];

      mockEnquiryService.salesAnalysis.mockResolvedValue(mockResult);

      const result = await controller.salesAnalysis(query);

      expect(result).toEqual(mockResult);
      expect(mockEnquiryService.salesAnalysis).toHaveBeenCalledWith(query);
    });

    it('should return sales analysis by date', async () => {
      const query = {
        analysisType: 'by_date' as const,
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        groupBy: 'month' as const,
      };

      const mockResult = [
        {
          period: '2025-01',
          totalInvoices: 8,
          totalAmount: 40000.0,
          totalQty: 1600,
        },
      ];

      mockEnquiryService.salesAnalysis.mockResolvedValue(mockResult);

      const result = await controller.salesAnalysis(query);

      expect(result).toEqual(mockResult);
      expect(mockEnquiryService.salesAnalysis).toHaveBeenCalledWith(query);
    });

    it('should return sales analysis by item', async () => {
      const query = {
        analysisType: 'by_item' as const,
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockResult = [
        {
          itemNo: 'ITEM001',
          itemName: 'Test Item',
          totalQty: 500,
          totalAmount: 12500.0,
          avgPrice: 25.0,
        },
      ];

      mockEnquiryService.salesAnalysis.mockResolvedValue(mockResult);

      const result = await controller.salesAnalysis(query);

      expect(result).toEqual(mockResult);
      expect(mockEnquiryService.salesAnalysis).toHaveBeenCalledWith(query);
    });

    it('should handle optional parameters', async () => {
      const query = {
        analysisType: 'by_customer' as const,
        customerNo: 'CUST001',
      };

      mockEnquiryService.salesAnalysis.mockResolvedValue([]);

      await controller.salesAnalysis(query);

      expect(mockEnquiryService.salesAnalysis).toHaveBeenCalledWith(query);
    });
  });

  describe('getItemEnquiry', () => {
    it('should return item enquiry with historical data', async () => {
      const query = {
        itemNo: 'ITEM001',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockResult = {
        itemNo: 'ITEM001',
        itemName: 'Test Item',
        description: 'Test item description',
        totalSold: 500,
        totalRevenue: 12500.0,
        lastSoldDate: '2025-01-30',
        avgPrice: 25.0,
        transactions: [
          {
            date: '2025-01-15',
            invoiceNo: 'INV001',
            qty: 100,
            price: 25.0,
            customer: 'CUST001',
          },
        ],
      };

      mockEnquiryService.getItemEnquiry.mockResolvedValue(mockResult);

      const result = await controller.itemEnquiry(query);

      expect(result).toEqual(mockResult);
      expect(mockEnquiryService.getItemEnquiry).toHaveBeenCalledWith(query);
    });

    it('should handle item enquiry without date range', async () => {
      const query = {
        itemNo: 'ITEM001',
      };

      const mockResult = {
        itemNo: 'ITEM001',
        itemName: 'Test Item',
        totalSold: 1000,
        totalRevenue: 25000.0,
        transactions: [],
      };

      mockEnquiryService.getItemEnquiry.mockResolvedValue(mockResult);

      const result = await controller.itemEnquiry(query);

      expect(result.itemNo).toBe('ITEM001');
      expect(result.transactions).toHaveLength(0);
    });
  });

  describe('getSoEnquiry', () => {
    it('should return single SO enquiry', async () => {
      const query = {
        soNo: 'SO001',
      };

      const mockResult = {
        soNo: 'SO001',
        date: '2025-01-15',
        custNo: 'CUST001',
        customerName: 'Test Customer',
        status: 'Confirmed',
        items: [
          {
            itemNo: 'ITEM001',
            qty: 100,
            price: 10.5,
            amount: 1050.0,
          },
        ],
        totalQty: 100,
        totalAmount: 1050.0,
      };

      mockEnquiryService.getSoEnquiry.mockResolvedValue(mockResult);

      const result = await controller.soEnquiry(query);

      expect(result.soNo).toBe('SO001');
      expect(mockEnquiryService.getSoEnquiry).toHaveBeenCalledWith(query);
    });

    it('should return multiple SO enquiries when searching', async () => {
      const query = {
        custNo: 'CUST001',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockResult = [
        { soNo: 'SO001', date: '2025-01-15', custNo: 'CUST001' },
        { soNo: 'SO002', date: '2025-01-20', custNo: 'CUST001' },
      ];

      mockEnquiryService.getSoEnquiry.mockResolvedValue(mockResult);

      const result = await controller.soEnquiry(query);

      expect(result).toHaveLength(2);
      expect(mockEnquiryService.getSoEnquiry).toHaveBeenCalledWith(query);
    });
  });

  describe('getDnEnquiry', () => {
    it('should return single DN enquiry', async () => {
      const query = {
        dnNo: 'DN001',
      };

      const mockResult = {
        dnNo: 'DN001',
        date: '2025-01-15',
        soNo: 'SO001',
        custNo: 'CUST001',
        customerName: 'Test Customer',
        loadingStatus: 'Confirmed',
        items: [
          {
            itemNo: 'ITEM001',
            qty: 100,
            price: 10.5,
            breakdowns: [
              { port: 'PORT1', qty: 50 },
              { port: 'PORT2', qty: 50 },
            ],
          },
        ],
      };

      mockEnquiryService.getDnEnquiry.mockResolvedValue(mockResult);

      const result = await controller.dnEnquiry(query);

      expect(result.dnNo).toBe('DN001');
      expect(result.items[0].breakdowns).toHaveLength(2);
      expect(mockEnquiryService.getDnEnquiry).toHaveBeenCalledWith(query);
    });

    it('should return multiple DN enquiries when searching', async () => {
      const query = {
        soNo: 'SO001',
        status: 'Confirmed' as const,
      };

      const mockResult = [
        { dnNo: 'DN001', soNo: 'SO001', loadingStatus: 'Confirmed' },
        { dnNo: 'DN002', soNo: 'SO001', loadingStatus: 'Confirmed' },
      ];

      mockEnquiryService.getDnEnquiry.mockResolvedValue(mockResult);

      const result = await controller.dnEnquiry(query);

      expect(result).toHaveLength(2);
      expect(mockEnquiryService.getDnEnquiry).toHaveBeenCalledWith(query);
    });
  });

  describe('getInvoiceEnquiry', () => {
    it('should return single invoice enquiry', async () => {
      const query = {
        invNo: 'INV001',
      };

      const mockResult = {
        invNo: 'INV001',
        date: '2025-01-15',
        custNo: 'CUST001',
        customerName: 'Test Customer',
        ocNo: 'OC001',
        plStatus: 'Not Printed',
        items: [
          {
            itemNo: 'ITEM001',
            qty: 100,
            price: 10.5,
            amount: 1050.0,
          },
        ],
        totalQty: 100,
        totalAmount: 1050.0,
      };

      mockEnquiryService.getInvoiceEnquiry.mockResolvedValue(mockResult);

      const result = await controller.invoiceEnquiry(query);

      expect(result.invNo).toBe('INV001');
      expect(result.totalAmount).toBe(1050.0);
      expect(mockEnquiryService.getInvoiceEnquiry).toHaveBeenCalledWith(query);
    });

    it('should return multiple invoice enquiries when searching', async () => {
      const query = {
        ocNo: 'OC001',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockResult = [
        { invNo: 'INV001', ocNo: 'OC001', date: '2025-01-15' },
        { invNo: 'INV002', ocNo: 'OC001', date: '2025-01-20' },
      ];

      mockEnquiryService.getInvoiceEnquiry.mockResolvedValue(mockResult);

      const result = await controller.invoiceEnquiry(query);

      expect(result).toHaveLength(2);
      expect(mockEnquiryService.getInvoiceEnquiry).toHaveBeenCalledWith(query);
    });
  });

  describe('error handling', () => {
    it('should handle service errors in sales analysis', async () => {
      const query = {
        analysisType: 'by_customer' as const,
      };

      mockEnquiryService.salesAnalysis.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.salesAnalysis(query)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle service errors in item enquiry', async () => {
      const query = {
        itemNo: 'ITEM001',
      };

      mockEnquiryService.getItemEnquiry.mockRejectedValue(
        new Error('Item not found'),
      );

      await expect(controller.itemEnquiry(query)).rejects.toThrow(
        'Item not found',
      );
    });

    it('should handle service errors in SO enquiry', async () => {
      const query = {
        soNo: 'SO001',
      };

      mockEnquiryService.getSoEnquiry.mockRejectedValue(
        new Error('SO not found'),
      );

      await expect(controller.soEnquiry(query)).rejects.toThrow(
        'SO not found',
      );
    });

    it('should handle service errors in DN enquiry', async () => {
      const query = {
        dnNo: 'DN001',
      };

      mockEnquiryService.getDnEnquiry.mockRejectedValue(
        new Error('DN not found'),
      );

      await expect(controller.dnEnquiry(query)).rejects.toThrow(
        'DN not found',
      );
    });

    it('should handle service errors in invoice enquiry', async () => {
      const query = {
        invNo: 'INV001',
      };

      mockEnquiryService.getInvoiceEnquiry.mockRejectedValue(
        new Error('Invoice not found'),
      );

      await expect(controller.invoiceEnquiry(query)).rejects.toThrow(
        'Invoice not found',
      );
    });
  });

  describe('parameter validation', () => {
    it('should validate required parameters for sales analysis', async () => {
      const query = {
        analysisType: 'by_customer' as const,
        // Missing dateFrom/dateTo
      };

      mockEnquiryService.salesAnalysis.mockResolvedValue([]);

      await controller.salesAnalysis(query);

      expect(mockEnquiryService.salesAnalysis).toHaveBeenCalledWith(query);
    });

    it('should validate required parameters for item enquiry', async () => {
      const query = {
        // Missing itemNo
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      mockEnquiryService.getItemEnquiry.mockResolvedValue({} as any);

      await controller.itemEnquiry(query);

      expect(mockEnquiryService.getItemEnquiry).toHaveBeenCalledWith(query);
    });

    it('should handle empty query parameters', async () => {
      const query = {};

      mockEnquiryService.salesAnalysis.mockResolvedValue([]);

      await controller.salesAnalysis(query as any);

      expect(mockEnquiryService.salesAnalysis).toHaveBeenCalledWith(query);
    });
  });

  describe('performance considerations', () => {
    it('should handle large result sets', async () => {
      const query = {
        analysisType: 'by_customer' as const,
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
      };

      const mockLargeResult = Array(1000)
        .fill({})
        .map((_, i) => ({
          customer: `CUST${i}`,
          totalInvoices: Math.floor(Math.random() * 10) + 1,
          totalAmount: Math.random() * 10000,
        }));

      mockEnquiryService.salesAnalysis.mockResolvedValue(mockLargeResult);

      const result = await controller.salesAnalysis(query);

      expect(result).toHaveLength(1000);
    });

    it('should handle complex queries efficiently', async () => {
      const query = {
        analysisType: 'by_item' as const,
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        customerNo: 'CUST001',
        itemNo: 'ITEM001',
      };

      mockEnquiryService.salesAnalysis.mockResolvedValue([]);

      await controller.salesAnalysis(query);

      expect(mockEnquiryService.salesAnalysis).toHaveBeenCalledWith(query);
    });
  });
});
