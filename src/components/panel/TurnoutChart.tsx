'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatPercentage } from '@/lib/utils';
import type { TurnoutData } from '@/types';

// Sample turnout data
const SAMPLE_TURNOUT: Record<string, TurnoutData[]> = {
  AZ: [
    { year: 2016, electionType: 'general', totalVotes: 2573165, turnoutRate: 74.2, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { year: 2018, electionType: 'general', totalVotes: 2377001, turnoutRate: 64.8, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { year: 2020, electionType: 'general', totalVotes: 3387326, turnoutRate: 79.9, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { year: 2022, electionType: 'general', totalVotes: 2572303, turnoutRate: 55.1, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { year: 2024, electionType: 'general', totalVotes: 3333000, turnoutRate: 78.5, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
  ],
};

interface TurnoutChartProps {
  stateId: string;
}

export function TurnoutChart({ stateId }: TurnoutChartProps) {
  const data = SAMPLE_TURNOUT[stateId] || [];

  if (data.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
          Voter Turnout
        </h3>
        <div className="text-sm text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/50 rounded-lg p-4 text-center">
          Turnout data not available for this state
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    year: d.year.toString(),
    turnout: d.turnoutRate || 0,
    isPresidential: d.year % 4 === 0,
  }));

  const latestData = data[data.length - 1];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
          Voter Turnout
        </h3>
        {latestData?.turnoutRate && (
          <span className="text-xs text-surface-500">
            {latestData.year}: {formatPercentage(latestData.turnoutRate)}
          </span>
        )}
      </div>

      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis
              dataKey="year"
              tick={{ fontSize: 10, fill: '#71717a' }}
              tickLine={false}
              axisLine={{ stroke: '#e4e4e7' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#71717a' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Turnout']}
            />
            <Bar dataKey="turnout" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPresidential ? '#3b82f6' : '#94a3b8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-surface-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Presidential</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-400" />
          <span>Midterm</span>
        </div>
      </div>

      {/* Source */}
      {latestData && (
        <div className="mt-2 text-xs text-surface-400">
          Source:{' '}
          <a
            href={latestData.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-surface-600"
          >
            {latestData.source}
          </a>
        </div>
      )}
    </div>
  );
}
