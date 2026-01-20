import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Request Logging Middleware
 *
 * Logs all incoming requests and responses for debugging and monitoring.
 *
 * Features:
 * - Logs request method, URL, query params, body
 * - Logs response status and time taken
 * - Skips logging for health checks and static assets
 * - Includes user context when available
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, query, body, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Skip logging for health checks and static assets
    if (
      originalUrl.includes('/health') ||
      originalUrl.includes('/favicon.ico') ||
      originalUrl.includes('/static')
    ) {
      return next();
    }

    // Log request
    const user = (req as any).user?.username || 'anonymous';
    this.logger.log(
      `${method} ${originalUrl} - ${user} - ${ip} - ${userAgent}`,
    );

    // Log request details in debug mode
    if (process.env.NODE_ENV === 'development') {
      if (Object.keys(query).length > 0) {
        this.logger.debug(`Query: ${JSON.stringify(query)}`);
      }
      if (body && Object.keys(body).length > 0) {
        const sanitizedBody = this.sanitizeBody(body);
        this.logger.debug(`Body: ${JSON.stringify(sanitizedBody)}`);
      }
    }

    // Log response when finished
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
