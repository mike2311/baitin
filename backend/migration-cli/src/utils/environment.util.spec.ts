/**
 * Unit Tests for Environment Utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validatePocEnvironment,
  validateDatabaseConnection,
  getDatabaseConfig,
} from './environment.util.js';

describe('Environment Utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validatePocEnvironment', () => {
    it('should return true when ENV is set to POC', () => {
      process.env.ENV = 'POC';
      expect(validatePocEnvironment()).toBe(true);
    });

    it('should return true when ENV is set to poc (lowercase)', () => {
      process.env.ENV = 'poc';
      expect(validatePocEnvironment()).toBe(true);
    });

    it('should return false when ENV is not set', () => {
      delete process.env.ENV;
      delete process.env.NODE_ENV;
      expect(validatePocEnvironment()).toBe(false);
    });

    it('should return false when ENV is set to non-POC value', () => {
      process.env.ENV = 'PROD';
      expect(validatePocEnvironment()).toBe(false);
    });

    it('should check NODE_ENV if ENV is not set', () => {
      delete process.env.ENV;
      process.env.NODE_ENV = 'POC';
      expect(validatePocEnvironment()).toBe(true);
    });
  });

  describe('validateDatabaseConnection', () => {
    it('should return true for valid database name', () => {
      expect(validateDatabaseConnection('baitin_poc')).toBe(true);
    });

    it('should return false for empty database name', () => {
      expect(validateDatabaseConnection('')).toBe(false);
    });

    it('should warn if database name does not match pattern', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      validateDatabaseConnection('production_db', 'poc');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getDatabaseConfig', () => {
    it('should return default config when env vars are not set', () => {
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_NAME;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;

      const config = getDatabaseConfig();
      expect(config.host).toBe('localhost');
      expect(config.port).toBe(5432);
      expect(config.database).toBe('baitin_poc');
      expect(config.user).toBe('postgres');
    });

    it('should use environment variables when set', () => {
      process.env.DB_HOST = 'test-host';
      process.env.DB_PORT = '5433';
      process.env.DB_NAME = 'test_db';
      process.env.DB_USER = 'test_user';
      process.env.DB_PASSWORD = 'test_pass';

      const config = getDatabaseConfig();
      expect(config.host).toBe('test-host');
      expect(config.port).toBe(5433);
      expect(config.database).toBe('test_db');
      expect(config.user).toBe('test_user');
      expect(config.password).toBe('test_pass');
    });

    it('should parse DATABASE_URL if provided', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/dbname';
      
      const config = getDatabaseConfig();
      // Should extract values from URL
      expect(config.database).toBe('dbname');
    });
  });
});


