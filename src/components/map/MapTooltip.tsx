'use client';

import React from 'react';
import { getRatingColor, getRatingLabel, formatNumber } from '@/lib/utils';
import type { Rating, RegistrationSnapshot, ElectionResult } from '@/types';
import statesData from '@/data/states.json';

interface MapTooltipProps {
  stateId: string;
  stateName: string;
  rating?: Rating;
  registration?: RegistrationSnapshot;
  lastResult?: ElectionResult;
  x: number;
  y: number;
  colorblindMode?: boolean;
}

export function MapTooltip({
  stateId,
  stateName,
  rating,
  registration,
  lastResult,
  x,
  y,
  colorblindMode = false,
}: MapTooltipProps) {
  const state = (statesData.states as Record<string, { electoralVotes: number }>)[stateId];
  const electoralVotes = state?.electoralVotes || 0;
  const ratingColor = getRatingColor(rating, colorblindMode);

  return (
    <div
      className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
      style={{
        left: x,
        top: y - 8,
      }}
    >
      <div className="bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 p-3 min-w-[200px] max-w-[280px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-surface-900 dark:text-white">{stateName}</h3>
          <span className="text-sm text-surface-500 dark:text-surface-400">
            {electoralVotes} EV
          </span>
        </div>

        {/* Rating Badge */}
        <div className="mb-2">
          <span
            className="inline-flex items-center px-2 py-1 rounded text-sm font-medium"
            style={{
              backgroundColor: ratingColor.fill,
              color: ratingColor.text,
            }}
          >
            {rating ? getRatingLabel(rating.party, rating.strength) : 'Unrated'}
          </span>
        </div>

        {/* Registration Stats */}
        {registration && (
          <div className="border-t border-surface-200 dark:border-surface-700 pt-2 mt-2">
            <div className="text-xs text-surface-500 dark:text-surface-400 mb-1">
              Registration
            </div>
            <div className="text-sm text-surface-900 dark:text-white">
              {formatNumber(registration.total)} voters
            </div>
            {registration.democratic !== undefined && (
              <div className="flex gap-2 text-xs mt-1">
                <span className="text-dem-likely">
                  D: {formatNumber(registration.democratic)}
                </span>
                <span className="text-rep-likely">
                  R: {formatNumber(registration.republican || 0)}
                </span>
                {registration.independent !== undefined && (
                  <span className="text-surface-500">
                    I: {formatNumber(registration.independent)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Last Result */}
        {lastResult && (
          <div className="border-t border-surface-200 dark:border-surface-700 pt-2 mt-2">
            <div className="text-xs text-surface-500 dark:text-surface-400 mb-1">
              {lastResult.year} Result
            </div>
            <div className="text-sm">
              <span
                className={
                  lastResult.winnerParty === 'dem'
                    ? 'text-dem-likely'
                    : lastResult.winnerParty === 'rep'
                    ? 'text-rep-likely'
                    : 'text-surface-600'
                }
              >
                {lastResult.winner}
              </span>
              <span className="text-surface-500 dark:text-surface-400 ml-1">
                +{lastResult.margin.toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        {rating?.notes && (
          <div className="border-t border-surface-200 dark:border-surface-700 pt-2 mt-2">
            <div className="text-xs text-surface-500 dark:text-surface-400 italic">
              {rating.notes}
            </div>
          </div>
        )}

        {/* Tooltip Arrow */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
          <div className="border-8 border-transparent border-t-white dark:border-t-surface-800" />
        </div>
      </div>
    </div>
  );
}
