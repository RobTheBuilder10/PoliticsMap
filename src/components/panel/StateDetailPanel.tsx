'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import {
  getRatingColor,
  getRatingLabel,
  formatDate,
  generateShareableUrl,
  cn,
} from '@/lib/utils';
import { RatingSelector } from './RatingSelector';
import { RegistrationChart } from './RegistrationChart';
import { TurnoutChart } from './TurnoutChart';
import { ResultsHistory } from './ResultsHistory';
import { TrendInsights } from './TrendInsights';
import { Collapsible } from '@/components/ui/Collapsible';
import { useToast } from '@/components/ui/Toast';
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

  const { addToast } = useToast();
  const [notes, setNotes] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  if (!selectedState) {
    return (
      <div className={cn('p-6 flex flex-col items-center justify-center text-center h-full', className)}>
        <div className="text-surface-300 dark:text-surface-600 mb-4">
          <svg className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-surface-800 dark:text-surface-200 mb-2">
          Select a State
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-[260px] leading-relaxed">
          Click any state on the map to view details, set ratings, and explore registration trends.
        </p>
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-surface-400 dark:text-surface-500">
            <kbd className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-700 rounded border border-surface-200 dark:border-surface-600 font-mono text-[10px]">Click</kbd>
            <span>Select a state</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-surface-400 dark:text-surface-500">
            <kbd className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-700 rounded border border-surface-200 dark:border-surface-600 font-mono text-[10px]">Arrow</kbd>
            <span>Navigate between states</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-surface-400 dark:text-surface-500">
            <kbd className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-700 rounded border border-surface-200 dark:border-surface-600 font-mono text-[10px]">1-4</kbd>
            <span>Set rating strength</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-surface-400 dark:text-surface-500">
            <kbd className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-700 rounded border border-surface-200 dark:border-surface-600 font-mono text-[10px]">D / R</kbd>
            <span>Set party</span>
          </div>
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
    addToast(`${state.name} rated ${getRatingLabel(party, strength)}`, 'success');
  };

  const handleClearRating = () => {
    clearRating(selectedState, changeReason || undefined);
    setChangeReason('');
    setShowReasonInput(false);
    addToast(`${state.name} rating cleared`, 'info');
  };

  const handleShare = async () => {
    if (!currentScenario) return;

    const url = generateShareableUrl(currentScenario, layer, selectedState);

    try {
      await navigator.clipboard.writeText(url);
      addToast('Share link copied to clipboard', 'success');
    } catch {
      prompt('Copy this URL:', url);
    }
  };

  return (
    <div className={cn('flex flex-col h-full overflow-hidden animate-fade-in', className)}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white truncate">
                {state.name}
              </h2>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold flex-shrink-0"
                style={{
                  backgroundColor: ratingColor.fill,
                  color: ratingColor.text,
                }}
              >
                {rating ? getRatingLabel(rating.party, rating.strength) : 'Unrated'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-700/50 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {state.electoralVotes} EV
              </span>
              <span className="inline-flex items-center text-xs text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-700/50 px-2 py-0.5 rounded-full capitalize">
                {state.region}
              </span>
              {layer === 'house' && (
                <span className="inline-flex items-center text-xs text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-700/50 px-2 py-0.5 rounded-full">
                  {state.houseDistricts} Districts
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => selectState(null)}
            className="p-1.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors ml-2"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Rating Selector - Always visible */}
        <div className="p-4 border-b border-surface-200 dark:border-surface-700">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
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
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {showReasonInput ? '- Hide reason' : '+ Add reason for change'}
            </button>
            {showReasonInput && (
              <input
                type="text"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="e.g., New polling data shows shift..."
                className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-blue-500 animate-fade-in"
              />
            )}
          </div>
        </div>

        {/* Collapsible Data Sections */}
        <Collapsible
          title="Registration Trends"
          defaultOpen={false}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        >
          <TrendInsights stateId={selectedState} />
        </Collapsible>

        <Collapsible
          title="Voter Registration"
          defaultOpen={false}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          badge={
            state.hasPartisanRegistration ? (
              <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium">
                Partisan
              </span>
            ) : undefined
          }
        >
          <RegistrationChart
            stateId={selectedState}
            hasPartisanData={state.hasPartisanRegistration}
          />
        </Collapsible>

        <Collapsible
          title="Voter Turnout"
          defaultOpen={false}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        >
          <TurnoutChart stateId={selectedState} />
        </Collapsible>

        <Collapsible
          title="Results History"
          defaultOpen={false}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        >
          <ResultsHistory stateId={selectedState} electionType={layer === 'house' ? 'house' : layer} />
        </Collapsible>

        {/* Notes Section */}
        <Collapsible
          title="Notes"
          defaultOpen={false}
          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          badge={rating?.notes ? (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          ) : undefined}
        >
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your analysis notes..."
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {rating?.notes && (
            <div className="mt-2 text-xs text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-800/50 p-2 rounded-lg">
              <span className="font-medium">Saved:</span> {rating.notes}
            </div>
          )}
        </Collapsible>

        {/* Change Log Preview */}
        {changeLog.length > 0 && (
          <Collapsible
            title="Recent Changes"
            defaultOpen={false}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
            badge={
              <span className="text-[10px] bg-surface-200 dark:bg-surface-600 text-surface-600 dark:text-surface-300 px-1.5 py-0.5 rounded-full font-medium">
                {changeLog.length}
              </span>
            }
          >
            <div className="space-y-2">
              {changeLog.slice(-5).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="text-xs p-2 bg-surface-50 dark:bg-surface-800/50 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600 dark:text-surface-300 font-medium">
                      {entry.previousRating
                        ? getRatingLabel(entry.previousRating.party, entry.previousRating.strength)
                        : 'Unrated'}
                      <span className="mx-1.5 text-surface-400">→</span>
                      {getRatingLabel(entry.newRating.party, entry.newRating.strength)}
                    </span>
                    <span className="text-surface-400">{formatDate(entry.timestamp)}</span>
                  </div>
                  {entry.reason && (
                    <div className="mt-1 text-surface-500 dark:text-surface-400 italic">
                      {entry.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Collapsible>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 border-t border-surface-200 dark:border-surface-700 p-3 bg-white dark:bg-surface-800">
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <button
            onClick={() => selectState(null)}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
