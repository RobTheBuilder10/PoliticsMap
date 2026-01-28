/**
 * Data Validation Script
 *
 * Validates all data files to ensure data integrity and consistency.
 * Runs validation rules and generates a report.
 *
 * Usage: npm run data:validate
 */

import * as fs from 'fs';
import * as path from 'path';
import { ValidationResult, ValidationError, ParsedRegistration } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TRENDS_DIR = path.join(DATA_DIR, 'trends');

interface ValidationReport {
  timestamp: string;
  valid: boolean;
  filesChecked: number;
  errors: Array<{
    file: string;
    errors: ValidationError[];
  }>;
  warnings: Array<{
    file: string;
    warnings: ValidationError[];
  }>;
}

/**
 * Validate a registration snapshot
 */
function validateRegistration(data: ParsedRegistration, index: number): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!data.date) {
    errors.push({
      field: `registrationHistory[${index}].date`,
      message: 'Date is required',
      severity: 'error',
    });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push({
      field: `registrationHistory[${index}].date`,
      message: 'Date must be in YYYY-MM-DD format',
      severity: 'error',
    });
  }

  // Total must be positive integer
  if (typeof data.total !== 'number' || data.total < 0) {
    errors.push({
      field: `registrationHistory[${index}].total`,
      message: 'Total must be a non-negative integer',
      severity: 'error',
    });
  }

  // If partisan data exists, validate it
  if (data.democratic !== undefined) {
    if (typeof data.democratic !== 'number' || data.democratic < 0) {
      errors.push({
        field: `registrationHistory[${index}].democratic`,
        message: 'Democratic count must be a non-negative integer',
        severity: 'error',
      });
    }
  }

  if (data.republican !== undefined) {
    if (typeof data.republican !== 'number' || data.republican < 0) {
      errors.push({
        field: `registrationHistory[${index}].republican`,
        message: 'Republican count must be a non-negative integer',
        severity: 'error',
      });
    }
  }

  // Check if partisan totals roughly match overall total
  if (data.democratic !== undefined && data.republican !== undefined) {
    const partisanTotal =
      (data.democratic || 0) +
      (data.republican || 0) +
      (data.independent || 0) +
      (data.other || 0) +
      (data.noParty || 0);

    const diff = Math.abs(partisanTotal - data.total);
    const tolerance = data.total * 0.01; // 1% tolerance

    if (diff > tolerance) {
      warnings.push({
        field: `registrationHistory[${index}]`,
        message: `Partisan totals (${partisanTotal}) differ from overall total (${data.total}) by more than 1%`,
        severity: 'warning',
      });
    }
  }

  // Source attribution
  if (!data.source) {
    warnings.push({
      field: `registrationHistory[${index}].source`,
      message: 'Source attribution is recommended',
      severity: 'warning',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a trends file
 */
function validateTrendsFile(filePath: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Check required fields
    if (!data.stateId) {
      errors.push({
        field: 'stateId',
        message: 'stateId is required',
        severity: 'error',
      });
    }

    if (typeof data.hasPartisanRegistration !== 'boolean') {
      errors.push({
        field: 'hasPartisanRegistration',
        message: 'hasPartisanRegistration must be a boolean',
        severity: 'error',
      });
    }

    if (!Array.isArray(data.registrationHistory)) {
      errors.push({
        field: 'registrationHistory',
        message: 'registrationHistory must be an array',
        severity: 'error',
      });
    } else {
      // Validate each registration entry
      data.registrationHistory.forEach((entry: ParsedRegistration, index: number) => {
        const result = validateRegistration(entry, index);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      });

      // Check for duplicate dates
      const dates = data.registrationHistory.map((r: ParsedRegistration) => r.date);
      const uniqueDates = new Set(dates);
      if (dates.length !== uniqueDates.size) {
        warnings.push({
          field: 'registrationHistory',
          message: 'Duplicate dates found in registration history',
          severity: 'warning',
        });
      }

      // Check chronological order
      for (let i = 1; i < data.registrationHistory.length; i++) {
        const prev = new Date(data.registrationHistory[i - 1].date);
        const curr = new Date(data.registrationHistory[i].date);
        if (curr > prev) {
          warnings.push({
            field: 'registrationHistory',
            message: 'Registration history is not sorted in descending chronological order',
            severity: 'warning',
          });
          break;
        }
      }
    }

    if (!data.lastUpdated) {
      warnings.push({
        field: 'lastUpdated',
        message: 'lastUpdated timestamp is recommended',
        severity: 'warning',
      });
    }
  } catch (error) {
    errors.push({
      field: 'file',
      message: error instanceof Error ? error.message : 'Failed to parse JSON',
      severity: 'error',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate states.json
 */
function validateStatesFile(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const filePath = path.join(DATA_DIR, 'states.json');

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!data.states || typeof data.states !== 'object') {
      errors.push({
        field: 'states',
        message: 'states object is required',
        severity: 'error',
      });
    } else {
      // Validate each state
      Object.entries(data.states).forEach(([stateId, state]: [string, any]) => {
        if (!state.name) {
          errors.push({
            field: `states.${stateId}.name`,
            message: 'State name is required',
            severity: 'error',
          });
        }

        if (typeof state.electoralVotes !== 'number' || state.electoralVotes < 0) {
          errors.push({
            field: `states.${stateId}.electoralVotes`,
            message: 'Electoral votes must be a non-negative integer',
            severity: 'error',
          });
        }

        if (typeof state.houseDistricts !== 'number' || state.houseDistricts < 0) {
          errors.push({
            field: `states.${stateId}.houseDistricts`,
            message: 'House districts must be a non-negative integer',
            severity: 'error',
          });
        }
      });

      // Check total electoral votes
      const totalEV = Object.values(data.states).reduce(
        (sum: number, state: any) => sum + (state.electoralVotes || 0),
        0
      );
      if (totalEV !== 538) {
        warnings.push({
          field: 'states',
          message: `Total electoral votes is ${totalEV}, expected 538`,
          severity: 'warning',
        });
      }
    }
  } catch (error) {
    errors.push({
      field: 'file',
      message: error instanceof Error ? error.message : 'Failed to parse JSON',
      severity: 'error',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Main validation function
 */
async function main(): Promise<void> {
  console.log('Starting data validation...\n');

  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    valid: true,
    filesChecked: 0,
    errors: [],
    warnings: [],
  };

  // Validate states.json
  console.log('Validating states.json...');
  const statesResult = validateStatesFile();
  report.filesChecked++;
  if (!statesResult.valid) {
    report.valid = false;
    report.errors.push({ file: 'states.json', errors: statesResult.errors });
  }
  if (statesResult.warnings.length > 0) {
    report.warnings.push({ file: 'states.json', warnings: statesResult.warnings });
  }

  // Validate trends files
  if (fs.existsSync(TRENDS_DIR)) {
    const trendsFiles = fs.readdirSync(TRENDS_DIR).filter((f) => f.endsWith('.json'));

    for (const file of trendsFiles) {
      const filePath = path.join(TRENDS_DIR, file);
      console.log(`Validating ${file}...`);

      const result = validateTrendsFile(filePath);
      report.filesChecked++;

      if (!result.valid) {
        report.valid = false;
        report.errors.push({ file: `trends/${file}`, errors: result.errors });
      }
      if (result.warnings.length > 0) {
        report.warnings.push({ file: `trends/${file}`, warnings: result.warnings });
      }
    }
  }

  // Print summary
  console.log('\n========================================');
  console.log(`Validation ${report.valid ? 'PASSED' : 'FAILED'}`);
  console.log(`Files checked: ${report.filesChecked}`);
  console.log(`Errors: ${report.errors.reduce((sum, e) => sum + e.errors.length, 0)}`);
  console.log(`Warnings: ${report.warnings.reduce((sum, w) => sum + w.warnings.length, 0)}`);
  console.log('========================================\n');

  // Print errors
  if (report.errors.length > 0) {
    console.log('ERRORS:');
    report.errors.forEach(({ file, errors }) => {
      console.log(`  ${file}:`);
      errors.forEach((e) => {
        console.log(`    - [${e.field}] ${e.message}`);
      });
    });
    console.log('');
  }

  // Print warnings
  if (report.warnings.length > 0) {
    console.log('WARNINGS:');
    report.warnings.forEach(({ file, warnings }) => {
      console.log(`  ${file}:`);
      warnings.forEach((w) => {
        console.log(`    - [${w.field}] ${w.message}`);
      });
    });
    console.log('');
  }

  // Write validation report
  const reportFile = path.join(DATA_DIR, 'validation-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`Validation report written to ${reportFile}`);

  // Exit with error code if validation failed
  if (!report.valid) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Validation failed:', error);
  process.exit(1);
});
