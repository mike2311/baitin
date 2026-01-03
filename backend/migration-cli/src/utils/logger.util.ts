/**
 * Logger Utility
 * 
 * Provides structured logging for migration CLI using Winston.
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create Winston logger instance
 */
export function createLogger(logDir?: string): winston.Logger {
  const logPath = logDir || path.join(__dirname, '../../logs');
  
  // #region agent log
  try {
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, { recursive: true });
      fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'logger.util.ts:21',message:'Created log directory',data:{logPath},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
    } else {
      fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'logger.util.ts:23',message:'Log directory exists',data:{logPath},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
    }
  } catch (error: any) {
    fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'logger.util.ts:25',message:'Failed to create log directory',data:{error:String(error),logPath},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
  }
  // #endregion
  
  // #region agent log
  fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'logger.util.ts:26',message:'Creating winston logger',data:{logPath,logLevel:process.env.LOG_LEVEL||'info'},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: { service: 'baitin-migration' },
    transports: [
      // Write all logs to console
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
            return `${timestamp} [${level}]: ${message} ${metaStr}`;
          })
        ),
      }),
      // Write all logs with level 'error' and below to error.log
      new winston.transports.File({
        filename: path.join(logPath, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Write all logs to combined.log
      new winston.transports.File({
        filename: path.join(logPath, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ],
  });

  return logger;
}

/**
 * Default logger instance
 */
export const logger = createLogger();

