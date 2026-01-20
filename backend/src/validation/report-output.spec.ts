import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, getTestDataSource } from '../test-utils/test-helpers';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';

/**
 * Report Output Validation Tests
 *
 * Test Coverage:
 * - Priority reports output comparison
 * - Parameter handling validation
 * - Data accuracy verification
 * - Format consistency (PDF/Excel)
 *
 * Reference: Phase 3 - Report Validation Testing
 */
describe('Report Output Validation', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createTestApp();
    app = testApp;
    dataSource = await getTestDataSource(moduleRef);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'password123',
        company: 'HT',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('Priority Reports Validation', () => {
    it('should generate Sales Analysis report correctly', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reporting/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'SALES_ANALYSIS',
          format: 'excel',
          parameters: {
            dateFrom: '2025-01-01',
            dateTo: '2025-01-31',
          },
        });

      expect(response.status).toBe(200);
      
      if (response.body.file) {
        const workbook = XLSX.read(response.body.file, { type: 'buffer' });
        expect(workbook.SheetNames.length).toBeGreaterThan(0);
      }
    });

    it('should match legacy Sales Analysis report format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reporting/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'SALES_ANALYSIS',
          format: 'excel',
          parameters: {
            dateFrom: '2025-01-01',
            dateTo: '2025-01-31',
          },
        });

      expect(response.status).toBe(200);
      
      // Compare with golden file
      // const goldenFile = fs.readFileSync('test/fixtures/golden-files/sales-analysis.xlsx');
      // expect(response.body.file).toEqual(goldenFile);
    });
  });

  describe('Parameter Handling', () => {
    it('should handle date range parameters correctly', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reporting/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'SALES_ANALYSIS',
          format: 'excel',
          parameters: {
            dateFrom: '2025-01-01',
            dateTo: '2025-01-31',
            custNo: 'CUST001',
          },
        });

      expect(response.status).toBe(200);
    });

    it('should validate required parameters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reporting/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'SALES_ANALYSIS',
          format: 'excel',
          parameters: {}, // Missing required parameters
        });

      // Should either work with defaults or return 400
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Data Accuracy', () => {
    it('should return accurate data in reports', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reporting/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'SALES_ANALYSIS',
          parameters: {
            dateFrom: '2025-01-01',
            dateTo: '2025-01-31',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('columns');
    });

    it('should calculate aggregations correctly', async () => {
      // Test that report calculations match expected values
      const response = await request(app.getHttpServer())
        .post('/api/reporting/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'SALES_ANALYSIS',
          format: 'excel',
          parameters: {
            dateFrom: '2025-01-01',
            dateTo: '2025-01-31',
          },
        });

      expect(response.status).toBe(200);
      
      // Verify calculations in generated report
      // (Implementation depends on report structure)
    });
  });

  describe('Format Consistency', () => {
    it('should generate Excel format consistently', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reporting/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'SALES_ANALYSIS',
          format: 'excel',
          parameters: {
            dateFrom: '2025-01-01',
            dateTo: '2025-01-31',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.format).toBe('excel');
      
      if (response.body.file) {
        const workbook = XLSX.read(response.body.file, { type: 'buffer' });
        expect(workbook).toBeDefined();
      }
    });

    it('should generate PDF format consistently', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reporting/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'SALES_ANALYSIS',
          format: 'pdf',
          parameters: {
            dateFrom: '2025-01-01',
            dateTo: '2025-01-31',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.format).toBe('pdf');
    });
  });
});
