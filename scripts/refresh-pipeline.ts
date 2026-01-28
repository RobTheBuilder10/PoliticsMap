/**
 * Data Refresh Pipeline
 *
 * Orchestrates the full data refresh process:
 * 1. Fetch new data from state sources
 * 2. Parse and transform data
 * 3. Validate data integrity
 * 4. Version and commit changes
 *
 * Usage: npm run data:refresh
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { STATE_CONFIGS, PipelineRun } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ERRORS_FILE = path.join(DATA_DIR, 'errors.json');

interface PipelineResult {
  success: boolean;
  statesProcessed: number;
  statesSuccessful: number;
  statesFailed: number;
  errors: Array<{
    stateId: string;
    errorType: string;
    message: string;
  }>;
  duration: number;
}

/**
 * Run a command and capture output
 */
function runCommand(command: string): { success: boolean; output: string } {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: error.stderr || error.message };
  }
}

/**
 * Update the errors.json file with pipeline status
 */
function updateErrorsFile(result: PipelineResult): void {
  const errorsData = {
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      description: 'Pipeline errors and data quality issues',
    },
    errors: result.errors,
    warnings: [],
    lastPipelineRun: {
      timestamp: new Date().toISOString(),
      duration: result.duration,
      statesProcessed: result.statesProcessed,
      statesSuccessful: result.statesSuccessful,
      statesFailed: result.statesFailed,
    },
  };

  fs.writeFileSync(ERRORS_FILE, JSON.stringify(errorsData, null, 2));
}

/**
 * Main pipeline function
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  console.log('========================================');
  console.log('Starting Data Refresh Pipeline');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('========================================\n');

  const result: PipelineResult = {
    success: true,
    statesProcessed: Object.keys(STATE_CONFIGS).length,
    statesSuccessful: 0,
    statesFailed: 0,
    errors: [],
    duration: 0,
  };

  // Step 1: Fetch new data
  console.log('Step 1: Fetching data from state sources...\n');
  const fetchResult = runCommand('npx tsx scripts/fetch-data.ts');

  if (!fetchResult.success) {
    console.error('Fetch step failed:');
    console.error(fetchResult.output);
    result.errors.push({
      stateId: 'ALL',
      errorType: 'fetch',
      message: 'Fetch step failed: ' + fetchResult.output.slice(0, 200),
    });
  } else {
    console.log('Fetch completed successfully.\n');
  }

  // Step 2: Validate data
  console.log('Step 2: Validating data...\n');
  const validateResult = runCommand('npx tsx scripts/validate-data.ts');

  if (!validateResult.success) {
    console.error('Validation step failed:');
    console.error(validateResult.output);
    result.success = false;
    result.errors.push({
      stateId: 'ALL',
      errorType: 'validate',
      message: 'Validation failed. See validation-report.json for details.',
    });
  } else {
    console.log('Validation completed successfully.\n');
  }

  // Read fetch log to get per-state results
  const fetchLogFile = path.join(DATA_DIR, 'fetch-log.json');
  if (fs.existsSync(fetchLogFile)) {
    const fetchLog = JSON.parse(fs.readFileSync(fetchLogFile, 'utf-8'));
    result.statesSuccessful = fetchLog.summary?.successful || 0;
    result.statesFailed = fetchLog.summary?.failed || 0;

    // Add individual state errors
    fetchLog.results
      ?.filter((r: any) => !r.success)
      .forEach((r: any) => {
        result.errors.push({
          stateId: r.stateId,
          errorType: 'fetch',
          message: r.error || 'Unknown error',
        });
      });
  }

  // Calculate duration
  result.duration = Date.now() - startTime;

  // Update errors file
  updateErrorsFile(result);

  // Step 3: Update coverage.json with new lastUpdated timestamps
  console.log('Step 3: Updating coverage metadata...\n');
  const coverageFile = path.join(DATA_DIR, 'coverage.json');
  if (fs.existsSync(coverageFile)) {
    const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
    coverage.summary.lastPipelineRun = new Date().toISOString();
    fs.writeFileSync(coverageFile, JSON.stringify(coverage, null, 2));
  }

  // Print summary
  console.log('\n========================================');
  console.log('Pipeline Complete');
  console.log('========================================');
  console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
  console.log(`States Processed: ${result.statesProcessed}`);
  console.log(`Successful: ${result.statesSuccessful}`);
  console.log(`Failed: ${result.statesFailed}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Overall Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  console.log('========================================\n');

  if (result.errors.length > 0) {
    console.log('Errors encountered:');
    result.errors.forEach((e) => {
      console.log(`  [${e.stateId}] ${e.errorType}: ${e.message}`);
    });
  }

  // Exit with appropriate code
  if (!result.success) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Pipeline failed with error:', error);
  process.exit(1);
});
