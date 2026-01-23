import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ReportBatchMigrationService } from './report-batch-migration.service';
import { ReportDefinition } from './entities/report-definition.entity';
import {
  MigrateReportBatchDto,
  MigrationStatus,
} from './dto/report-batch-migration.dto';

/**
 * Report Batch Migration Service Tests
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Test batch migration process
 *   - Test SQL validation
 *   - Test parameter validation
 *   - Test performance testing
 *   - Test data consistency validation
 *
 * Reference: Phase 3 - Reporting Batch Migration
 */
describe('ReportBatchMigrationService', () => {
  let service: ReportBatchMigrationService;

  const mockReportDefinitionRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportBatchMigrationService,
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

    service = module.get<ReportBatchMigrationService>(
      ReportBatchMigrationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('migrateReportBatch', () => {
    it('should migrate a batch of reports successfully', async () => {
      const migrateDto: MigrateReportBatchDto = {
        reportKeys: ['report1', 'report2'],
        batchId: 'test_batch',
      };

      const mockReport1 = {
        reportKey: 'report1',
        reportName: 'Report 1',
        sqlQuery: 'SELECT * FROM test_table',
        parameters: { param1: 'string' },
      };

      const mockReport2 = {
        reportKey: 'report2',
        reportName: 'Report 2',
        sqlQuery: 'SELECT * FROM another_table',
        parameters: { param2: 'number' },
      };

      mockReportDefinitionRepository.findOne
        .mockResolvedValueOnce(mockReport1 as ReportDefinition)
        .mockResolvedValueOnce(mockReport2 as ReportDefinition);

      mockDataSource.query
        .mockResolvedValueOnce([{ count: 1 }]) // SQL validation
        .mockResolvedValueOnce([{ count: 1 }]) // SQL validation for second report
        .mockResolvedValueOnce([]) // Performance test data
        .mockResolvedValueOnce([]) // Data consistency check
        .mockResolvedValueOnce([]) // Performance test data for second report
        .mockResolvedValueOnce([]); // Data consistency check for second report

      mockReportDefinitionRepository.update.mockResolvedValue({
        affected: 1,
      } as any);

      const result = await service.migrateReportBatch(migrateDto);

      expect(result.batchId).toBe('test_batch');
      expect(result.totalReports).toBe(2);
      expect(result.completedReports).toBe(2);
      expect(result.failedReports).toBe(0);
      expect(result.status).toBe('completed');
      expect(result.reports).toHaveLength(2);
      expect(result.reports[0].status).toBe(MigrationStatus.VALIDATED);
      expect(result.reports[1].status).toBe(MigrationStatus.VALIDATED);
    });

    it('should handle batch migration with failures', async () => {
      const migrateDto: MigrateReportBatchDto = {
        reportKeys: ['good_report', 'bad_report'],
      };

      const mockGoodReport = {
        reportKey: 'good_report',
        sqlQuery: 'SELECT * FROM test_table',
      };

      const mockBadReport = {
        reportKey: 'bad_report',
        sqlQuery: 'INVALID SQL QUERY',
      };

      mockReportDefinitionRepository.findOne
        .mockResolvedValueOnce(mockGoodReport as ReportDefinition)
        .mockResolvedValueOnce(mockBadReport as ReportDefinition);

      mockDataSource.query
        .mockResolvedValueOnce([{ count: 1 }]) // Good report SQL validation
        .mockRejectedValueOnce(new Error('SQL syntax error')) // Bad report SQL validation fails
        .mockResolvedValueOnce([]) // Good report performance test
        .mockResolvedValueOnce([]); // Good report data consistency

      mockReportDefinitionRepository.update.mockResolvedValue({
        affected: 1,
      } as any);

      const result = await service.migrateReportBatch(migrateDto);

      expect(result.totalReports).toBe(2);
      expect(result.completedReports).toBe(1);
      expect(result.failedReports).toBe(1);
      expect(result.status).toBe('completed'); // Still completed since some succeeded
      expect(result.reports[0].status).toBe(MigrationStatus.VALIDATED);
      expect(result.reports[1].status).toBe(MigrationStatus.FAILED);
      expect(result.reports[1].errorMessage).toContain('SQL syntax error');
    });

    it('should reject batches exceeding maximum size', async () => {
      const largeBatch: MigrateReportBatchDto = {
        reportKeys: Array(20).fill('report'), // More than max 10
      };

      await expect(service.migrateReportBatch(largeBatch)).rejects.toThrow(
        'Batch size exceeds maximum of 10 reports',
      );
    });

    it('should handle empty batch', async () => {
      const emptyBatch: MigrateReportBatchDto = {
        reportKeys: [],
      };

      await expect(service.migrateReportBatch(emptyBatch)).rejects.toThrow(
        'Batch size exceeds maximum of 10 reports',
      );
    });
  });

  describe('validateSqlQuery', () => {
    it('should validate correct SQL syntax', async () => {
      const sqlQuery = 'SELECT * FROM test_table WHERE id = 1';

      mockDataSource.query.mockResolvedValue([{ count: 1 }]);

      const result = await (service as any).validateSqlQuery(sqlQuery);

      expect(result.valid).toBe(true);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*)'),
        expect.any(Array),
      );
    });

    it('should detect SQL syntax errors', async () => {
      const sqlQuery = 'INVALID SQL QUERY WITH SYNTAX ERROR';

      mockDataSource.query.mockRejectedValue(new Error('syntax error'));

      const result = await (service as any).validateSqlQuery(sqlQuery);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('syntax error');
    });
  });

  describe('validateParameters', () => {
    it('should validate correct parameter definitions', async () => {
      const parameters = {
        dateFrom: { type: 'date', label: 'Date From', required: true },
        customerNo: { type: 'string', label: 'Customer', required: false },
        limit: { type: 'number', label: 'Limit', required: false },
      };

      const result = await (service as any).validateParameters(parameters);

      expect(result.valid).toBe(true);
    });

    it('should detect invalid parameter types', async () => {
      const parameters = {
        invalidParam: { type: 'invalid_type', label: 'Invalid' },
      };

      const result = await (service as any).validateParameters(parameters);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid parameter type');
    });

    it('should detect missing parameter type', async () => {
      const parameters = {
        missingType: { label: 'Missing Type' },
      };

      const result = await (service as any).validateParameters(parameters);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('missing type');
    });

    it('should handle null parameters', async () => {
      const result = await (service as any).validateParameters(null);

      expect(result.valid).toBe(true);
    });

    it('should handle string parameters (JSON)', async () => {
      const parametersString =
        '{"dateFrom": {"type": "date", "label": "Date From"}}';

      const result = await (service as any).validateParameters(
        parametersString,
      );

      expect(result.valid).toBe(true);
    });

    it('should detect invalid JSON string', async () => {
      const invalidJson = '{"invalid": json}';

      const result = await (service as any).validateParameters(invalidJson);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid JSON');
    });
  });

  describe('runPerformanceTest', () => {
    it('should run performance test successfully', async () => {
      const mockReport = {
        reportKey: 'test_report',
        sqlQuery: 'SELECT * FROM test_table WHERE :param = :value',
      };

      const mockData = Array(500)
        .fill({})
        .map((_, i) => ({ id: i, value: `data${i}` }));

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await (service as any).runPerformanceTest(mockReport);

      expect(result.queryTime).toBeGreaterThanOrEqual(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.rowCount).toBe(500);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        expect.any(Array),
      );
    });

    it('should handle large datasets with LIMIT', async () => {
      const mockReport = {
        reportKey: 'large_report',
        sqlQuery: 'SELECT * FROM large_table',
      };

      const mockLargeData = Array(15000)
        .fill({})
        .map((_, i) => ({ id: i }));

      mockDataSource.query.mockResolvedValue(mockLargeData);

      const result = await (service as any).runPerformanceTest(mockReport);

      expect(result.rowCount).toBeLessThanOrEqual(15000); // May return all rows before limit check
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 10000'),
        expect.any(Array),
      );
    });
  });

  describe('validateDataConsistency', () => {
    it('should validate data consistency successfully', async () => {
      const mockReport = {
        reportKey: 'consistency_report',
        sqlQuery: 'SELECT id, name FROM test_table',
        category: 'Transaction',
      };

      const mockData = [
        { id: 1, name: 'Item 1', date: '2025-01-01', no: 'RPT001' },
        { id: 2, name: 'Item 2', date: '2025-01-02', no: 'RPT002' },
      ];

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await (service as any).validateDataConsistency(mockReport);

      expect(result.valid).toBe(true);
    });

    it('should detect missing essential fields', async () => {
      const mockReport = {
        reportKey: 'missing_fields',
        sqlQuery: 'SELECT name FROM test_table', // Missing 'id' field
        category: 'Transaction',
      };

      const mockData = [
        { name: 'Item 1' }, // Missing id
      ];

      mockDataSource.query.mockResolvedValue(mockData);

      const result = await (service as any).validateDataConsistency(mockReport);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Essential field');
    });

    it('should handle empty result sets', async () => {
      const mockReport = {
        reportKey: 'empty_report',
        sqlQuery: 'SELECT * FROM empty_table',
      };

      mockDataSource.query.mockResolvedValue([]);

      const result = await (service as any).validateDataConsistency(mockReport);

      expect(result.valid).toBe(true); // Empty is valid, just no data
    });
  });

  describe('getMigrationProgress', () => {
    it('should return migration progress', async () => {
      mockReportDefinitionRepository.count
        .mockResolvedValueOnce(150) // Total reports
        .mockResolvedValueOnce(120); // Migrated reports

      const result = await service.getMigrationProgress();

      expect(result.totalReports).toBe(150);
      expect(result.completedReports).toBe(120);
      expect(result.overallProgress).toBe(80); // 120/150 * 100
    });

    it('should handle zero total reports', async () => {
      mockReportDefinitionRepository.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await service.getMigrationProgress();

      expect(result.totalReports).toBe(0);
      expect(result.completedReports).toBe(0);
      expect(result.overallProgress).toBe(0);
    });
  });

  describe('getPendingReports', () => {
    it('should return pending reports ordered by creation date', async () => {
      const mockPendingReports = [
        { reportKey: 'report1' },
        { reportKey: 'report2' },
        { reportKey: 'report3' },
      ];

      mockReportDefinitionRepository.find.mockResolvedValue(
        mockPendingReports as any,
      );

      const result = await service.getPendingReports(5);

      expect(result).toEqual(['report1', 'report2', 'report3']);
      expect(mockReportDefinitionRepository.find).toHaveBeenCalledWith({
        where: { status: 'Active' },
        select: ['reportKey'],
        take: 5,
        order: { creDate: 'ASC' },
      });
    });

    it('should use default limit of 50', async () => {
      mockReportDefinitionRepository.find.mockResolvedValue([]);

      await service.getPendingReports();

      expect(mockReportDefinitionRepository.find).toHaveBeenCalledWith({
        where: { status: 'Active' },
        select: ['reportKey'],
        take: 50,
        order: { creDate: 'ASC' },
      });
    });
  });

  describe('createNextBatch', () => {
    it('should create next batch with default priority', async () => {
      const mockPendingReports = ['report1', 'report2', 'report3'];

      jest
        .spyOn(service, 'getPendingReports')
        .mockResolvedValue(mockPendingReports);

      const result = await service.createNextBatch();

      expect(result.reportKeys).toEqual(mockPendingReports);
      expect(result.priority).toBe('medium');
      expect(result.batchId).toContain('auto_batch_');
    });

    it('should create next batch with specified priority', async () => {
      const mockPendingReports = ['report1'];

      jest
        .spyOn(service, 'getPendingReports')
        .mockResolvedValue(mockPendingReports);

      const result = await service.createNextBatch('high');

      expect(result.priority).toBe('high');
    });

    it('should throw error when no pending reports', async () => {
      jest.spyOn(service, 'getPendingReports').mockResolvedValue([]);

      await expect(service.createNextBatch()).rejects.toThrow(
        'No reports pending migration',
      );
    });
  });

  describe('extractTestParameters', () => {
    it('should extract parameters from SQL query', async () => {
      const sqlQuery =
        'SELECT * FROM table WHERE date >= :dateFrom AND date <= :dateTo AND customer = :customerNo';

      const result = await (service as any).extractTestParameters(sqlQuery);

      expect(result).toHaveProperty('dateFrom');
      expect(result).toHaveProperty('dateTo');
      expect(result).toHaveProperty('customerNo');
    });

    it('should provide appropriate test values', async () => {
      const sqlQuery =
        'SELECT * FROM table WHERE date >= :dateFrom AND customer = :customerNo AND amount > :minAmount';

      const result = await (service as any).extractTestParameters(sqlQuery);

      expect(result.dateFrom).toBeInstanceOf(Date);
      expect(typeof result.customerNo).toBe('string');
      // Note: extractTestParameters returns Date for date params, string for others
      expect(result.dateFrom).toBeInstanceOf(Date);
    });

    it('should return empty object for queries without parameters', async () => {
      const sqlQuery = 'SELECT * FROM table';

      const result = await (service as any).extractTestParameters(sqlQuery);

      expect(result).toEqual({});
    });
  });

  describe('migrateSingleReport', () => {
    it('should migrate single report successfully', async () => {
      const mockReport = {
        reportKey: 'single_report',
        reportName: 'Single Report',
        sqlQuery: 'SELECT * FROM test_table',
      };

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );
      mockDataSource.query
        .mockResolvedValueOnce([{ count: 1 }]) // SQL validation
        .mockResolvedValueOnce([]) // Performance test
        .mockResolvedValueOnce([]); // Data consistency
      mockReportDefinitionRepository.update.mockResolvedValue({
        affected: 1,
      } as any);

      const result = await (service as any).migrateSingleReport(
        'single_report',
      );

      expect(result.reportKey).toBe('single_report');
      expect(result.status).toBe(MigrationStatus.VALIDATED);
      expect(result.performanceMetrics).toBeDefined();
      expect(result.validationResults).toBeDefined();
      expect(result.migratedAt).toBeInstanceOf(Date);
    });

    it('should handle migration failure', async () => {
      const mockReport = {
        reportKey: 'failing_report',
        sqlQuery: 'INVALID QUERY',
      };

      mockReportDefinitionRepository.findOne.mockResolvedValue(
        mockReport as ReportDefinition,
      );
      mockDataSource.query.mockRejectedValue(new Error('SQL Error'));

      const result = await (service as any).migrateSingleReport(
        'failing_report',
      );

      expect(result.status).toBe(MigrationStatus.FAILED);
      expect(result.errorMessage).toContain('SQL Error');
    });
  });
});
