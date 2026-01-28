'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatNumber, formatDateShort } from '@/lib/utils';
import type { RegistrationSnapshot } from '@/types';

// Sample data - in production, this would be loaded from the data files
const SAMPLE_DATA: Record<string, RegistrationSnapshot[]> = {
  AZ: [
    { date: '2025-02-01', total: 4355000, democratic: 1395000, republican: 1505000, independent: 1325000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { date: '2025-03-01', total: 4370000, democratic: 1400000, republican: 1510000, independent: 1330000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { date: '2025-04-01', total: 4385000, democratic: 1405000, republican: 1515000, independent: 1335000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { date: '2025-05-01', total: 4400000, democratic: 1410000, republican: 1520000, independent: 1340000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { date: '2025-06-01', total: 4415000, democratic: 1415000, republican: 1525000, independent: 1345000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { date: '2025-07-01', total: 4430000, democratic: 1420000, republican: 1530000, independent: 1350000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { date: '2025-08-01', total: 4445000, democratic: 1425000, republican: 1535000, independent: 1355000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { date: '2025-09-01', total: 4460000, democratic: 1430000, republican: 1540000, independent: 1360000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { date: '2025-10-01', total: 4475000, democratic: 1435000, republican: 1545000, independent: 1365000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { date: '2025-11-01', total: 4490000, democratic: 1440000, republican: 1550000, independent: 1370000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { date: '2025-12-01', total: 4505000, democratic: 1445000, republican: 1555000, independent: 1375000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
    { date: '2026-01-01', total: 4520000, democratic: 1450000, republican: 1560000, independent: 1380000, other: 130000, source: 'AZ SOS', sourceUrl: 'https://azsos.gov' },
  ],
};

interface RegistrationChartProps {
  stateId: string;
  hasPartisanData: boolean;
}

export function RegistrationChart({ stateId, hasPartisanData }: RegistrationChartProps) {
  const data = SAMPLE_DATA[stateId] || [];

  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: formatDateShort(d.date),
      total: d.total,
      democratic: d.democratic,
      republican: d.republican,
      independent: d.independent,
    }));
  }, [data]);

  const latestData = data[data.length - 1];

  if (data.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
          Voter Registration
        </h3>
        <div className="text-sm text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/50 rounded-lg p-4 text-center">
          Registration data not available for this state
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
          Voter Registration
        </h3>
        {latestData && (
          <span className="text-xs text-surface-500">
            {formatNumber(latestData.total)} total
          </span>
        )}
      </div>

      {/* Sparkline / Full Chart */}
      <div className="h-32 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#71717a' }}
              tickLine={false}
              axisLine={{ stroke: '#e4e4e7' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#71717a' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatNumber(value)}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => formatNumber(value)}
            />
            {hasPartisanData ? (
              <>
                <Line
                  type="monotone"
                  dataKey="democratic"
                  stroke="#2e6db4"
                  strokeWidth={2}
                  dot={false}
                  name="Democrat"
                />
                <Line
                  type="monotone"
                  dataKey="republican"
                  stroke="#c41e3a"
                  strokeWidth={2}
                  dot={false}
                  name="Republican"
                />
                <Line
                  type="monotone"
                  dataKey="independent"
                  stroke="#71717a"
                  strokeWidth={2}
                  dot={false}
                  name="Independent"
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Total"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend / Party Breakdown */}
      {hasPartisanData && latestData && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-dem-tilt/20 rounded p-2">
            <div className="text-xs text-surface-500">Democrat</div>
            <div className="text-sm font-semibold text-dem-likely">
              {latestData.democratic ? formatNumber(latestData.democratic) : '-'}
            </div>
            <div className="text-xs text-surface-400">
              {latestData.democratic && latestData.total
                ? `${((latestData.democratic / latestData.total) * 100).toFixed(1)}%`
                : ''}
            </div>
          </div>
          <div className="bg-surface-100 dark:bg-surface-700 rounded p-2">
            <div className="text-xs text-surface-500">Independent</div>
            <div className="text-sm font-semibold text-surface-600 dark:text-surface-300">
              {latestData.independent ? formatNumber(latestData.independent) : '-'}
            </div>
            <div className="text-xs text-surface-400">
              {latestData.independent && latestData.total
                ? `${((latestData.independent / latestData.total) * 100).toFixed(1)}%`
                : ''}
            </div>
          </div>
          <div className="bg-rep-tilt/20 rounded p-2">
            <div className="text-xs text-surface-500">Republican</div>
            <div className="text-sm font-semibold text-rep-likely">
              {latestData.republican ? formatNumber(latestData.republican) : '-'}
            </div>
            <div className="text-xs text-surface-400">
              {latestData.republican && latestData.total
                ? `${((latestData.republican / latestData.total) * 100).toFixed(1)}%`
                : ''}
            </div>
          </div>
        </div>
      )}

      {/* Source Attribution */}
      {latestData && (
        <div className="mt-2 text-xs text-surface-400">
          <span>Source: </span>
          <a
            href={latestData.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-surface-600"
          >
            {latestData.source}
          </a>
          <span> | Last updated: {formatDateShort(latestData.date)}</span>
        </div>
      )}

      {!hasPartisanData && (
        <div className="mt-2 text-xs text-surface-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded px-2 py-1">
          Note: This state does not track party registration
        </div>
      )}
    </div>
  );
}
