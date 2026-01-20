import { SetMetadata } from '@nestjs/common';

/**
 * Audit Log Decorator
 *
 * Marks endpoints that should be audited.
 */
export const AUDIT_LOG_KEY = 'auditLog';
export const AuditLog = (action: string) => SetMetadata(AUDIT_LOG_KEY, action);
