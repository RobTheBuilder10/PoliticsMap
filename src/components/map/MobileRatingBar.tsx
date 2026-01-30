'use client';

import React from 'react';
import { getRatingColor, getRatingLabel, cn } from '@/lib/utils';
import type { Party, RatingStrength, Rating } from '@/types';
import statesData from '@/data/states.json';

interface RatingOption {
  party: Party;
  strength: RatingStrength;
  label: string;
  shortLabel: string;
}

const RATING_OPTIONS: RatingOption[] = [
  { party: 'dem', strength: 'safe', label: 'Safe D', shortLabel: 'Safe' },
  { party: 'dem', strength: 'likely', label: 'Likely D', shortLabel: 'Lkly' },
  { party: 'dem', strength: 'lean', label: 'Lean D', shortLabel: 'Lean' },
  { party: 'dem', strength: 'tilt', label: 'Tilt D', shortLabel: 'Tilt' },
  { party: 'purple', strength: 'battleground', label: 'Toss-up', shortLabel: 'Toss' },
  { party: 'rep', strength: 'tilt', label: 'Tilt R', shortLabel: 'Tilt' },
  { party: 'rep', strength: 'lean', label: 'Lean R', shortLabel: 'Lean' },
  { party: 'rep', strength: 'likely', label: 'Likely R', shortLabel: 'Lkly' },
  { party: 'rep', strength: 'safe', label: 'Safe R', shortLabel: 'Safe' },
];

interface MobileRatingBarProps {
  stateId: string;
  currentRating?: Rating;
  colorblindMode?: boolean;
  onRate: (party: Party, strength: RatingStrength) => void;
  onClear: () => void;
  onClose: () => void;
}

export function MobileRatingBar({
  stateId,
  currentRating,
  colorblindMode = false,
  onRate,
  onClear,
  onClose,
}: MobileRatingBarProps) {
  const state = (statesData.states as Record<string, { name: string; electoralVotes: number }>)[stateId];
  const stateName = state?.name || stateId;
  const ev = state?.electoralVotes || 0;

  const isSelected = (option: RatingOption) => {
    if (!currentRating) return false;
    return currentRating.party === option.party && currentRating.strength === option.strength;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 shadow-lg animate-slide-up safe-area-bottom">
      {/* State name header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-surface-900 dark:text-white truncate">
            {stateName}
          </span>
          <span className="text-xs text-surface-500 dark:text-surface-400 flex-shrink-0">
            {ev} EV
          </span>
          {currentRating && currentRating.party !== 'unrated' && (
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
              style={{
                backgroundColor: getRatingColor(currentRating, colorblindMode).fill,
                color: getRatingColor(currentRating, colorblindMode).text,
              }}
            >
              {getRatingLabel(currentRating.party, currentRating.strength)}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 flex-shrink-0"
          aria-label="Deselect state"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Rating color swatches */}
      <div className="px-3 pb-2">
        <div className="flex gap-1">
          {RATING_OPTIONS.map((option) => {
            const color = getRatingColor(
              { party: option.party, strength: option.strength, updatedAt: '' },
              colorblindMode
            );
            const selected = isSelected(option);

            return (
              <button
                key={`${option.party}-${option.strength}`}
                onClick={() => onRate(option.party, option.strength)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-all',
                  selected
                    ? 'ring-2 ring-surface-900 dark:ring-white ring-offset-1 scale-105'
                    : 'hover:scale-105 active:scale-95'
                )}
                aria-label={option.label}
                aria-pressed={selected}
              >
                <div
                  className="w-full h-6 rounded"
                  style={{ backgroundColor: color.fill }}
                />
                <span className="text-[9px] leading-none text-surface-500 dark:text-surface-400 font-medium">
                  {option.shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Party labels + Clear */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] font-semibold text-dem-likely uppercase tracking-wide">Dem</span>
          <button
            onClick={onClear}
            className="text-[10px] font-medium text-surface-500 dark:text-surface-400 hover:text-red-500 dark:hover:text-red-400 px-2 py-0.5 rounded transition-colors"
          >
            Clear
          </button>
          <span className="text-[10px] font-semibold text-rep-likely uppercase tracking-wide">Rep</span>
        </div>
      </div>
    </div>
  );
}
