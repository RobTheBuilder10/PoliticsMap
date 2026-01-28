'use client';

import React, { useState } from 'react';
import { getRatingColor, cn } from '@/lib/utils';
import type { Rating, Party, RatingStrength } from '@/types';

interface RatingSelectorProps {
  currentRating?: Rating;
  onRatingChange: (party: Party, strength: RatingStrength) => void;
  onClear: () => void;
  colorblindMode?: boolean;
}

const STRENGTHS: { id: RatingStrength; label: string; shortcut: string }[] = [
  { id: 'safe', label: 'Safe', shortcut: '4' },
  { id: 'likely', label: 'Likely', shortcut: '3' },
  { id: 'lean', label: 'Lean', shortcut: '2' },
  { id: 'tilt', label: 'Tilt', shortcut: '1' },
];

export function RatingSelector({
  currentRating,
  onRatingChange,
  onClear,
  colorblindMode = false,
}: RatingSelectorProps) {
  const [selectedParty, setSelectedParty] = useState<Party>(
    currentRating?.party === 'purple' ? 'purple' : currentRating?.party || 'dem'
  );

  const handlePartyChange = (party: Party) => {
    setSelectedParty(party);
    if (party === 'purple') {
      onRatingChange('purple', 'battleground');
    } else if (currentRating?.strength && currentRating.strength !== 'battleground') {
      onRatingChange(party, currentRating.strength);
    }
  };

  const handleStrengthChange = (strength: RatingStrength) => {
    if (selectedParty !== 'purple') {
      onRatingChange(selectedParty, strength);
    }
  };

  const isSelected = (party: Party, strength?: RatingStrength) => {
    if (!currentRating) return false;
    if (party === 'purple') {
      return currentRating.party === 'purple' || currentRating.strength === 'battleground';
    }
    return currentRating.party === party && currentRating.strength === strength;
  };

  return (
    <div className="space-y-4">
      {/* Party Selection */}
      <div>
        <div className="text-xs text-surface-500 dark:text-surface-400 mb-2">Party</div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePartyChange('dem')}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all',
              'border-2',
              selectedParty === 'dem'
                ? colorblindMode
                  ? 'bg-[#0072B2] text-white border-[#005c8f]'
                  : 'bg-dem-likely text-white border-dem-safe'
                : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-600 hover:border-surface-300'
            )}
          >
            Democrat
            <span className="ml-1 text-xs opacity-60">(D)</span>
          </button>

          <button
            onClick={() => handlePartyChange('purple')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-all',
              'border-2',
              selectedParty === 'purple' || currentRating?.strength === 'battleground'
                ? colorblindMode
                  ? 'bg-[#CC79A7] text-white border-[#a35f87]'
                  : 'bg-battleground text-white border-[#5a1f6a]'
                : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-600 hover:border-surface-300'
            )}
          >
            Toss-up
            <span className="ml-1 text-xs opacity-60">(P)</span>
          </button>

          <button
            onClick={() => handlePartyChange('rep')}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all',
              'border-2',
              selectedParty === 'rep'
                ? colorblindMode
                  ? 'bg-[#D55E00] text-white border-[#a34800]'
                  : 'bg-rep-likely text-white border-rep-safe'
                : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-600 hover:border-surface-300'
            )}
          >
            Republican
            <span className="ml-1 text-xs opacity-60">(R)</span>
          </button>
        </div>
      </div>

      {/* Strength Selection - Only show if not battleground */}
      {selectedParty !== 'purple' && (
        <div>
          <div className="text-xs text-surface-500 dark:text-surface-400 mb-2">Strength</div>
          <div className="grid grid-cols-4 gap-2">
            {STRENGTHS.map((s) => {
              const rating: Rating = {
                party: selectedParty,
                strength: s.id,
                updatedAt: '',
              };
              const color = getRatingColor(rating, colorblindMode);
              const selected = isSelected(selectedParty, s.id);

              return (
                <button
                  key={s.id}
                  onClick={() => handleStrengthChange(s.id)}
                  className={cn(
                    'px-2 py-2 rounded-lg font-medium text-sm transition-all',
                    'border-2 relative',
                    selected
                      ? 'ring-2 ring-offset-2 ring-surface-900 dark:ring-white'
                      : ''
                  )}
                  style={{
                    backgroundColor: selected ? color.fill : 'transparent',
                    color: selected ? color.text : undefined,
                    borderColor: color.fill,
                  }}
                >
                  {s.label}
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-mono bg-surface-700 text-white rounded flex items-center justify-center">
                    {s.shortcut}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear Button */}
      <button
        onClick={onClear}
        className="w-full px-4 py-2 text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 border border-dashed border-surface-300 dark:border-surface-600 rounded-lg hover:border-surface-400 transition-colors"
      >
        Clear Rating
        <span className="ml-1 text-xs opacity-60">(U)</span>
      </button>
    </div>
  );
}
