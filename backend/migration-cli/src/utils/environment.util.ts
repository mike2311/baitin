/**
 * Environment Utility
 * 
 * Provides environment validation and guardrails to prevent accidental
 * execution against wrong database or environment.
 */

import { logger } from './logger.util.js';
import chalk from 'chalk';

/**
 * Validate environment is set to POC
 */
export function validatePocEnvironment(): boolean {
  const env = process.env.ENV || process.env.NODE_ENV || '';
  
  if (!env || (env !== 'POC' && env !== 'poc')) {
    logger.error(`Environment validation failed: ENV must be set to 'POC', got '${env}'`);
    console.error(chalk.red(`\n❌ Environment Guardrail: ENV must be set to 'POC'`));
    console.error(chalk.yellow(`   Current ENV: ${env || '(not set)'}`));
    console.error(chalk.yellow(`   Set ENV=POC to proceed with migration\n`));
    return false;
  }
  
  logger.info(`Environment validated: ${env}`);
  return true;
}

/**
 * Validate database connection string matches expected pattern
 */
export function validateDatabaseConnection(dbName: string, expectedPattern?: string): boolean {
  if (!dbName) {
    logger.error('Database name is required');
    return false;
  }

  // For POC, we might want to check if database name contains 'poc' or 'dev'
  if (expectedPattern && !dbName.toLowerCase().includes(expectedPattern.toLowerCase())) {
    logger.warn(`Database name '${dbName}' does not match expected pattern '${expectedPattern}'`);
    console.warn(chalk.yellow(`⚠️  Warning: Database name '${dbName}' may not be the intended target`));
  }

  return true;
}

/**
 * Require confirmation before proceeding with destructive operations
 */
export function requireConfirmation(message: string, defaultAnswer: boolean = false): Promise<boolean> {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const prompt = defaultAnswer 
      ? `${message} (Y/n): `
      : `${message} (y/N): `;
    
    readline.question(chalk.yellow(prompt), (answer: string) => {
      readline.close();
      const normalized = answer.trim().toLowerCase();
      if (normalized === '') {
        resolve(defaultAnswer);
      } else {
        resolve(normalized === 'y' || normalized === 'yes');
      }
    });
  });
}

/**
 * Get database configuration from environment variables
 */
export function getDatabaseConfig() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || process.env.DATABASE_URL?.split('/').pop() || 'baitin_poc',
    user: process.env.DB_USER || process.env.DATABASE_URL?.split('@')[0]?.split('://')[1]?.split(':')[0] || 'postgres',
    password: process.env.DB_PASSWORD || process.env.DATABASE_URL?.split('@')[0]?.split(':')[1] || '',
  };

  if (!config.password) {
    logger.warn('Database password not found in environment variables');
  }

  return config;
}


