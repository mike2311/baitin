import { Injectable } from '@nestjs/common';

/**
 * Root Application Service
 *
 * Provides basic application services.
 *
 * Reference: Task 02-02 - API Foundation
 */
@Injectable()
export class AppService {
  getHello(): string {
    return 'BAITIN PoC API is running';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'baitin-poc-api',
    };
  }
}
