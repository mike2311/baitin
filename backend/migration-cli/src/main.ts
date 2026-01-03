#!/usr/bin/env node

/**
 * BAITIN Migration CLI
 * 
 * Main entry point for the migration CLI tool.
 */

// #region agent log
fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:13',message:'CLI entry point',data:{argv:process.argv.slice(0,3),nodeVersion:process.version},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
// #endregion

import { Command } from 'commander';

// #region agent log
fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:16',message:'Import attempt - commander',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
// #endregion

import { createExtractCommand } from './commands/extract.command.js';
import { createLoadCommand } from './commands/load.command.js';
import { createValidateCommand } from './commands/validate.command.js';
import { createResetCommand } from './commands/reset.command.js';
import { logger } from './utils/logger.util.js';
import chalk from 'chalk';

// #region agent log
fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:24',message:'Imports completed',data:{hasExtract:!!createExtractCommand,hasLoad:!!createLoadCommand,hasValidate:!!createValidateCommand,hasReset:!!createResetCommand,hasLogger:!!logger},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
// #endregion

const program = new Command();

program
  .name('baitin-migration')
  .description('BAITIN Legacy Data Migration CLI Tool')
  .version('1.0.0');

// #region agent log
fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:33',message:'Adding commands',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
// #endregion

try {
  // Add commands
  program.addCommand(createExtractCommand());
  // #region agent log
  fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:37',message:'Extract command added',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  program.addCommand(createLoadCommand());
  program.addCommand(createValidateCommand());
  program.addCommand(createResetCommand());
  
  // #region agent log
  fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:43',message:'All commands added',data:{commandCount:program.commands.length},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
} catch (error: any) {
  // #region agent log
  fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:46',message:'Failed to add commands',data:{error:String(error),stack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.error('Failed to register commands:', error);
  process.exit(1);
}

// Error handling
program.exitOverride();

// Execute CLI
// #region agent log
fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:57',message:'Starting CLI parse',data:{argvCount:process.argv.length},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
// #endregion

program.parseAsync(process.argv).catch((error: any) => {
  // #region agent log
  fetch('http://localhost:7243/ingest/24707caf-a8b6-44e8-aaf3-a79d22b01a39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.ts:60',message:'CLI parse error',data:{error:String(error),code:error?.code,exitCode:error?.exitCode},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  // Ignore help/version display errors (these are normal commander behavior)
  if (error?.code === 'commander.helpDisplayed' || error?.code === 'commander.version') {
    process.exit(0);
  }
  logger?.error('CLI error:', error);
  const errorMessage = error?.message || String(error);
  console.error(chalk?.red(`\n✗ Error: ${errorMessage}\n`) || `\n✗ Error: ${errorMessage}\n`);
  process.exit(error?.exitCode || 1);
});

