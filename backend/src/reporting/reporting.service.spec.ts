import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReportingService } from './reporting.service';
import { ReportDefinition } from './entities/report-definition.entity';
import { GenerateReportDto } from './dto/generate-report.dto';

/**
 * Reporting Service Tests
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Test report definition CRUD
 *   - Test report preview functionality
 *   - Test report generation (PDF/Excel)
 *   - Test SQL query validation
 *   - Test parameter validation
 *
 * Reference: Phase 3 - Reporting Module
 */
describe('ReportingService', () => {
  let service: ReportingService;
  let reportDefinitionRepository: Repository<ReportDefinition>;
  let dataSource: DataSource;

  const mockReportDefinitionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportingService,
        {
          provide: getRepositoryToken(ReportDefinition),
          useValue: mockReportDefinitionRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ReportingService>(ReportingService);
    reportDefinitionRepository = module.get<Repository<ReportDefinition>>(
      getRepositoryToken(ReportDefinition),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllReports', () => {
    it('should return all active reports ordered by category and name', async () => {
      const mockReports = [
        {
          reportKey: 'sales_analysis',
          reportName: 'Sales Analysis',
          category: 'Analysis',
          description: 'Sales analysis report',
          status: 'Active',
        },
        {
          reportKey: 'item_list',
          reportName: 'Item List',
          category: 'Transaction',
          description: 'Item transaction list',
          status: 'Active',
        },
      ];

      mockReportDefinitionRepository.find.mockResolvedValue(mockReports);

      const result = await service.getAllReports();

      expect(result).toHaveLength(2);
      expect(result[0].reportKey).toBe('sales_analysis');
      expect(result[1].reportKey).toBe('item_list');
      expect(mockReportDefinitionRepository.find).toHaveBeenCalledWith({
        where: { status: 'Active' },
        order: { category: 'ASC', reportName: 'ASC' },
      });
    });

    it('should return empty array when no active reports', async () => {
      mockReportDefinitionRepository.find.mockResolvedValue([]);

      const result = await service.getAllReports();

      expect(result).toEqual([]);
    });
  });

  describe('getReportDefinition', () => {
    it('should return report definition by key', async () => {
      const mockReport = {
        reportKey: 'sales_analysis',
        reportName: 'Sales Analysis',
        category: 'Analysis',
        description: 'Sales analysis report',
        sqlQuery: 'SELECT * FROM sales',
        parameters: { dateFrom: 'date', dateTo: 'date' },
        status: 'Active',
      };

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );

      const result = await service.getReportDefinition('sales_analysis');

      expect(result.reportKey).toBe('sales_analysis');
      expect(result.reportName).toBe('Sales Analysis');
      expect(mockReportDefinitionRepository.findOne).toHaveBeenCalledWith({
        where: { reportKey: 'sales_analysis' },
      });
    });

    it('should throw error for non-existent report', async () => {
      mockReportDefinitionRepository.findOne.mockResolvedValue(null);

      await expect(service.getReportDefinition('non_existent')).rejects.toThrow(
        'Report non_existent not found',
      );
    });
  });

  describe('previewReport', () => {
    it('should generate report preview with limited data', async () => {
      const generateDto: GenerateReportDto = {
        reportKey: 'sales_analysis',
        parameters: {
          dateFrom: '2025-01-01',
          dateTo: '2025-01-31',
        },
      };

      const mockReport = {
        reportKey: 'sales_analysis',
        reportName: 'Sales Analysis',
        sqlQuery:
          'SELECT customer, SUM(amount) as total FROM sales WHERE date BETWEEN :dateFrom AND :dateTo GROUP BY customer',
        parameters: { dateFrom: 'date', dateTo: 'date' },
      };

      const mockData = [
        { customer: 'CUST001', total: 15000 },
        { customer: 'CUST002', total: 25000 },
        { customer: 'CUST003', total: 18000 },
      ];

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );
      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.previewReport(generateDto);

      expect(result.reportKey).toBe('sales_analysis');
      expect(result.reportName).toBe('Sales Analysis');
      expect(result.data).toHaveLength(3);
      expect(result.totalRows).toBe(3);
      expect(result.columns).toHaveLength(2);
      expect(result.columns[0]).toHaveProperty('name', 'customer');
      expect(result.columns[1]).toHaveProperty('name', 'total');
    });

    it('should limit preview to 100 rows', async () => {
      const generateDto: GenerateReportDto = {
        reportKey: 'large_report',
      };

      const mockReport = {
        reportKey: 'large_report',
        reportName: 'Large Report',
        sqlQuery: 'SELECT * FROM large_table',
      };

      const mockLargeData = Array(150)
        .fill({})
        .map((_, i) => ({ id: i, value: `data${i}` }));

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );
      mockDataSource.query.mockResolvedValue(mockLargeData);

      const result = await service.previewReport(generateDto);

      expect(result.data).toHaveLength(100); // Limited to 100
      expect(result.totalRows).toBe(150); // Total is still 150
    });

    it('should infer column types correctly', async () => {
      const generateDto: GenerateReportDto = {
        reportKey: 'mixed_types',
      };

      const mockReport = {
        reportKey: 'mixed_types',
        sqlQuery: 'SELECT * FROM mixed_table',
      };

      const mockData = [
        {
          id: 1,
          name: 'Test',
          price: 25.5,
          active: true,
          created: new Date('2025-01-01'),
        },
      ];

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );
      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.previewReport(generateDto);

      expect(result.columns[0]).toEqual({
        name: 'id',
        label: 'Id',
        type: 'integer',
      });
      expect(result.columns[1]).toEqual({
        name: 'name',
        label: 'Name',
        type: 'string',
      });
      expect(result.columns[2]).toEqual({
        name: 'price',
        label: 'Price',
        type: 'decimal',
      });
      expect(result.columns[3]).toEqual({
        name: 'active',
        label: 'Active',
        type: 'boolean',
      });
      expect(result.columns[4]).toEqual({
        name: 'created',
        label: 'Created',
        type: 'date',
      });
    });
  });

  describe('generateReport', () => {
    it('should generate Excel report', async () => {
      const generateDto: GenerateReportDto = {
        reportKey: 'sales_report',
        outputFormat: 'excel',
      };

      const mockReport = {
        reportKey: 'sales_report',
        reportName: 'Sales Report',
        sqlQuery: 'SELECT * FROM sales',
      };

      const mockData = [
        { customer: 'CUST001', amount: 15000 },
        { customer: 'CUST002', amount: 25000 },
      ];

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );
      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.generateReport(generateDto);

      expect(result.reportKey).toBe('sales_report');
      expect(result.reportName).toBe('Sales Report');
      expect(result.format).toBe('excel');
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.fileBuffer).toBeInstanceOf(Buffer);
      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it('should generate PDF report', async () => {
      const generateDto: GenerateReportDto = {
        reportKey: 'sales_report',
        outputFormat: 'pdf',
      };

      const mockReport = {
        reportKey: 'sales_report',
        reportName: 'Sales Report',
        sqlQuery: 'SELECT * FROM sales',
      };

      const mockData = [{ customer: 'CUST001', amount: 15000 }];

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );
      mockDataSource.query.mockResolvedValue(mockData);

      const result = await service.generateReport(generateDto);

      expect(result.format).toBe('pdf');
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.fileBuffer).toBeInstanceOf(Buffer);
    });

    it('should use custom file name when provided', async () => {
      const generateDto: GenerateReportDto = {
        reportKey: 'sales_report',
        outputFormat: 'excel',
        fileName: 'Custom_Sales_Report.xlsx',
      };

      const mockReport = {
        reportKey: 'sales_report',
        reportName: 'Sales Report',
        sqlQuery: 'SELECT * FROM sales',
      };

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );
      mockDataSource.query.mockResolvedValue([]);

      const result = await service.generateReport(generateDto);

      expect(result.fileName).toBe('Custom_Sales_Report.xlsx');
    });

    it('should generate default file name when not provided', async () => {
      const generateDto: GenerateReportDto = {
        reportKey: 'sales_report',
        outputFormat: 'excel',
      };

      const mockReport = {
        reportKey: 'sales_report',
        reportName: 'Sales Report',
        sqlQuery: 'SELECT * FROM sales',
      };

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );
      mockDataSource.query.mockResolvedValue([]);

      const result = await service.generateReport(generateDto);

      expect(result.fileName).toContain('sales_report');
      expect(result.fileName).toContain('.xlsx');
      expect(result.fileName).toContain(new Date().toISOString().split('T')[0]);
    });

    it('should throw error for unsupported format', async () => {
      const generateDto: GenerateReportDto = {
        reportKey: 'sales_report',
        outputFormat: 'invalid' as any,
      };

      const mockReport = {
        reportKey: 'sales_report',
        sqlQuery: 'SELECT * FROM sales',
      };

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );

      await expect(service.generateReport(generateDto)).rejects.toThrow(
        'Unsupported output format',
      );
    });

    it('should throw error when no data found', async () => {
      const generateDto: GenerateReportDto = {
        reportKey: 'empty_report',
      };

      const mockReport = {
        reportKey: 'empty_report',
        sqlQuery: 'SELECT * FROM empty_table',
      };

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );
      mockDataSource.query.mockResolvedValue([]);

      await expect(service.generateReport(generateDto)).rejects.toThrow(
        'No data found for report generation',
      );
    });
  });

  describe('buildQuery', () => {
    it('should replace parameter placeholders correctly', async () => {
      const sqlTemplate =
        'SELECT * FROM sales WHERE date BETWEEN :dateFrom AND :dateTo AND customer = :customer';
      const parameters = {
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        customer: 'CUST001',
      };

      const result = (service as any).buildQuery(sqlTemplate, parameters);

      expect(result.query).toBe(
        'SELECT * FROM sales WHERE date BETWEEN $1 AND $2 AND customer = $3',
      );
      expect(result.parameters).toEqual([
        '2025-01-01',
        '2025-01-31',
        'CUST001',
      ]);
    });

    it('should handle parameters not in query', async () => {
      const sqlTemplate = 'SELECT * FROM sales';
      const parameters = {
        unusedParam: 'value',
      };

      const result = (service as any).buildQuery(sqlTemplate, parameters);

      expect(result.query).toBe('SELECT * FROM sales');
      expect(result.parameters).toEqual([]);
    });

    it('should handle empty parameters', async () => {
      const sqlTemplate = 'SELECT * FROM sales';
      const parameters = {};

      const result = (service as any).buildQuery(sqlTemplate, parameters);

      expect(result.query).toBe('SELECT * FROM sales');
      expect(result.parameters).toEqual([]);
    });
  });

  describe('formatColumnLabel', () => {
    it('should format column names properly', async () => {
      expect((service as any).formatColumnLabel('customer_name')).toBe(
        'Customer Name',
      );
      expect((service as any).formatColumnLabel('total_amount')).toBe(
        'Total Amount',
      );
      expect((service as any).formatColumnLabel('item_no')).toBe('Item No');
      expect((service as any).formatColumnLabel('id')).toBe('Id');
    });

    it('should handle single word columns', async () => {
      expect((service as any).formatColumnLabel('name')).toBe('Name');
    });

    it('should handle empty string', async () => {
      expect((service as any).formatColumnLabel('')).toBe('');
    });
  });

  describe('inferColumnType', () => {
    it('should infer integer type', async () => {
      expect((service as any).inferColumnType(42)).toBe('integer');
      expect((service as any).inferColumnType(0)).toBe('integer');
      expect((service as any).inferColumnType(-1)).toBe('integer');
    });

    it('should infer decimal type', async () => {
      expect((service as any).inferColumnType(42.5)).toBe('decimal');
      expect((service as any).inferColumnType(0.0)).toBe('decimal');
      expect((service as any).inferColumnType(-1.5)).toBe('decimal');
    });

    it('should infer string type', async () => {
      expect((service as any).inferColumnType('hello')).toBe('string');
      expect((service as any).inferColumnType('')).toBe('string');
      expect((service as any).inferColumnType('42')).toBe('string');
    });

    it('should infer boolean type', async () => {
      expect((service as any).inferColumnType(true)).toBe('boolean');
      expect((service as any).inferColumnType(false)).toBe('boolean');
    });

    it('should infer date type', async () => {
      expect((service as any).inferColumnType(new Date())).toBe('date');
    });

    it('should infer unknown type for null/undefined', async () => {
      expect((service as any).inferColumnType(null)).toBe('unknown');
      expect((service as any).inferColumnType(undefined)).toBe('unknown');
    });
  });

  describe('generateExcel', () => {
    it('should generate Excel file with proper structure', async () => {
      const mockReport = {
        reportName: 'Test Report',
      };

      const mockData = [
        { name: 'Item 1', value: 100 },
        { name: 'Item 2', value: 200 },
      ];

      const result = await (service as any).generateExcel(mockReport, mockData);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty data', async () => {
      const mockReport = {
        reportName: 'Empty Report',
      };

      const result = await (service as any).generateExcel(mockReport, []);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('generatePdf', () => {
    it('should generate PDF with report content', async () => {
      const mockReport = {
        reportName: 'Test Report',
      };

      const mockData = [{ name: 'Item 1', value: 100 }];

      const result = await (service as any).generatePdf(mockReport, mockData);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
      const content = result.toString();
      expect(content).toContain('Test Report');
      expect(content).toContain('Item 1');
    });

    it('should limit large datasets in PDF', async () => {
      const mockReport = {
        reportName: 'Large Report',
      };

      const mockLargeData = Array(2000)
        .fill({})
        .map((_, i) => ({ id: i, value: `data${i}` }));

      const result = await (service as any).generatePdf(
        mockReport,
        mockLargeData,
      );

      const content = result.toString();
      expect(content).toContain('(Showing first 1000 of 2000 rows)');
    });
  });
});
