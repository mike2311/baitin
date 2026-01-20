import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AUDIT_LOG_KEY } from '../decorators/audit-log.decorator';

/**
 * Audit Log Interceptor
 *
 * Logs user actions for audit trail.
 *
 * Original Logic Reference:
 * - Legacy System: mactivity table, user_id fields
 * - Documentation: docs/source/08-security/audit-trail.md
 * - Business Rules:
 *   - Log all create/update/delete operations
   *   - Track user and timestamp
   *
 * Reference: Phase 3 - Hardening
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const action = this.reflector.get<string>(AUDIT_LOG_KEY, context.getHandler());
    const user = request.user; // From JWT guard

    const method = request.method;
    const url = request.url;
    const timestamp = new Date();

    // Log action
    // TODO: Write to audit log table (mactivity equivalent)
    if (action && user) {
      console.log(`[AUDIT] ${action} - User: ${user.username}, Method: ${method}, URL: ${url}, Time: ${timestamp.toISOString()}`);
    }

    return next.handle().pipe(
      tap(() => {
        // Log successful completion
        if (action && user) {
          console.log(`[AUDIT] ${action} completed - User: ${user.username}, Time: ${new Date().toISOString()}`);
        }
      }),
    );
  }
}