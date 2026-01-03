/**
 * FPT Reader Service
 * 
 * Reads Visual FoxPro FPT (memo) files and maps memo blocks to DBF records.
 * 
 * Original Logic Reference:
 * - Legacy Format: Visual FoxPro FPT memo files
 * - Documentation: docs/modernization-strategy/04-data-migration-strategy/data-migration-strategy.md
 */

import * as fs from 'fs';
import { logger } from '../utils/logger.util.js';
import iconv from 'iconv-lite';

/**
 * FPT file header structure
 */
interface FptHeader {
  nextFreeBlock: number;
  blockSize: number;
}

/**
 * Read Visual FoxPro FPT memo files
 */
export class FptReaderService {
  /**
   * Read FPT file header
   */
  readHeader(fptPath: string): FptHeader {
    if (!fs.existsSync(fptPath)) {
      throw new Error(`FPT file not found: ${fptPath}`);
    }

    const buffer = fs.readFileSync(fptPath, null);
    
    // FPT header: 64 bytes
    // First 8 bytes: signature (0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 or similar)
    // Next 4 bytes: next free block number (little-endian)
    // Next 2 bytes: block size (little-endian, typically 64)
    
    const nextFreeBlock = buffer.readUInt32LE(8);
    const blockSize = buffer.readUInt16LE(12);
    
    logger.debug(`FPT header - Next free block: ${nextFreeBlock}, Block size: ${blockSize}`);
    
    return { nextFreeBlock, blockSize };
  }

  /**
   * Read memo block by block number
   */
  readMemoBlock(
    fptPath: string,
    blockNumber: number,
    blockSize: number = 64,
    encoding: string = 'windows-1252'
  ): string | null {
    if (blockNumber <= 0) return null;

    try {
      const buffer = fs.readFileSync(fptPath, null);
      const offset = blockNumber * blockSize;
      
      if (offset >= buffer.length) {
        logger.warn(`Memo block ${blockNumber} is beyond file size`);
        return null;
      }

      // Memo block structure:
      // First 4 bytes: type (1 = text, 2 = picture)
      // Next 4 bytes: length of memo content
      // Remaining: memo content
      
      const type = buffer.readUInt32LE(offset);
      const length = buffer.readUInt32LE(offset + 4);
      
      if (type !== 1) {
        // Not a text memo (might be picture or other)
        logger.debug(`Memo block ${blockNumber} is type ${type}, not text`);
        return null;
      }
      
      if (length === 0) return null;
      
      const contentStart = offset + 8;
      const contentBuffer = buffer.subarray(contentStart, contentStart + length);
      
      // Decode from source encoding to UTF-8
      const decoded = iconv.decode(contentBuffer, encoding);
      
      return decoded.trim();
    } catch (error) {
      logger.error(`Failed to read memo block ${blockNumber}: ${error}`);
      return null;
    }
  }

  /**
   * Map memo values to DBF records
   * 
   * DBF records with memo fields contain block numbers (pointers) to FPT blocks
   */
  mapMemosToRecords(
    records: Record<string, any>[],
    fptPath: string,
    memoFields: string[],
    encoding: string = 'windows-1252'
  ): Record<string, any>[] {
    if (!fs.existsSync(fptPath)) {
      logger.warn(`FPT file not found: ${fptPath}, skipping memo mapping`);
      return records;
    }

    const header = this.readHeader(fptPath);
    const blockSize = header.blockSize;

    return records.map(record => {
      const mappedRecord = { ...record };
      
      for (const memoField of memoFields) {
        const blockNumber = record[memoField];
        
        if (blockNumber && typeof blockNumber === 'number' && blockNumber > 0) {
          const memoContent = this.readMemoBlock(fptPath, blockNumber, blockSize, encoding);
          mappedRecord[memoField] = memoContent || '';
        } else {
          mappedRecord[memoField] = null;
        }
      }
      
      return mappedRecord;
    });
  }

  /**
   * Get FPT file path from DBF file path
   */
  getFptPath(dbfPath: string): string {
    return dbfPath.replace(/\.dbf$/i, '.fpt');
  }
}


