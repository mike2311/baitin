import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { EnquiryService } from './enquiry.service';

/**
 * Enquiry Service Tests
 *
 * Original Logic Reference:
 * - Legacy Reports: Sales analysis, item enquiries, SO/DN/Invoice enquiries
 * - Documentation: docs/modernization-strategy/09-reporting-analytics/reporting-analytics.md
 * - Business Rules:
 *   - Test sales analysis queries
 *   - Test item enquiry with historical data
 *   - Test SO/DN/Invoice operational enquiries
 *   - Test query performance with large datasets
 *   - Test date range filtering
 *
 * Reference: Phase 3 - Enquiry Module
 */
describe('EnquiryService', () => {
  let service: EnquiryService;
  let dataSource: DataSource;

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnquiryService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<EnquiryService>(EnquiryService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSalesAnalysis', () => {
    it('should return sales analysis by customer', async () => {
      const query: any = {
        analysisType: 'by_customer',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockData = [
        {
          customer: 'CUST001',
          customerName: 'Test Customer',
          totalInvoices: 5,
          totalAmount: 25000.0,
          totalQty: 1000,
        },
        {
          customer: 'CUST002',
          customerName: 'Another Customer',
          totalInvoices: 3,
          totalAmount: 15000.0,
          totalQty: 600,
        },
      ];

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.getSalesAnalysis(query);

      expect(result).toEqual(mockData);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM invoice_header'),
        expect.arrayContaining(['2025-01-01', '2025-01-31']),
      );
    });

    it('should return sales analysis by date', async () => {
      const query: any = {
        analysisType: 'by_date',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        groupBy: 'month',
      };

      const mockData = [
        {
          period: '2025-01',
          totalInvoices: 8,
          totalAmount: 40000.0,
          totalQty: 1600,
        },
        {
          period: '2025-02',
          totalInvoices: 12,
          totalAmount: 60000.0,
          totalQty: 2400,
        },
      ];

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.getSalesAnalysis(query);

      expect(result).toEqual(mockData);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("DATE_TRUNC('month', date)"),
        expect.any(Array),
      );
    });

    it('should return sales analysis by item', async () => {
      const query: any = {
        analysisType: 'by_item',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockData = [
        {
          itemNo: 'ITEM001',
          itemName: 'Test Item',
          totalQty: 500,
          totalAmount: 12500.0,
          avgPrice: 25.0,
        },
        {
          itemNo: 'ITEM002',
          itemName: 'Another Item',
          totalQty: 300,
          totalAmount: 9000.0,
          avgPrice: 30.0,
        },
      ];

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.getSalesAnalysis(query);

      expect(result).toEqual(mockData);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM invoice_detail'),
        expect.any(Array),
      );
    });

    it('should filter by customer when specified', async () => {
      const query: any = {
        analysisType: 'by_customer',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        customerNo: 'CUST001',
      };

      mockDataSource.query.mockResolvedValue([]);

      await service.getSalesAnalysis(query);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('AND i.cust_no ='),
        expect.arrayContaining(['CUST001']),
      );
    });

    it('should filter by item when specified', async () => {
      const query: any = {
        analysisType: 'by_item',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        itemNo: 'ITEM001',
      };

      mockDataSource.query.mockResolvedValue([]);

      await service.getSalesAnalysis(query);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('AND id.item_no ='),
        expect.arrayContaining(['ITEM001']),
      );
    });
  });

  describe('getItemEnquiry', () => {
    it('should return item enquiry with historical data', async () => {
      const query: any = {
        itemNo: 'ITEM001',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockData = [
        {
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
            {
              date: '2025-01-30',
              invoiceNo: 'INV002',
              qty: 200,
              price: 25.0,
              customer: 'CUST002',
            },
          ],
        },
      ];

      mockDataSource.query.mockResolvedValueOnce(mockData[0]); // Item summary
      mockDataSource.query.mockResolvedValueOnce(mockData[0].transactions); // Transactions

      const result = await service.getItemEnquiry(query);

      expect(result.itemNo).toBe('ITEM001');
      expect(result.transactions).toHaveLength(2);
      expect(mockDataSource.query).toHaveBeenCalledTimes(2);
    });

    it('should return item summary without transactions when no date range', async () => {
      const query: any = {
        itemNo: 'ITEM001',
      };

      const mockData = {
        itemNo: 'ITEM001',
        itemName: 'Test Item',
        totalSold: 1000,
        totalRevenue: 25000.0,
        lastSoldDate: '2025-01-30',
        avgPrice: 25.0,
      };

      mockDataSource.query.mockResolvedValueOnce(mockData);
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.getItemEnquiry(query);

      expect(result.itemNo).toBe('ITEM001');
      expect(result.transactions).toHaveLength(0);
    });

    it('should limit transaction history to prevent large responses', async () => {
      const query: any = {
        itemNo: 'ITEM001',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockTransactions = Array(200)
        .fill({})
        .map((_, i) => ({
          date: `2025-01-${String(i + 1).padStart(2, '0')}`,
          invoiceNo: `INV${i + 1}`,
          qty: 10,
          price: 25.0,
          customer: 'CUST001',
        }));

      mockDataSource.query.mockResolvedValueOnce({});
      mockDataSource.query.mockResolvedValueOnce(mockTransactions);

      const result = await service.getItemEnquiry(query);

      expect(result.transactions).toHaveLength(100); // Limited to 100
    });
  });

  describe('getSoEnquiry', () => {
    it('should return SO enquiry with details', async () => {
      const query: any = {
        soNo: 'SO001',
      };

      const mockData = {
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
          {
            itemNo: 'ITEM002',
            qty: 200,
            price: 8.75,
            amount: 1750.0,
          },
        ],
        totalQty: 300,
        totalAmount: 2800.0,
      };

      mockDataSource.query.mockResolvedValueOnce(mockData);
      mockDataSource.query.mockResolvedValueOnce(mockData.items);

      const result = await service.getSoEnquiry(query);

      expect(result.soNo).toBe('SO001');
      expect(result.items).toHaveLength(2);
      expect(result.totalQty).toBe(300);
      expect(result.totalAmount).toBe(2800.0);
    });

    it('should search SOs by customer and date range', async () => {
      const query: any = {
        custNo: 'CUST001',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockData = [
        {
          soNo: 'SO001',
          date: '2025-01-15',
          custNo: 'CUST001',
          status: 'Draft',
        },
        {
          soNo: 'SO002',
          date: '2025-01-20',
          custNo: 'CUST001',
          status: 'Confirmed',
        },
      ];

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.getSoEnquiry(query);

      expect(result).toHaveLength(2);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM shipping_order'),
        expect.arrayContaining(['CUST001', '2025-01-01', '2025-01-31']),
      );
    });
  });

  describe('getDnEnquiry', () => {
    it('should return DN enquiry with breakdown details', async () => {
      const query: any = {
        dnNo: 'DN001',
      };

      const mockData = {
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

      mockDataSource.query.mockResolvedValueOnce(mockData);
      mockDataSource.query.mockResolvedValueOnce(mockData.items);
      mockDataSource.query.mockResolvedValueOnce(mockData.items[0].breakdowns);

      const result = await service.getDnEnquiry(query);

      expect(result.dnNo).toBe('DN001');
      expect(result.items[0].breakdowns).toHaveLength(2);
    });

    it('should search DNs by SO and status', async () => {
      const query: any = {
        soNo: 'SO001',
        status: 'Confirmed',
      };

      const mockData = [
        { dnNo: 'DN001', soNo: 'SO001', loadingStatus: 'Confirmed' },
        { dnNo: 'DN002', soNo: 'SO001', loadingStatus: 'Confirmed' },
      ];

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.getDnEnquiry(query);

      expect(result).toHaveLength(2);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM delivery_note_header'),
        expect.arrayContaining(['SO001', 'Confirmed']),
      );
    });
  });

  describe('getInvoiceEnquiry', () => {
    it('should return invoice enquiry with details', async () => {
      const query: any = {
        invNo: 'INV001',
      };

      const mockData = {
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

      mockDataSource.query.mockResolvedValueOnce(mockData);
      mockDataSource.query.mockResolvedValueOnce(mockData.items);

      const result = await service.getInvoiceEnquiry(query);

      expect(result.invNo).toBe('INV001');
      expect(result.items).toHaveLength(1);
      expect(result.totalAmount).toBe(1050.0);
    });

    it('should search invoices by OC and date range', async () => {
      const query: any = {
        ocNo: 'OC001',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockData = [
        {
          invNo: 'INV001',
          ocNo: 'OC001',
          date: '2025-01-15',
          plStatus: 'Not Printed',
        },
        {
          invNo: 'INV002',
          ocNo: 'OC001',
          date: '2025-01-20',
          plStatus: 'Printed',
        },
      ];

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.getInvoiceEnquiry(query);

      expect(result).toHaveLength(2);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM invoice_header'),
        expect.arrayContaining(['OC001', '2025-01-01', '2025-01-31']),
      );
    });
  });

  describe('performance considerations', () => {
    it('should handle large datasets efficiently', async () => {
      const query: any = {
        analysisType: 'by_customer',
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
      };

      const mockLargeData = Array(1000)
        .fill({})
        .map((_, i) => ({
          customer: `CUST${i}`,
          customerName: `Customer ${i}`,
          totalInvoices: Math.floor(Math.random() * 10) + 1,
          totalAmount: Math.random() * 10000,
          totalQty: Math.floor(Math.random() * 1000) + 100,
        }));

      mockDataSource.query.mockResolvedValue(mockLargeData);

      const startTime = Date.now();
      const result = await service.getSalesAnalysis(query);
      const endTime = Date.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should use appropriate indexes in queries', async () => {
      const query: any = {
        analysisType: 'by_customer',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        customerNo: 'CUST001',
      };

      mockDataSource.query.mockResolvedValue([]);

      await service.getSalesAnalysis(query);

      const queryCall = mockDataSource.query.mock.calls[0][0];
      expect(queryCall).toContain('WHERE'); // Should have WHERE clause for filtering
      expect(queryCall).toContain('ORDER BY'); // Should have ordering for consistent results
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const query: any = {
        analysisType: 'by_customer',
      };

      mockDataSource.query.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.getSalesAnalysis(query)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should validate query parameters', async () => {
      const invalidQuery: any = {
        analysisType: 'invalid_type',
      };

      await expect(service.getSalesAnalysis(invalidQuery)).rejects.toThrow(
        'Invalid analysis type',
      );
    });

    it('should handle empty results', async () => {
      const query: any = {
        analysisType: 'by_customer',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      mockDataSource.query.mockResolvedValue([]);

      const result = await service.getSalesAnalysis(query);

      expect(result).toEqual([]);
    });
  });
});
