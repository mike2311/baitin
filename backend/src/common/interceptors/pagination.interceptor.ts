import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';

/**
 * Pagination Interceptor
 *
 * Adds pagination support to list/search endpoints.
 */
@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const query = request.query;

    const pagination: PaginationDto = {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
    };

    request.pagination = pagination;

    return next.handle().pipe(
      map((data) => {
        // If data is already paginated, return as-is
        if (data && typeof data === 'object' && 'data' in data && 'total' in data) {
          return data;
        }

        // Otherwise, wrap in pagination response
        // Note: This is a simple implementation
        // Full pagination should be done at service level
        return data;
      }),
    );
  }
}