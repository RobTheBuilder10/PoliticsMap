'use client';

import React, { useState } from 'react';
import { cn, formatDate } from '@/lib/utils';
import statesData from '@/data/states.json';
import coverageData from '@/data/coverage.json';
import sourcesData from '@/data/sources.json';

type FilterType = 'all' | 'monthly' | 'quarterly' | 'annual' | 'none';

export default function CoveragePage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const states = Object.values(statesData.states) as Array<{
    id: string;
    name: string;
    hasPartisanRegistration: boolean;
  }>;

  const coverage = coverageData.coverage as Record<string, {
    registration: {
      available: boolean;
      frequency: string;
      hasPartisanBreakdown: boolean;
      lastUpdated?: string;
      sourceUrl?: string;
      notes?: string;
    };
    turnout: { available: boolean; years: number[] };
    results: { presidential: number[]; senate: number[]; governor: number[]; house: number[] };
    calendar: { available: boolean; isReliable: boolean };
  }>;

  const filteredStates = states.filter((state) => {
    if (filter === 'all') return true;
    const stateCoverage = coverage[state.id];
    if (!stateCoverage) return filter === 'none';
    return stateCoverage.registration.frequency === filter;
  });

  const getFrequencyBadge = (frequency: string) => {
    const colors: Record<string, string> = {
      monthly: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      quarterly: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      annual: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      biennial: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      none: 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400',
    };

    return colors[frequency] || colors.none;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
          Data Coverage
        </h1>
        <p className="text-surface-600 dark:text-surface-400 max-w-3xl">
          This page shows what data is available for each state, including registration statistics,
          turnout history, election results, and calendar information. We aim for transparency
          about what data we have and its limitations.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {coverageData.summary.statesWithMonthlyData.length}
          </div>
          <div className="text-sm text-surface-500">States with Monthly Data</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {coverageData.summary.statesWithQuarterlyData.length}
          </div>
          <div className="text-sm text-surface-500">Quarterly Updates</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {coverageData.summary.statesWithPartisanBreakdown.length}
          </div>
          <div className="text-sm text-surface-500">With Partisan Data</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-surface-600 dark:text-surface-400">
            {sourcesData.sources.length}
          </div>
          <div className="text-sm text-surface-500">Data Sources</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
          Filter by update frequency:
        </span>
        <div className="flex flex-wrap gap-2">
          {(['all', 'monthly', 'quarterly', 'annual'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1 text-sm rounded-lg transition-colors',
                filter === f
                  ? 'bg-surface-800 dark:bg-surface-200 text-white dark:text-surface-900'
                  : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* State Coverage Table */}
      <div className="card overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  State
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Registration
                </th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Partisan Data
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Last Updated
                </th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Turnout
                </th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Results
                </th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Calendar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {filteredStates.map((state) => {
                const stateCoverage = coverage[state.id];

                return (
                  <tr
                    key={state.id}
                    className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-surface-900 dark:text-white">
                        {state.name}
                      </div>
                      <div className="text-xs text-surface-500">{state.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      {stateCoverage?.registration.available ? (
                        <span
                          className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded',
                            getFrequencyBadge(stateCoverage.registration.frequency)
                          )}
                        >
                          {stateCoverage.registration.frequency}
                        </span>
                      ) : (
                        <span className="text-surface-400 text-sm">Not available</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stateCoverage?.registration.hasPartisanBreakdown ? (
                        <span className="text-green-500">
                          <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-surface-300 dark:text-surface-600">
                          <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-500">
                      {stateCoverage?.registration.lastUpdated
                        ? formatDate(stateCoverage.registration.lastUpdated)
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stateCoverage?.turnout.available ? (
                        <span className="text-sm text-surface-600 dark:text-surface-400">
                          {stateCoverage.turnout.years.length} years
                        </span>
                      ) : (
                        <span className="text-surface-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stateCoverage?.results ? (
                        <span className="text-green-500">
                          <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-surface-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stateCoverage?.calendar.available ? (
                        stateCoverage.calendar.isReliable ? (
                          <span className="text-green-500">
                            <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-yellow-500" title="Limited reliability">
                            <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </span>
                        )
                      ) : (
                        <span className="text-surface-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">
          Data Sources
        </h2>
        <div className="grid gap-4">
          {sourcesData.sources.map((source) => (
            <div key={source.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-surface-900 dark:text-white">
                    {source.name}
                  </h3>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {source.url}
                  </a>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 text-xs rounded bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400">
                      {source.type}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400">
                      {source.updateFrequency}
                    </span>
                    {source.states.length > 0 && (
                      <span className="px-2 py-0.5 text-xs rounded bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400">
                        {source.states.join(', ')}
                      </span>
                    )}
                  </div>
                  {source.notes && (
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">
                      {source.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
          Data Limitations
        </h3>
        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
          <li>
            • Some states do not track partisan voter registration.
          </li>
          <li>
            • Update frequencies vary by state and may change without notice.
          </li>
          <li>
            • Historical data availability depends on state record-keeping practices.
          </li>
          <li>
            • Registration trends should not be interpreted as election predictions.
          </li>
        </ul>
      </div>
    </div>
  );
}
