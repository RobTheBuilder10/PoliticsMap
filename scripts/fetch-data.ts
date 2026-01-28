/**
 * Data Fetch Script
 *
 * This script fetches voter registration data from state election offices.
 * In production, each state would have a specific parser for their data format.
 *
 * Usage: npm run data:fetch
 */

import * as fs from 'fs';
import * as path from 'path';
import { STATE_CONFIGS, FetchResult, ParsedRegistration } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TRENDS_DIR = path.join(DATA_DIR, 'trends');

// Ensure directories exist
if (!fs.existsSync(TRENDS_DIR)) {
  fs.mkdirSync(TRENDS_DIR, { recursive: true });
}

/**
 * Fetch data from a state's election office
 * In production, this would use actual HTTP requests and parsers
 */
async function fetchStateData(stateId: string): Promise<FetchResult> {
  const config = STATE_CONFIGS[stateId];

  if (!config) {
    return {
      stateId,
      success: false,
      error: `No configuration found for state ${stateId}`,
      timestamp: new Date().toISOString(),
    };
  }

  if (!config.registrationUrl) {
    return {
      stateId,
      success: false,
      error: 'No registration URL configured',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // In production, this would:
    // 1. Fetch the webpage or API endpoint
    // 2. Parse the HTML/JSON/CSV/Excel data
    // 3. Extract registration numbers
    // 4. Return structured data

    console.log(`[${stateId}] Fetching data from ${config.registrationUrl}`);

    // Simulate fetch delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For demonstration, generate sample data
    // In production, this would be actual fetched/parsed data
    const sampleData: ParsedRegistration = generateSampleData(stateId, config);

    return {
      stateId,
      success: true,
      data: sampleData,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      stateId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Generate sample registration data for demonstration
 * In production, this would be replaced with actual parsed data
 */
function generateSampleData(stateId: string, config: typeof STATE_CONFIGS[string]): ParsedRegistration {
  const baseTotal = Math.floor(Math.random() * 5000000) + 1000000;
  const date = new Date().toISOString().split('T')[0];

  const data: ParsedRegistration = {
    date,
    total: baseTotal,
    source: `${config.name} Secretary of State`,
    sourceUrl: config.registrationUrl || '',
  };

  if (config.hasPartisanData) {
    const demShare = 0.3 + Math.random() * 0.1;
    const repShare = 0.3 + Math.random() * 0.1;
    const indShare = 1 - demShare - repShare;

    data.democratic = Math.floor(baseTotal * demShare);
    data.republican = Math.floor(baseTotal * repShare);
    data.independent = Math.floor(baseTotal * indShare * 0.8);
    data.other = baseTotal - data.democratic - data.republican - data.independent;
  }

  return data;
}

/**
 * Update the trends file for a state
 */
function updateTrendsFile(stateId: string, newData: ParsedRegistration): void {
  const trendsFile = path.join(TRENDS_DIR, `${stateId}.json`);
  const config = STATE_CONFIGS[stateId];

  let trends: {
    stateId: string;
    hasPartisanRegistration: boolean;
    registrationHistory: ParsedRegistration[];
    lastUpdated: string;
    updateFrequency: string;
    coverageNotes?: string;
  };

  if (fs.existsSync(trendsFile)) {
    const existing = JSON.parse(fs.readFileSync(trendsFile, 'utf-8'));
    trends = existing;

    // Check if we already have data for this date
    const existingIndex = trends.registrationHistory.findIndex(
      (r) => r.date === newData.date
    );

    if (existingIndex >= 0) {
      // Update existing entry
      trends.registrationHistory[existingIndex] = newData;
    } else {
      // Add new entry
      trends.registrationHistory.push(newData);
    }

    // Sort by date descending
    trends.registrationHistory.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Keep only last 24 months
    trends.registrationHistory = trends.registrationHistory.slice(0, 24);
  } else {
    trends = {
      stateId,
      hasPartisanRegistration: config?.hasPartisanData || false,
      registrationHistory: [newData],
      lastUpdated: new Date().toISOString(),
      updateFrequency: config?.updateFrequency || 'unknown',
    };
  }

  trends.lastUpdated = new Date().toISOString();

  fs.writeFileSync(trendsFile, JSON.stringify(trends, null, 2));
  console.log(`[${stateId}] Updated trends file`);
}

/**
 * Main fetch function
 */
async function main(): Promise<void> {
  console.log('Starting data fetch...\n');

  const results: FetchResult[] = [];
  const stateIds = Object.keys(STATE_CONFIGS);

  for (const stateId of stateIds) {
    const result = await fetchStateData(stateId);
    results.push(result);

    if (result.success && result.data) {
      updateTrendsFile(stateId, result.data as ParsedRegistration);
    } else {
      console.error(`[${stateId}] Failed: ${result.error}`);
    }
  }

  // Summary
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log('\n========================================');
  console.log(`Fetch complete: ${successful} succeeded, ${failed} failed`);
  console.log('========================================\n');

  // Write fetch log
  const logFile = path.join(DATA_DIR, 'fetch-log.json');
  fs.writeFileSync(
    logFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        results,
        summary: { successful, failed, total: results.length },
      },
      null,
      2
    )
  );
}

main().catch(console.error);
