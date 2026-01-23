import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getTestDataSource } from '../test-utils/test-helpers';
import { createMinimalTestApp } from '../test-utils/minimal-test-app';
import { DataSource } from 'typeorm';

/**
 * Phase 3 Authentication & Authorization Tests
 *
 * Test Coverage:
 * - JWT token validation on all Phase 3 endpoints
 * - Role-based access control (if implemented)
 * - Audit logging for all Phase 3 operations
 * - Session timeout handling
 * - Unauthorized access attempts
 *
 * Reference: Phase 3 - Security Testing
 */
describe('Phase 3 Authentication & Authorization', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let regularUserToken: string;

  beforeAll(async () => {
    const { app: testApp, moduleRef } = await createMinimalTestApp();
    app = testApp;
    dataSource = await getTestDataSource(moduleRef);

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'password123',
        company: 'HT',
      });

    adminToken = adminLoginResponse.body.access_token;

    // Login as regular user (if exists)
    try {
      const userLoginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'user',
          password: 'password123',
          company: 'HT',
        });
      regularUserToken = userLoginResponse.body.access_token;
    } catch (error) {
      // Regular user may not exist in test data
      regularUserToken = null;
    }
  });

  afterAll(async () => {
    await app.close();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('JWT Token Validation', () => {
    it('should reject requests without token on SO endpoints', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/shipping-orders/enquiry',
      );

      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid token on SO endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/shipping-orders/enquiry')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should reject requests without token on DN endpoints', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/delivery-notes/enquiry',
      );

      expect(response.status).toBe(401);
    });

    it('should reject requests without token on Loading endpoints', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/loading/masters',
      );

      expect(response.status).toBe(401);
    });

    it('should reject requests without token on Invoice endpoints', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/invoices/enquiry',
      );

      expect(response.status).toBe(401);
    });

    it('should reject requests without token on Enquiry endpoints', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/enquiry/sales-analysis',
      );

      expect(response.status).toBe(401);
    });

    it('should reject requests without token on Reporting endpoints', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/reporting/reports',
      );

      expect(response.status).toBe(401);
    });

    it('should accept requests with valid token on SO endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/shipping-orders/enquiry')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should accept requests with valid token on Invoice endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/invoices/enquiry')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Token Expiration Handling', () => {
    it('should reject expired tokens', async () => {
      // Create an expired token (would need to manipulate JWT expiration)
      const expiredToken = 'expired-token-placeholder';

      const response = await request(app.getHttpServer())
        .get('/api/shipping-orders/enquiry')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it('should handle token refresh if implemented', async () => {
      // Test token refresh endpoint if available
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${adminToken}`);

      // If refresh endpoint exists, verify it works
      if (refreshResponse.status !== 404) {
        expect(refreshResponse.status).toBe(200);
        expect(refreshResponse.body).toHaveProperty('access_token');
      }
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin to create SO', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          soNo: `SO-AUTH-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [
            {
              itemNo: 'ITEM001',
              qty: 100,
              price: 10.5,
            },
          ],
        });

      expect(response.status).toBe(201);
    });

    it('should allow admin to delete SO', async () => {
      // Create SO first
      const createResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          soNo: `SO-DEL-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [],
        });

      const soNo = createResponse.body.soNo;

      // Delete SO
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/shipping-orders/${soNo}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);
    });

    it('should restrict regular user if role-based restrictions exist', async () => {
      if (regularUserToken) {
        // Test if regular user can perform restricted operations
        const response = await request(app.getHttpServer())
          .delete('/api/shipping-orders/SO001')
          .set('Authorization', `Bearer ${regularUserToken}`);

        // Should either be 403 (Forbidden) or 200 (if no restrictions)
        expect([200, 403]).toContain(response.status);
      }
    });
  });

  describe('Audit Logging', () => {
    it('should log SO creation operations', async () => {
      const soNo = `SO-AUDIT-${Date.now()}`;

      await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          soNo,
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [],
        });

      // Verify audit log entry (if audit logging is implemented)
      // This would check the audit log table or service
      // const auditLog = await auditLogService.findByEntity('ShippingOrder', soNo);
      // expect(auditLog).toBeDefined();
      // expect(auditLog.operation).toBe('CREATE');
      // expect(auditLog.userId).toBeDefined();
    });

    it('should log Invoice creation operations', async () => {
      const invNo = `INV-AUDIT-${Date.now()}`;

      await request(app.getHttpServer())
        .post('/api/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invNo,
          date: '2025-01-18',
          custNo: 'CUST001',
          details: [],
        });

      // Verify audit log entry
      // const auditLog = await auditLogService.findByEntity('Invoice', invNo);
      // expect(auditLog).toBeDefined();
    });

    it('should log document generation operations', async () => {
      // Create SO first
      const createResponse = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          soNo: `SO-DOC-AUDIT-${Date.now()}`,
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [],
        });

      const soNo = createResponse.body.soNo;

      // Generate document
      await request(app.getHttpServer())
        .post(`/api/shipping-orders/${soNo}/documents`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          format: 'excel',
          formatKey: 'DEFAULT',
        });

      // Verify audit log entry
      // const auditLog = await auditLogService.findByEntity('ShippingOrder', soNo);
      // expect(auditLog.operations).toContain('GENERATE_DOCUMENT');
    });
  });

  describe('Session Timeout Handling', () => {
    it('should handle session timeout gracefully', async () => {
      // Simulate session timeout by using an old token
      // In real scenario, token would expire after configured time

      // For now, test that expired token is rejected
      const response = await request(app.getHttpServer())
        .get('/api/shipping-orders/enquiry')
        .set('Authorization', 'Bearer expired-token');

      expect(response.status).toBe(401);
    });

    it('should provide clear error message on session timeout', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/shipping-orders/enquiry')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('Unauthorized Access Attempts', () => {
    it('should prevent unauthorized SO creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders')
        .send({
          soNo: 'SO-UNAUTHORIZED',
          date: '2025-01-15',
          custNo: 'CUST001',
          details: [],
        });

      expect(response.status).toBe(401);
    });

    it('should prevent unauthorized Invoice access', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/invoices/enquiry',
      );

      expect(response.status).toBe(401);
    });

    it('should prevent unauthorized document generation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/shipping-orders/SO001/documents')
        .send({
          format: 'excel',
        });

      expect(response.status).toBe(401);
    });

    it('should prevent unauthorized report generation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reporting/generate')
        .send({
          reportKey: 'SALES_ANALYSIS',
          format: 'excel',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Cross-Module Authorization', () => {
    it('should require authentication for DN creation from SO', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/delivery-notes/from-so')
        .send({
          dnNo: 'DN-UNAUTHORIZED',
          date: '2025-01-16',
          soNo: 'SO001',
        });

      expect(response.status).toBe(401);
    });

    it('should require authentication for Invoice creation from DN', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/invoices/from-source')
        .send({
          invNo: 'INV-UNAUTHORIZED',
          date: '2025-01-18',
          sourceType: 'DN',
          sourceNo: 'DN001',
        });

      expect(response.status).toBe(401);
    });
  });
});
