'use client';

import React from 'react';
import { formatPercentage, formatMargin, cn } from '@/lib/utils';
import type { ElectionResult, ElectionType } from '@/types';

// Sample results data
const SAMPLE_RESULTS: Record<string, Record<string, ElectionResult[]>> = {
  AZ: {
    presidential: [
      {
        year: 2024,
        electionType: 'presidential',
        stateId: 'AZ',
        winner: 'Democratic Candidate',
        winnerParty: 'dem',
        margin: 0.3,
        candidates: [
          { name: 'Democratic Candidate', party: 'dem', votes: 1650000, percentage: 49.5 },
          { name: 'Republican Candidate', party: 'rep', votes: 1640000, percentage: 49.2 },
        ],
        totalVotes: 3333000,
        turnout: 78.5,
        source: 'AZ SOS',
        sourceUrl: 'https://azsos.gov',
      },
      {
        year: 2020,
        electionType: 'presidential',
        stateId: 'AZ',
        winner: 'Joe Biden',
        winnerParty: 'dem',
        margin: 0.3,
        candidates: [
          { name: 'Joe Biden', party: 'dem', votes: 1672143, percentage: 49.4 },
          { name: 'Donald Trump', party: 'rep', votes: 1661686, percentage: 49.1 },
        ],
        totalVotes: 3387326,
        turnout: 79.9,
        source: 'AZ SOS',
        sourceUrl: 'https://azsos.gov',
      },
      {
        year: 2016,
        electionType: 'presidential',
        stateId: 'AZ',
        winner: 'Donald Trump',
        winnerParty: 'rep',
        margin: 3.5,
        candidates: [
          { name: 'Donald Trump', party: 'rep', votes: 1252401, percentage: 48.7 },
          { name: 'Hillary Clinton', party: 'dem', votes: 1161167, percentage: 45.1 },
        ],
        totalVotes: 2573165,
        turnout: 74.2,
        source: 'AZ SOS',
        sourceUrl: 'https://azsos.gov',
      },
    ],
    senate: [
      {
        year: 2024,
        electionType: 'senate',
        stateId: 'AZ',
        winner: 'Ruben Gallego',
        winnerParty: 'dem',
        margin: 2.5,
        candidates: [
          { name: 'Ruben Gallego', party: 'dem', votes: 1690000, percentage: 50.8 },
          { name: 'Kari Lake', party: 'rep', votes: 1610000, percentage: 48.3 },
        ],
        totalVotes: 3330000,
        source: 'AZ SOS',
        sourceUrl: 'https://azsos.gov',
      },
      {
        year: 2022,
        electionType: 'senate',
        stateId: 'AZ',
        winner: 'Mark Kelly',
        winnerParty: 'dem',
        margin: 5.0,
        candidates: [
          { name: 'Mark Kelly', party: 'dem', votes: 1322027, percentage: 51.4 },
          { name: 'Blake Masters', party: 'rep', votes: 1196308, percentage: 46.5 },
        ],
        totalVotes: 2572303,
        source: 'AZ SOS',
        sourceUrl: 'https://azsos.gov',
      },
      {
        year: 2020,
        electionType: 'senate',
        stateId: 'AZ',
        winner: 'Mark Kelly',
        winnerParty: 'dem',
        margin: 2.4,
        candidates: [
          { name: 'Mark Kelly', party: 'dem', votes: 1716467, percentage: 51.2 },
          { name: 'Martha McSally', party: 'rep', votes: 1637661, percentage: 48.8 },
        ],
        totalVotes: 3354128,
        source: 'AZ SOS',
        sourceUrl: 'https://azsos.gov',
      },
    ],
    governor: [
      {
        year: 2022,
        electionType: 'governor',
        stateId: 'AZ',
        winner: 'Katie Hobbs',
        winnerParty: 'dem',
        margin: 0.6,
        candidates: [
          { name: 'Katie Hobbs', party: 'dem', votes: 1287891, percentage: 50.3 },
          { name: 'Kari Lake', party: 'rep', votes: 1270774, percentage: 49.7 },
        ],
        totalVotes: 2558665,
        source: 'AZ SOS',
        sourceUrl: 'https://azsos.gov',
      },
      {
        year: 2018,
        electionType: 'governor',
        stateId: 'AZ',
        winner: 'Doug Ducey',
        winnerParty: 'rep',
        margin: 14.2,
        candidates: [
          { name: 'Doug Ducey', party: 'rep', votes: 1330863, percentage: 56.0 },
          { name: 'David Garcia', party: 'dem', votes: 993879, percentage: 41.8 },
        ],
        totalVotes: 2377001,
        source: 'AZ SOS',
        sourceUrl: 'https://azsos.gov',
      },
    ],
  },
};

interface ResultsHistoryProps {
  stateId: string;
  electionType: ElectionType | string;
}

export function ResultsHistory({ stateId, electionType }: ResultsHistoryProps) {
  const stateResults = SAMPLE_RESULTS[stateId];
  const typeKey = electionType === 'house' ? 'presidential' : electionType;
  const results = stateResults?.[typeKey] || [];

  if (results.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
          Results History
        </h3>
        <div className="text-sm text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/50 rounded-lg p-4 text-center">
          No historical results available
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
        Results History ({electionType.charAt(0).toUpperCase() + electionType.slice(1)})
      </h3>

      <div className="space-y-3">
        {results.slice(0, 3).map((result) => (
          <div
            key={`${result.year}-${result.electionType}`}
            className="bg-surface-50 dark:bg-surface-800/50 rounded-lg p-3"
          >
            {/* Year and Winner */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-surface-900 dark:text-white">
                {result.year}
              </span>
              <span
                className={cn(
                  'text-sm font-medium px-2 py-0.5 rounded',
                  result.winnerParty === 'dem'
                    ? 'bg-dem-tilt text-dem-safe'
                    : result.winnerParty === 'rep'
                    ? 'bg-rep-tilt text-rep-safe'
                    : 'bg-surface-200 text-surface-700'
                )}
              >
                {result.winnerParty === 'dem' ? 'D' : 'R'}{result.margin > 0 ? '+' : ''}{Math.abs(result.margin).toFixed(1)}
              </span>
            </div>

            {/* Candidates */}
            <div className="space-y-1">
              {result.candidates.slice(0, 2).map((candidate) => (
                <div
                  key={candidate.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        candidate.party === 'dem'
                          ? 'bg-dem-likely'
                          : candidate.party === 'rep'
                          ? 'bg-rep-likely'
                          : 'bg-surface-400'
                      )}
                    />
                    <span className="text-surface-700 dark:text-surface-300">
                      {candidate.name}
                    </span>
                  </div>
                  <span className="text-surface-500 dark:text-surface-400">
                    {formatPercentage(candidate.percentage)}
                  </span>
                </div>
              ))}
            </div>

            {/* Margin Bar */}
            <div className="mt-2 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden flex">
              {result.candidates[0] && result.candidates[1] && (
                <>
                  <div
                    className={cn(
                      'transition-all',
                      result.candidates[0].party === 'dem' ? 'bg-dem-likely' : 'bg-rep-likely'
                    )}
                    style={{ width: `${result.candidates[0].percentage}%` }}
                  />
                  <div
                    className={cn(
                      'transition-all',
                      result.candidates[1].party === 'dem' ? 'bg-dem-likely' : 'bg-rep-likely'
                    )}
                    style={{ width: `${result.candidates[1].percentage}%` }}
                  />
                </>
              )}
            </div>

            {/* Turnout if available */}
            {result.turnout && (
              <div className="mt-2 text-xs text-surface-400">
                Turnout: {formatPercentage(result.turnout)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Source */}
      {results[0] && (
        <div className="mt-2 text-xs text-surface-400">
          Source:{' '}
          <a
            href={results[0].sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-surface-600"
          >
            {results[0].source}
          </a>
        </div>
      )}
    </div>
  );
}
