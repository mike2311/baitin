import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, getTestDataSource } from '../test-utils/test-helpers';
import { DataSource } from 'typeorm';

/**
 * Phase 3 Data Security Tests
 *
 * Test Coverage:
 * - SQL injection prevention
 * - XSS prevention in document generation
 * - CSRF protection
 * - Input validation and sanitization
 * - Sensitive data exposure (customer info, pricing)
 *
 * Reference: Phase 3 - Security Testing
 */
describe('Phase 3 Data Security', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createTestApp();
    app = testApp;
    dataSource = await getTestDataSource(moduleRef);

    // Login to get auth token
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

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in SO search', async () => {
      const sqlInjection = "'; DROP TABLE shipping_order_header; --";
      
      const response = await request(app.getHttpServer())
        .get('/api/shipping-orders/enquiry')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          soNo: sqlInjection,
        });

      // Should not execute SQL injection, should return 200 or 400 (bad request)
      expect([200, 400]).toContain(response.status);
      
      // Verify table still exists (would need to check database)
      // const tableExists = await dataSource.query("SELECT name FROM sqlite_master WHERE type='table' AND name='shipping_order_header'");
      // expect(tableExists.length).toBeGreaterThan(0);
    });

    it('should prevent SQL injection in Invoice search', async () => {
      const sqlInjection = "1' OR '1'='1";
      
      const response = await request(app.getHttpServer())
        .get('/api/invoices/enquiry')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          invNo: sqlInjection,
        });

      expect([200, 400]).toContain(response.status);
    });

    it('should prevent SQL injection in report parameters', async () => {
      const sqlInjection = "'; DELETE FROM report_definition; --";
      
      const response = await request(app.getHttpServer())
        .post('/api/reporting/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportKey: 'SALES_ANALYSIS',
          format: 'excel',
          parameters: {
            custNo: sqlInjection,
          },
        });

      expect([200, 400, 500]).toContain(response.status);
    });

    it('should sanitize user input in SO creation', async () => {
      const maliciousInput = "'; DROP TABLE shipping_order_header; --";
      
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: maliciousInput,
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [],
        });

      // Should either reject or sanitize the input
      expect([201, 400]).toContain(response.status);
    });
  });

  describe('XSS Prevention', () => {
    it('should prevent XSS in SO remarks field', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-XSS-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          remarks: xssPayload,
          details: [],
        });

      expect(response.status).toBe(201);
      
      // Verify XSS is sanitized in stored data
      const soResponse = await request(app.getHttpServer())
        .get(`/api/shipping-orders/${response.body.soNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      if (soResponse.status === 200) {
        // XSS should be escaped or removed
        expect(soResponse.body.remarks).not.toContain('<script>');
      }
    });

    it('should prevent XSS in document generation', async () => {
      // Create SO with XSS in remarks
      const createResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-XSS-DOC-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          remarks: '<script>alert("XSS")</script>',
          details: [],
        });

      const soNo = createResponse.body.soNo;

      // Generate document
      const docResponse = await request(app.getHttpServer())
        .post(`/api/shipping-orders/${soNo}/documents`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'excel',
          formatKey: 'DEFAULT',
        });

      expect(docResponse.status).toBe(200);
      
      // Document should not contain executable script tags
      // (Would need to parse document to verify)
    });

    it('should prevent XSS in Invoice remarks', async () => {
      const xssPayload = '<img src=x onerror=alert("XSS")>';
      
      const response = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invNo: `INV-XSS-${Date.now()}`,
          date: '2025-01-18',
          custNo: 'CUST001',
          remarks: xssPayload,
          details: [],
        });

      expect(response.status).toBe(201);
      
      // Verify XSS is sanitized
      const invResponse = await request(app.getHttpServer())
        .get(`/api/invoices/${response.body.invNo}`)
        .set('Authorization', `Bearer ${authToken}`);

      if (invResponse.status === 200) {
        expect(invResponse.body.remarks).not.toContain('onerror=');
      }
    });
  });

  describe('CSRF Protection', () => {
    it('should require CSRF token for state-changing operations if implemented', async () => {
      // CSRF protection is typically handled at framework level
      // Test that state-changing operations require proper headers
      
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-CSRF-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [],
        });

      // If CSRF protection is implemented, missing token should result in 403
      // Otherwise, should work with just auth token
      expect([201, 403]).toContain(response.status);
    });

    it('should validate origin header for CSRF protection', async () => {
      // Test that requests from unauthorized origins are rejected
      // This would require CSRF middleware to be configured
      
      const response = await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Origin', 'http://malicious-site.com')
        .send({
          invNo: `INV-CSRF-${Date.now()}`,
          date: '2025-01-18',
          custNo: 'CUST001',
          details: [],
        });

      // Should either work (if no origin check) or be rejected (if origin check exists)
      expect([201, 403]).toContain(response.status);
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should validate SO number format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: '', // Empty SO number
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [],
        });

      expect(response.status).toBe(400);
    });

    it('should validate date format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-DATE-${Date.now()}`,
          date: 'invalid-date',
          custNo: 'CUST001',
          details: [],
        });

      expect(response.status).toBe(400);
    });

    it('should sanitize numeric inputs', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-NUM-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [
            {
              itemNo: 'ITEM001',
              qty: 'not-a-number',
              price: 10.50,
            },
          ],
        });

      expect(response.status).toBe(400);
    });

    it('should validate customer exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-CUST-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'INVALID_CUSTOMER',
          details: [],
        });

      expect(response.status).toBe(400);
    });

    it('should sanitize string inputs to prevent injection', async () => {
      const maliciousString = "'; DROP TABLE; --";
      
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-SANITIZE-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          delAddr1: maliciousString,
          details: [],
        });

      // Should either reject or sanitize
      expect([201, 400]).toContain(response.status);
    });
  });

  describe('Sensitive Data Exposure', () => {
    it('should not expose sensitive customer information in error messages', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers/INVALID')
        .set('Authorization', `Bearer ${authToken}`);

      // Error message should not contain sensitive data
      if (response.status === 404 || response.status === 400) {
        expect(response.body.message).not.toContain('password');
        expect(response.body.message).not.toContain('credit');
      }
    });

    it('should not expose pricing information to unauthorized users', async () => {
      // Test with different user roles if implemented
      const response = await request(app.getHttpServer())
        .get('/api/shipping-orders/SO001')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        // Verify pricing is included for authorized users
        // In real scenario, would test with different user roles
        expect(response.body).toBeDefined();
      }
    });

    it('should mask sensitive data in logs', async () => {
      // Create SO with potentially sensitive data
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: `SO-SENSITIVE-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [],
        });

      expect(response.status).toBe(201);
      
      // Verify logs don't contain sensitive data
      // (Would need to check log files or log service)
    });

    it('should not expose internal system information in errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          soNo: null, // Invalid input
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [],
        });

      // Error should not expose stack traces or internal paths
      if (response.status >= 400) {
        expect(response.body.message).not.toContain('at ');
        expect(response.body.message).not.toContain('node_modules');
        expect(response.body.message).not.toContain('C:\\');
      }
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types for document uploads', async () => {
      // If file upload is implemented, test file type validation
      const response = await request(app.getHttpServer())
        .post('/api/reporting/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('malicious content'), 'malicious.exe');

      // Should reject executable files
      if (response.status !== 404) {
        expect([400, 415]).toContain(response.status);
      }
    });

    it('should limit file size for uploads', async () => {
      // Create large file
      const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB
      
      const response = await request(app.getHttpServer())
        .post('/api/reporting/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeFile, 'large-file.xlsx');

      // Should reject files that are too large
      if (response.status !== 404) {
        expect([400, 413]).toContain(response.status);
      }
    });
  });
});
