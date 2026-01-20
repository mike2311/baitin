import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global Exception Filter
 *
 * Catches all unhandled exceptions and logs detailed information
 * for debugging and monitoring purposes.
 *
 * Features:
 * - Logs full error stack traces
 * - Logs request details (method, URL, body, headers)
 * - Logs user context when available
 * - Formats error responses consistently
 * - Different log levels for different exception types
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errorDetails = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorDetails = {
        name: exception.name,
        stack: exception.stack,
      };
    }

    // Build log context
    const logContext = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      statusCode: status,
      message,
      user: (request as any).user?.username || 'anonymous',
      userId: (request as any).user?.id || null,
      ip: request.ip || request.connection?.remoteAddress,
      userAgent: request.get('user-agent'),
      body: this.sanitizeBody(request.body),
      query: request.query,
      params: request.params,
      errorDetails,
    };

    // Log based on severity
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(logContext),
        'HttpExceptionFilter',
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${message}`,
        JSON.stringify(logContext),
        'HttpExceptionFilter',
      );
    } else {
      this.logger.log(
        `${request.method} ${request.url} - ${status}`,
        'HttpExceptionFilter',
      );
    }

    // Send response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(process.env.NODE_ENV === 'development' && errorDetails
        ? { details: errorDetails }
        : {}),
    };

    response.status(status).json(errorResponse);
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
