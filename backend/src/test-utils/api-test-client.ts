import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

/**
 * API Test Client
 *
 * HTTP client wrapper for API testing with automatic authentication handling.
 */
export class ApiTestClient {
  constructor(
    private app: INestApplication,
    private token?: string,
  ) {}

  /**
   * Make a GET request
   */
  async get(url: string): Promise<request.Response> {
    const req = request(this.app.getHttpServer()).get(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  /**
   * Make a POST request
   */
  async post(url: string, body?: any): Promise<request.Response> {
    const req = request(this.app.getHttpServer()).post(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    if (body) {
      req.send(body);
    }
    return req;
  }

  /**
   * Make a PUT request
   */
  async put(url: string, body?: any): Promise<request.Response> {
    const req = request(this.app.getHttpServer()).put(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    if (body) {
      req.send(body);
    }
    return req;
  }

  /**
   * Make a DELETE request
   */
  async delete(url: string): Promise<request.Response> {
    const req = request(this.app.getHttpServer()).delete(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }
}
