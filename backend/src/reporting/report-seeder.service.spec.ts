import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportSeederService } from './report-seeder.service';
import { ReportDefinition } from './entities/report-definition.entity';

/**
 * Report Seeder Service Tests
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Test report definition seeding
 *   - Test duplicate handling
 *   - Test data consistency
 *   - Test seeding progress tracking
 *
 * Reference: Phase 3 - Reporting Batch Migration
 */
describe('ReportSeederService', () => {
  let service: ReportSeederService;
  let reportDefinitionRepository: Repository<ReportDefinition>;

  const mockReportDefinitionRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportSeederService,
        {
          provide: getRepositoryToken(ReportDefinition),
          useValue: mockReportDefinitionRepository,
        },
      ],
    }).compile();

    service = module.get<ReportSeederService>(ReportSeederService);
    reportDefinitionRepository = module.get<Repository<ReportDefinition>>(
      getRepositoryToken(ReportDefinition),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedReportDefinitions', () => {
    it('should seed all legacy report definitions', async () => {
      // Mock that no reports exist yet
      mockReportDefinitionRepository.findOne.mockResolvedValue(null);
      mockReportDefinitionRepository.save.mockResolvedValue(
        {} as ReportDefinition,
      );

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.seedReportDefinitions();

      expect(mockReportDefinitionRepository.save).toHaveBeenCalled();
      expect(mockReportDefinitionRepository.findOne).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Report seeding completed'),
      );

      consoleSpy.mockRestore();
    });

    it('should skip existing reports', async () => {
      const existingReport = {
        reportKey: 'existing_report',
        reportName: 'Existing Report',
      };

      // Mock that first report exists
      mockReportDefinitionRepository.findOne.mockResolvedValueOnce(
        existingReport as ReportDefinition,
      );
      // Mock that second report doesn't exist
      mockReportDefinitionRepository.findOne.mockResolvedValueOnce(null);

      mockReportDefinitionRepository.save.mockResolvedValue(
        {} as ReportDefinition,
      );

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.seedReportDefinitions();

      expect(mockReportDefinitionRepository.save).toHaveBeenCalledTimes(1); // Only the new report
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Created: 1, Skipped: 1'),
      );

      consoleSpy.mockRestore();
    });

    it('should handle seeding errors gracefully', async () => {
      mockReportDefinitionRepository.findOne.mockResolvedValue(null);
      mockReportDefinitionRepository.save.mockRejectedValueOnce(
        new Error('Database error'),
      );
      mockReportDefinitionRepository.save.mockResolvedValue(
        {} as ReportDefinition,
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.seedReportDefinitions();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create report definition'),
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it('should log seeding progress', async () => {
      mockReportDefinitionRepository.findOne.mockResolvedValue(null);
      mockReportDefinitionRepository.save.mockResolvedValue(
        {} as ReportDefinition,
      );

      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      const debugSpy = jest.spyOn(console, 'debug').mockImplementation();

      await service.seedReportDefinitions();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting report definition seeding'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Report seeding completed'),
      );

      logSpy.mockRestore();
      debugSpy.mockRestore();
    });
  });

  describe('getReportCount', () => {
    it('should return report counts by status', async () => {
      mockReportDefinitionRepository.count
        .mockResolvedValueOnce(150) // Total
        .mockResolvedValueOnce(120) // Active
        .mockResolvedValueOnce(30); // Migrated

      const result = await service.getReportCount();

      expect(result.total).toBe(150);
      expect(result.active).toBe(120);
      expect(result.migrated).toBe(30);
    });

    it('should handle zero counts', async () => {
      mockReportDefinitionRepository.count.mockResolvedValue(0);

      const result = await service.getReportCount();

      expect(result.total).toBe(0);
      expect(result.active).toBe(0);
      expect(result.migrated).toBe(0);
    });
  });

  describe('clearAllReports', () => {
    it('should clear all report definitions', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.clearAllReports();

      expect(mockReportDefinitionRepository.clear).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith('All report definitions cleared');

      logSpy.mockRestore();
    });
  });

  describe('getLegacyReportDefinitions', () => {
    it('should return comprehensive list of legacy reports', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBeGreaterThan(0);

      // Check structure of first report
      const firstReport = reports[0];
      expect(firstReport).toHaveProperty('reportKey');
      expect(firstReport).toHaveProperty('reportName');
      expect(firstReport).toHaveProperty('category');
      expect(firstReport).toHaveProperty('sqlQuery');
      expect(firstReport).toHaveProperty('parameters');
      expect(firstReport).toHaveProperty('status');
      expect(firstReport).toHaveProperty('legacyReportFile');
      expect(firstReport).toHaveProperty('creUser');
      expect(firstReport).toHaveProperty('creDate');
      expect(firstReport).toHaveProperty('modDate');
    });

    it('should include all major report categories', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      const categories = [...new Set(reports.map((r) => r.category))];
      expect(categories).toContain('Transaction');
      expect(categories).toContain('Summary');
      expect(categories).toContain('Analysis');
      expect(categories).toContain('Export');
    });

    it('should include transaction reports', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      const transactionReports = reports.filter(
        (r) => r.category === 'Transaction',
      );
      expect(transactionReports.length).toBeGreaterThan(0);

      // Check for specific known reports
      const reportKeys = transactionReports.map((r) => r.reportKey);
      expect(reportKeys).toContain('pordenq');
      expect(reportKeys).toContain('pconfirm');
      expect(reportKeys).toContain('pcontract_2018');
      expect(reportKeys).toContain('pso');
      expect(reportKeys).toContain('pinv');
      expect(reportKeys).toContain('pdn');
    });

    it('should include summary reports', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      const summaryReports = reports.filter((r) => r.category === 'Summary');
      expect(summaryReports.length).toBeGreaterThan(0);

      const reportKeys = summaryReports.map((r) => r.reportKey);
      expect(reportKeys).toContain('poesumry');
      expect(reportKeys).toContain('pocsumry');
      expect(reportKeys).toContain('einvsumry');
    });

    it('should include analysis reports', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      const analysisReports = reports.filter((r) => r.category === 'Analysis');
      expect(analysisReports.length).toBeGreaterThan(0);

      const reportKeys = analysisReports.map((r) => r.reportKey);
      expect(reportKeys).toContain('psabycust');
      expect(reportKeys).toContain('psabyitem');
      expect(reportKeys).toContain('pordbyitem');
    });

    it('should include export reports', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      const exportReports = reports.filter((r) => r.category === 'Export');
      expect(exportReports.length).toBeGreaterThan(0);

      const reportKeys = exportReports.map((r) => r.reportKey);
      expect(reportKeys).toContain('pinv_xls');
      expect(reportKeys).toContain('ppacklist_xls');
      expect(reportKeys).toContain('pdn_xls');
    });

    it('should set proper defaults for all reports', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      reports.forEach((report) => {
        expect(report.status).toBe('Active');
        expect(report.creUser).toBe('SYSTEM_SEEDER');
        expect(report.creDate).toBeInstanceOf(Date);
        expect(report.modDate).toBeInstanceOf(Date);
      });
    });

    it('should include proper SQL queries', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      reports.forEach((report) => {
        expect(typeof report.sqlQuery).toBe('string');
        expect(report.sqlQuery.length).toBeGreaterThan(0);
      });
    });

    it('should include parameter definitions', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      reports.forEach((report) => {
        expect(report.parameters).toBeDefined();
        // Some reports might not have parameters, that's okay
      });
    });

    it('should include legacy file references', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      reports.forEach((report) => {
        expect(report.legacyReportFile).toBeDefined();
        expect(typeof report.legacyReportFile).toBe('string');
        expect(report.legacyReportFile.endsWith('.frx')).toBe(true);
      });
    });
  });

  describe('seeding data integrity', () => {
    it('should maintain referential integrity', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      // Check that all reports have unique keys
      const keys = reports.map((r) => r.reportKey);
      const uniqueKeys = [...new Set(keys)];
      expect(uniqueKeys.length).toBe(keys.length);

      // Check that all reports have required fields
      reports.forEach((report) => {
        expect(report.reportKey).toBeDefined();
        expect(report.reportName).toBeDefined();
        expect(report.category).toBeDefined();
        expect(report.sqlQuery).toBeDefined();
        expect(report.status).toBeDefined();
      });
    });

    it('should include realistic SQL queries', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      // Sample some reports to check SQL structure
      const sampleReports = reports.slice(0, 5);

      sampleReports.forEach((report) => {
        const sql = report.sqlQuery.toUpperCase();
        // Should contain SELECT
        expect(sql).toMatch(/SELECT/);
        // Should contain FROM
        expect(sql).toMatch(/FROM/);
        // Might contain WHERE
        // Might contain ORDER BY
      });
    });

    it('should include proper parameter structures', async () => {
      const reports = await (service as any).getLegacyReportDefinitions();

      // Find reports with parameters
      const reportsWithParams = reports.filter(
        (r) => r.parameters && Object.keys(r.parameters).length > 0,
      );

      reportsWithParams.forEach((report) => {
        Object.entries(report.parameters).forEach(
          ([key, config]: [string, any]) => {
            expect(config).toHaveProperty('type');
            expect(config).toHaveProperty('label');
            expect(['string', 'number', 'date', 'boolean', 'select']).toContain(
              config.type,
            );
          },
        );
      });
    });
  });
});
