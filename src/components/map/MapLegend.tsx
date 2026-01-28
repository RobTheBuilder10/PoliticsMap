'use client';

import React from 'react';
import { getRatingColor } from '@/lib/utils';
import type { Party, RatingStrength } from '@/types';

interface LegendItem {
  party: Party;
  strength: RatingStrength;
  label: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { party: 'dem', strength: 'safe', label: 'Safe D' },
  { party: 'dem', strength: 'likely', label: 'Likely D' },
  { party: 'dem', strength: 'lean', label: 'Lean D' },
  { party: 'dem', strength: 'tilt', label: 'Tilt D' },
  { party: 'purple', strength: 'battleground', label: 'Battleground' },
  { party: 'rep', strength: 'tilt', label: 'Tilt R' },
  { party: 'rep', strength: 'lean', label: 'Lean R' },
  { party: 'rep', strength: 'likely', label: 'Likely R' },
  { party: 'rep', strength: 'safe', label: 'Safe R' },
];

interface MapLegendProps {
  colorblindMode?: boolean;
  compact?: boolean;
}

export function MapLegend({ colorblindMode = false, compact = false }: MapLegendProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1 items-center justify-center">
        {LEGEND_ITEMS.map((item) => {
          const color = getRatingColor(
            { party: item.party, strength: item.strength, updatedAt: '' },
            colorblindMode
          );
          return (
            <div key={`${item.party}-${item.strength}`} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm border border-surface-300"
                style={{ backgroundColor: color.fill }}
              />
              <span className="text-xs text-surface-600 dark:text-surface-400">{item.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-surface-800/95 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 p-3">
      <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-2">
        Rating Scale
      </h4>

      <div className="flex flex-col gap-1">
        {/* Democrat side */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-surface-500 w-8">Dem</span>
          <div className="flex gap-0.5">
            {LEGEND_ITEMS.filter((i) => i.party === 'dem')
              .reverse()
              .map((item) => {
                const color = getRatingColor(
                  { party: item.party, strength: item.strength, updatedAt: '' },
                  colorblindMode
                );
                return (
                  <div
                    key={`${item.party}-${item.strength}`}
                    className="relative group"
                  >
                    <div
                      className="w-6 h-4 rounded-sm cursor-help"
                      style={{ backgroundColor: color.fill }}
                      title={item.label}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block">
                      <div className="bg-surface-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {item.label}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Battleground */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-surface-500 w-8"></span>
          <div className="flex gap-0.5 justify-center" style={{ width: '104px' }}>
            {LEGEND_ITEMS.filter((i) => i.party === 'purple').map((item) => {
              const color = getRatingColor(
                { party: item.party, strength: item.strength, updatedAt: '' },
                colorblindMode
              );
              return (
                <div
                  key={`${item.party}-${item.strength}`}
                  className="relative group"
                >
                  <div
                    className="w-8 h-4 rounded-sm cursor-help"
                    style={{ backgroundColor: color.fill }}
                    title={item.label}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block">
                    <div className="bg-surface-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Republican side */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-surface-500 w-8">Rep</span>
          <div className="flex gap-0.5">
            {LEGEND_ITEMS.filter((i) => i.party === 'rep').map((item) => {
              const color = getRatingColor(
                { party: item.party, strength: item.strength, updatedAt: '' },
                colorblindMode
              );
              return (
                <div
                  key={`${item.party}-${item.strength}`}
                  className="relative group"
                >
                  <div
                    className="w-6 h-4 rounded-sm cursor-help"
                    style={{ backgroundColor: color.fill }}
                    title={item.label}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block">
                    <div className="bg-surface-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-2 pt-2 border-t border-surface-200 dark:border-surface-700">
        <div className="text-xs text-surface-400 dark:text-surface-500">
          <span className="font-mono bg-surface-100 dark:bg-surface-700 px-1 rounded">1-4</span>
          {' '}Tilt→Safe{' '}
          <span className="font-mono bg-surface-100 dark:bg-surface-700 px-1 rounded">P</span>
          {' '}Battleground{' '}
          <span className="font-mono bg-surface-100 dark:bg-surface-700 px-1 rounded">U</span>
          {' '}Clear
        </div>
      </div>
    </div>
  );
}
