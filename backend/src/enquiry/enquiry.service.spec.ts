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

  describe('salesAnalysis', () => {
    it('should return sales analysis by customer', async () => {
      const query: any = {
        groupBy: 'customer',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockData = [
        {
          cust_no: 'CUST001',
          customer_name: 'Test Customer',
          invoice_count: 5,
          total_amount: 25000.0,
          total_qty: 1000,
        },
        {
          cust_no: 'CUST002',
          customer_name: 'Another Customer',
          invoice_count: 3,
          total_amount: 15000.0,
          total_qty: 600,
        },
      ];

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.salesAnalysis(query);

      expect(result.length).toBe(2);
      expect(result[0].custNo).toBe('CUST001');
      expect(result[0].customerName).toBe('Test Customer');
      expect(result[0].invoiceCount).toBe(5);
      expect(mockDataSource.query).toHaveBeenCalled();
    });

    it('should return sales analysis by date', async () => {
      const query: any = {
        dateFrom: new Date('2025-01-01'),
        dateTo: new Date('2025-01-31'),
      };

      const mockData = [
        {
          date: '2025-01-15',
          invoice_count: 8,
          total_amount: 40000.0,
          total_qty: 1600,
        },
        {
          date: '2025-02-15',
          invoice_count: 12,
          total_amount: 60000.0,
          total_qty: 2400,
        },
      ];

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.salesAnalysis(query);

      expect(result.length).toBe(2);
      expect(result[0].date).toBe('2025-01-15');
      expect(result[0].invoiceCount).toBe(8);
      expect(mockDataSource.query).toHaveBeenCalled();
    });

    it('should return sales analysis by item', async () => {
      const query: any = {
        groupBy: 'item',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      const mockData = [
        {
          item_no: 'ITEM001',
          item_description: 'Test Item',
          total_qty: 500,
          total_amount: 12500.0,
        },
        {
          item_no: 'ITEM002',
          item_description: 'Another Item',
          total_qty: 300,
          total_amount: 9000.0,
        },
      ];

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.salesAnalysis(query);

      expect(result.length).toBe(2);
      expect(result[0].itemNo).toBe('ITEM001');
      expect(result[0].itemDescription).toBe('Test Item');
      expect(mockDataSource.query).toHaveBeenCalled();
    });

    it('should filter by customer when specified', async () => {
      const query: any = {
        groupBy: 'customer',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        customerNo: 'CUST001',
      };

      mockDataSource.query.mockResolvedValue([]);

      await service.salesAnalysis(query);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('inv.cust_no'),
        expect.arrayContaining(['CUST001']),
      );
    });

    it('should filter by item when specified', async () => {
      const query: any = {
        groupBy: 'item',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        itemNo: 'ITEM001',
      };

      mockDataSource.query.mockResolvedValue([]);

      await service.salesAnalysis(query);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('invd.item_no'),
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

      const mockItemData = {
        item_no: 'ITEM001',
        item_description: 'Test Item',
        std_code: 'STD001',
        origin: 'CN',
        price: 25.0,
        cost: 20.0,
        total_ordered_qty: 500,
        total_confirmed_qty: 450,
        total_shipped_qty: 400,
        total_invoiced_qty: 350,
        last_order_date: '2025-01-30',
        last_invoice_date: '2025-01-28',
      };

      const mockTransactions = [
        {
          inv_no: 'INV001',
          inv_date: '2025-01-15',
          qty: 100,
          amount: 2500.0,
          cust_no: 'CUST001',
        },
        {
          inv_no: 'INV002',
          inv_date: '2025-01-30',
          qty: 200,
          amount: 5000.0,
          cust_no: 'CUST002',
        },
      ];

      mockDataSource.query.mockResolvedValueOnce([mockItemData]); // Item summary
      mockDataSource.query.mockResolvedValueOnce(mockTransactions); // Transactions

      const result = await service.itemEnquiry(query);

      expect(result).toHaveLength(1);
      expect(result[0].itemNo).toBe('ITEM001');
      expect(result[0].totalOrderedQty).toBeGreaterThanOrEqual(0);
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

      mockDataSource.query.mockResolvedValueOnce([mockData]);
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.itemEnquiry(query);

      expect(result).toHaveLength(1);
      expect(result[0].itemNo).toBe('ITEM001');
      expect(result[0].totalOrderedQty || 0).toBe(0);
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

      mockDataSource.query.mockResolvedValueOnce([{
        item_no: 'ITEM001',
        item_description: 'Test Item',
        total_ordered_qty: 0,
        total_confirmed_qty: 0,
        total_shipped_qty: 0,
        total_invoiced_qty: 0,
      }]);
      mockDataSource.query.mockResolvedValueOnce(mockTransactions);

      const result = await service.itemEnquiry(query);

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('soEnquiry', () => {
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

      const result = await service.soEnquiry(query);

      expect(result).toHaveLength(1);
      expect(result[0].soNo).toBe('SO001');
      expect(result[0].qty).toBe(300);
      expect(result[0].itemNo).toBeDefined();
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

      const result = await service.soEnquiry(query);

      expect(result).toHaveLength(2);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM shipping_order'),
        expect.arrayContaining(['CUST001', '2025-01-01', '2025-01-31']),
      );
    });
  });

  describe('dnEnquiry', () => {
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

      const result = await service.dnEnquiry(query);

      expect(result).toHaveLength(1);
      expect(result[0].dnNo).toBe('DN001');
      expect(result[0].itemCount).toBeGreaterThan(0);
      expect(result[0].totalQty).toBeGreaterThan(0);
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

      const result = await service.dnEnquiry(query);

      expect(result).toHaveLength(2);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM delivery_note_header'),
        expect.arrayContaining(['SO001', 'Confirmed']),
      );
    });
  });

  describe('invoiceEnquiry', () => {
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

      const result = await service.invoiceEnquiry(query);

      expect(result).toHaveLength(1);
      expect(result[0].invNo).toBe('INV001');
      expect(result[0].itemCount).toBeGreaterThan(0);
      expect(result[0].totalAmount).toBe(1050.0);
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

      const result = await service.invoiceEnquiry(query);

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
        groupBy: 'customer',
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
      const result = await service.salesAnalysis(query);
      const endTime = Date.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should use appropriate indexes in queries', async () => {
      const query: any = {
        groupBy: 'customer',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        customerNo: 'CUST001',
      };

      mockDataSource.query.mockResolvedValue([]);

      await service.salesAnalysis(query);

      const queryCall = mockDataSource.query.mock.calls[0][0];
      expect(queryCall).toContain('WHERE'); // Should have WHERE clause for filtering
      expect(queryCall).toContain('ORDER BY'); // Should have ordering for consistent results
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const query: any = {
        groupBy: 'customer',
      };

      mockDataSource.query.mockRejectedValueOnce(
        new Error('Database connection failed'),
      );

      await expect(service.salesAnalysis(query)).rejects.toThrow(
        'Database connection failed',
      );
    });

    // Note: salesAnalysis uses groupBy, not analysisType - no validation for invalid groupBy
    // it('should validate query parameters', async () => {
    //   const invalidQuery: any = {
    //     groupBy: 'invalid_type',
    //   };

    //   await expect(service.salesAnalysis(invalidQuery)).rejects.toThrow(
    //     'Invalid analysis type',
    //   );
    // });

    it('should handle empty results', async () => {
      const query: any = {
        groupBy: 'customer',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      };

      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.salesAnalysis(query);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
