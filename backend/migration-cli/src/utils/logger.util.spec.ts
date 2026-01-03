/**
 * Unit Tests for Logger Utility
 */

import { createLogger } from './logger.util.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Logger Utility', () => {
  const testLogDir = path.join(__dirname, '../../test-logs');

  afterEach(() => {
    // Cleanup test log directory
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  describe('createLogger', () => {
    it('should create a logger instance', () => {
      const logger = createLogger(testLogDir);
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
    });

    it('should create log directory if it does not exist', () => {
      expect(fs.existsSync(testLogDir)).toBe(false);
      createLogger(testLogDir);
      expect(fs.existsSync(testLogDir)).toBe(true);
    });

    it('should use default log directory if not provided', () => {
      const logger = createLogger();
      expect(logger).toBeDefined();
      // Default directory should be created
      const defaultDir = path.join(__dirname, '../../logs');
      expect(fs.existsSync(defaultDir)).toBe(true);
      // Cleanup
      if (fs.existsSync(defaultDir)) {
        fs.rmSync(defaultDir, { recursive: true, force: true });
      }
    });

    it('should log messages at appropriate levels', () => {
      const logger = createLogger(testLogDir);
      
      // These should not throw
      expect(() => logger.info('Test info message')).not.toThrow();
      expect(() => logger.warn('Test warn message')).not.toThrow();
      expect(() => logger.error('Test error message')).not.toThrow();
      expect(() => logger.debug('Test debug message')).not.toThrow();
    });
  });
});


