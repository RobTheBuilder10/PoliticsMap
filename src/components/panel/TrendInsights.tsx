'use client';

import React from 'react';
import { formatNumber, cn } from '@/lib/utils';
import type { TrendInsight } from '@/types';

// Sample trend insights
const SAMPLE_TRENDS: Record<string, TrendInsight> = {
  AZ: {
    momChange: 15000,
    momPartyShift: {
      dem: 5000,
      rep: 5000,
      ind: 5000,
    },
    twelveMonthSlope: 'up',
    slopeValue: 165000,
  },
};

interface TrendInsightsProps {
  stateId: string;
}

export function TrendInsights({ stateId }: TrendInsightsProps) {
  const trends = SAMPLE_TRENDS[stateId];

  if (!trends) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
          Registration Trends
        </h3>
        <div className="text-sm text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/50 rounded-lg p-4 text-center">
          Trend data not available
        </div>
      </div>
    );
  }

  const getTrendIcon = (slope: 'up' | 'down' | 'flat') => {
    switch (slope) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-surface-500';
  };

  const formatChange = (value: number) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${formatNumber(value)}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300">
          Registration Trends
        </h3>
        <span className="text-xs text-surface-400 bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded">
          Not predictive
        </span>
      </div>

      <div className="space-y-3">
        {/* Month-over-Month Change */}
        <div className="flex items-center justify-between p-2 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
          <div className="text-sm text-surface-600 dark:text-surface-400">
            Month-over-Month
          </div>
          <div className={cn('text-sm font-semibold', getChangeColor(trends.momChange))}>
            {formatChange(trends.momChange)}
          </div>
        </div>

        {/* Party Shifts */}
        {trends.momPartyShift && (
          <div className="p-2 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
            <div className="text-xs text-surface-500 dark:text-surface-400 mb-2">
              Party Registration Changes (MoM)
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-surface-400">Dem</div>
                <div className={cn('text-sm font-medium', getChangeColor(trends.momPartyShift.dem))}>
                  {formatChange(trends.momPartyShift.dem)}
                </div>
              </div>
              <div>
                <div className="text-xs text-surface-400">Ind</div>
                <div className={cn('text-sm font-medium', getChangeColor(trends.momPartyShift.ind))}>
                  {formatChange(trends.momPartyShift.ind)}
                </div>
              </div>
              <div>
                <div className="text-xs text-surface-400">Rep</div>
                <div className={cn('text-sm font-medium', getChangeColor(trends.momPartyShift.rep))}>
                  {formatChange(trends.momPartyShift.rep)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 12-Month Trend */}
        <div className="flex items-center justify-between p-2 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-600 dark:text-surface-400">
              12-Month Trend
            </span>
            {getTrendIcon(trends.twelveMonthSlope)}
          </div>
          <div className="text-sm">
            <span
              className={cn(
                'font-semibold',
                trends.twelveMonthSlope === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : trends.twelveMonthSlope === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-surface-500'
              )}
            >
              {trends.slopeValue !== undefined && (
                <>
                  {trends.slopeValue > 0 ? '+' : ''}
                  {formatNumber(trends.slopeValue)}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-surface-400 dark:text-surface-500 italic">
          These are registration trends only and should not be interpreted as predictions of election outcomes.
          Registration patterns may not reflect actual voting behavior.
        </div>
      </div>
    </div>
  );
}
