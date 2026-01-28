'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import {
  getRatingColor,
  getRatingLabel,
  formatNumber,
  formatDate,
  formatMargin,
  generateShareableUrl,
  cn,
} from '@/lib/utils';
import { RatingSelector } from './RatingSelector';
import { RegistrationChart } from './RegistrationChart';
import { TurnoutChart } from './TurnoutChart';
import { ResultsHistory } from './ResultsHistory';
import { TrendInsights } from './TrendInsights';
import type { Party, RatingStrength } from '@/types';
import statesData from '@/data/states.json';

interface StateDetailPanelProps {
  className?: string;
}

export function StateDetailPanel({ className }: StateDetailPanelProps) {
  const {
    selectedState,
    layer,
    selectState,
    getCurrentRating,
    setRating,
    clearRating,
    scenarios,
    currentScenarioId,
    settings,
    getChangeLogForState,
  } = useStore();

  const [notes, setNotes] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  if (!selectedState) {
    return (
      <div className={cn('p-6 flex flex-col items-center justify-center text-center h-full', className)}>
        <div className="text-surface-400 dark:text-surface-500 mb-2">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">
          Select a State
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-xs">
          Click on any state on the map to view details, set ratings, and see registration trends.
        </p>
        <div className="mt-4 text-xs text-surface-400">
          <p>Keyboard: Arrow keys to navigate, 1-4 for ratings</p>
        </div>
      </div>
    );
  }

  const state = (statesData.states as Record<string, {
    name: string;
    electoralVotes: number;
    hasPartisanRegistration: boolean;
    houseDistricts: number;
    region: string;
  }>)[selectedState];

  if (!state) return null;

  const rating = getCurrentRating(selectedState);
  const currentScenario = scenarios[currentScenarioId];
  const changeLog = getChangeLogForState(selectedState);
  const ratingColor = getRatingColor(rating, settings.colorblindMode);

  const handleRatingChange = (party: Party, strength: RatingStrength) => {
    if (showReasonInput && changeReason) {
      setRating(selectedState, party, strength, notes || undefined, changeReason);
      setChangeReason('');
      setShowReasonInput(false);
    } else {
      setRating(selectedState, party, strength, notes || undefined);
    }
  };

  const handleClearRating = () => {
    clearRating(selectedState, changeReason || undefined);
    setChangeReason('');
    setShowReasonInput(false);
  };

  const handleShare = async () => {
    if (!currentScenario) return;

    const url = generateShareableUrl(currentScenario, layer, selectedState);

    try {
      await navigator.clipboard.writeText(url);
      setShowSharePopup(true);
      setTimeout(() => setShowSharePopup(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      prompt('Copy this URL:', url);
    }
  };

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-surface-200 dark:border-surface-700 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">
              {state.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-surface-500 dark:text-surface-400">
                {state.electoralVotes} Electoral Votes
              </span>
              <span className="text-surface-300 dark:text-surface-600">|</span>
              <span className="text-sm text-surface-500 dark:text-surface-400 capitalize">
                {state.region}
              </span>
              {layer === 'house' && (
                <>
                  <span className="text-surface-300 dark:text-surface-600">|</span>
                  <span className="text-sm text-surface-500 dark:text-surface-400">
                    {state.houseDistricts} Districts
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => selectState(null)}
            className="p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current Rating Badge */}
        <div className="mt-3">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: ratingColor.fill,
              color: ratingColor.text,
            }}
          >
            {rating ? getRatingLabel(rating.party, rating.strength) : 'Unrated'}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Rating Selector */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
            Set Rating
          </h3>
          <RatingSelector
            currentRating={rating}
            onRatingChange={handleRatingChange}
            onClear={handleClearRating}
            colorblindMode={settings.colorblindMode}
          />

          {/* Reason Input Toggle */}
          <div className="mt-3">
            <button
              onClick={() => setShowReasonInput(!showReasonInput)}
              className="text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
            >
              {showReasonInput ? '- Hide reason' : '+ Add reason for change'}
            </button>
            {showReasonInput && (
              <input
                type="text"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Reason for rating change..."
                className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        {/* Trend Insights */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <TrendInsights stateId={selectedState} />
        </div>

        {/* Registration Chart */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <RegistrationChart
            stateId={selectedState}
            hasPartisanData={state.hasPartisanRegistration}
          />
        </div>

        {/* Turnout Chart */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <TurnoutChart stateId={selectedState} />
        </div>

        {/* Results History */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <ResultsHistory stateId={selectedState} electionType={layer === 'house' ? 'house' : layer} />
        </div>

        {/* Notes Section */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
            Notes
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your analysis notes..."
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {rating?.notes && (
            <div className="mt-2 text-xs text-surface-500 dark:text-surface-400">
              <span className="font-medium">Saved note:</span> {rating.notes}
            </div>
          )}
        </div>

        {/* Change Log Preview */}
        {changeLog.length > 0 && (
          <div className="p-4 border-b border-surface-200 dark:border-surface-700">
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
              Recent Changes
            </h3>
            <div className="space-y-2">
              {changeLog.slice(-3).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="text-xs text-surface-500 dark:text-surface-400 flex justify-between"
                >
                  <span>
                    {entry.previousRating
                      ? getRatingLabel(entry.previousRating.party, entry.previousRating.strength)
                      : 'Unrated'}
                    {' → '}
                    {getRatingLabel(entry.newRating.party, entry.newRating.strength)}
                  </span>
                  <span>{formatDate(entry.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 border-t border-surface-200 dark:border-surface-700 p-4">
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors relative"
          >
            Share Link
            {showSharePopup && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-green-500 text-white rounded">
                Copied!
              </span>
            )}
          </button>
          <button
            onClick={() => selectState(null)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
