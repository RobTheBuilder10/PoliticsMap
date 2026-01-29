'use client';

import React from 'react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

interface SummaryBarProps {
  className?: string;
}

export function SummaryBar({ className }: SummaryBarProps) {
  const { layer, getScenarioSummary, settings } = useStore();
  const summary = getScenarioSummary();

  const colorblind = settings.colorblindMode;

  // Colors based on colorblind mode
  const demColor = colorblind ? 'bg-[#0072B2]' : 'bg-dem-likely';
  const repColor = colorblind ? 'bg-[#D55E00]' : 'bg-rep-likely';
  const bgColor = colorblind ? 'bg-[#CC79A7]' : 'bg-battleground';

  return (
    <div className={cn('bg-white dark:bg-surface-800 rounded-lg shadow-md border border-surface-200 dark:border-surface-700 p-2 sm:p-4', className)}>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Electoral College */}
        <div className="text-center">
          <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-2">
            Electoral College
          </h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-center">
              <div className={cn('text-lg sm:text-2xl font-bold', colorblind ? 'text-[#0072B2]' : 'text-dem-likely')}>
                {summary.electoralCollege.dem}
              </div>
              <div className="text-xs text-surface-500">Dem</div>
            </div>
            <div className="w-px h-8 bg-surface-200 dark:bg-surface-600" />
            <div className="text-center">
              <div className={cn('text-lg sm:text-2xl font-bold', colorblind ? 'text-[#CC79A7]' : 'text-battleground')}>
                {summary.electoralCollege.battleground}
              </div>
              <div className="text-xs text-surface-500">Toss-up</div>
            </div>
            <div className="w-px h-8 bg-surface-200 dark:bg-surface-600" />
            <div className="text-center">
              <div className={cn('text-lg sm:text-2xl font-bold', colorblind ? 'text-[#D55E00]' : 'text-rep-likely')}>
                {summary.electoralCollege.rep}
              </div>
              <div className="text-xs text-surface-500">Rep</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full overflow-hidden bg-surface-200 dark:bg-surface-700 flex">
            <div
              className={cn('transition-all duration-300', demColor)}
              style={{
                width: `${(summary.electoralCollege.dem / 538) * 100}%`,
              }}
            />
            <div
              className={cn('transition-all duration-300', bgColor)}
              style={{
                width: `${(summary.electoralCollege.battleground / 538) * 100}%`,
              }}
            />
            <div
              className={cn('transition-all duration-300', repColor)}
              style={{
                width: `${(summary.electoralCollege.rep / 538) * 100}%`,
              }}
            />
          </div>
          <div className="text-xs text-surface-400 mt-1">270 to win</div>
        </div>

        {/* Senate */}
        <div className="text-center">
          <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-2">
            Senate
          </h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-center">
              <div className={cn('text-lg sm:text-2xl font-bold', colorblind ? 'text-[#0072B2]' : 'text-dem-likely')}>
                {summary.senate.dem}
              </div>
              <div className="text-xs text-surface-500">Dem</div>
            </div>
            <div className="w-px h-8 bg-surface-200 dark:bg-surface-600" />
            <div className="text-center">
              <div className={cn('text-lg sm:text-2xl font-bold', colorblind ? 'text-[#CC79A7]' : 'text-battleground')}>
                {summary.senate.battleground}
              </div>
              <div className="text-xs text-surface-500">Toss-up</div>
            </div>
            <div className="w-px h-8 bg-surface-200 dark:bg-surface-600" />
            <div className="text-center">
              <div className={cn('text-lg sm:text-2xl font-bold', colorblind ? 'text-[#D55E00]' : 'text-rep-likely')}>
                {summary.senate.rep}
              </div>
              <div className="text-xs text-surface-500">Rep</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full overflow-hidden bg-surface-200 dark:bg-surface-700 flex">
            <div
              className={cn('transition-all duration-300', demColor)}
              style={{
                width: `${(summary.senate.dem / 100) * 100}%`,
              }}
            />
            <div
              className={cn('transition-all duration-300', bgColor)}
              style={{
                width: `${(summary.senate.battleground / 100) * 100}%`,
              }}
            />
            <div
              className={cn('transition-all duration-300', repColor)}
              style={{
                width: `${(summary.senate.rep / 100) * 100}%`,
              }}
            />
          </div>
          <div className="text-xs text-surface-400 mt-1">51 for majority</div>
        </div>

        {/* House */}
        <div className="text-center">
          <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-2">
            House
          </h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-center">
              <div className={cn('text-lg sm:text-2xl font-bold', colorblind ? 'text-[#0072B2]' : 'text-dem-likely')}>
                {summary.house.dem}
              </div>
              <div className="text-xs text-surface-500">Dem</div>
            </div>
            <div className="w-px h-8 bg-surface-200 dark:bg-surface-600" />
            <div className="text-center">
              <div className={cn('text-lg sm:text-2xl font-bold', colorblind ? 'text-[#CC79A7]' : 'text-battleground')}>
                {summary.house.battleground}
              </div>
              <div className="text-xs text-surface-500">Toss-up</div>
            </div>
            <div className="w-px h-8 bg-surface-200 dark:bg-surface-600" />
            <div className="text-center">
              <div className={cn('text-lg sm:text-2xl font-bold', colorblind ? 'text-[#D55E00]' : 'text-rep-likely')}>
                {summary.house.rep}
              </div>
              <div className="text-xs text-surface-500">Rep</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full overflow-hidden bg-surface-200 dark:bg-surface-700 flex">
            <div
              className={cn('transition-all duration-300', demColor)}
              style={{
                width: `${(summary.house.dem / 435) * 100}%`,
              }}
            />
            <div
              className={cn('transition-all duration-300', bgColor)}
              style={{
                width: `${(summary.house.battleground / 435) * 100}%`,
              }}
            />
            <div
              className={cn('transition-all duration-300', repColor)}
              style={{
                width: `${(summary.house.rep / 435) * 100}%`,
              }}
            />
          </div>
          <div className="text-xs text-surface-400 mt-1">218 for majority</div>
        </div>
      </div>
    </div>
  );
}
