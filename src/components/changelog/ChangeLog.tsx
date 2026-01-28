'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { getRatingColor, getRatingLabel, formatTimestamp, cn } from '@/lib/utils';
import statesData from '@/data/states.json';
import type { ChangeLogEntry } from '@/types';

interface ChangeLogProps {
  className?: string;
  maxEntries?: number;
  showReplay?: boolean;
}

export function ChangeLog({ className, maxEntries, showReplay = true }: ChangeLogProps) {
  const { changeLog, undoLastChange, scenarios, settings } = useStore();
  const [filter, setFilter] = useState<'all' | 'presidential' | 'senate' | 'governor' | 'house'>('all');
  const [replayIndex, setReplayIndex] = useState<number | null>(null);

  const colorblind = settings.colorblindMode;

  const filteredLog = useMemo(() => {
    let entries = [...changeLog].reverse();

    if (filter !== 'all') {
      entries = entries.filter((entry) => entry.electionType === filter);
    }

    if (maxEntries) {
      entries = entries.slice(0, maxEntries);
    }

    return entries;
  }, [changeLog, filter, maxEntries]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, ChangeLogEntry[]> = {};

    filteredLog.forEach((entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    return groups;
  }, [filteredLog]);

  const handleUndo = () => {
    if (changeLog.length > 0) {
      undoLastChange();
    }
  };

  if (changeLog.length === 0) {
    return (
      <div className={cn('text-center py-8 text-surface-500 dark:text-surface-400', className)}>
        <svg className="w-12 h-12 mx-auto mb-3 text-surface-300 dark:text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="font-medium">No changes yet</p>
        <p className="text-sm mt-1">Your rating changes will appear here</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
            Filter:
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-2 py-1 text-sm rounded border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="presidential">Presidential</option>
            <option value="senate">Senate</option>
            <option value="governor">Governor</option>
            <option value="house">House</option>
          </select>
        </div>

        <div className="flex gap-2">
          {showReplay && (
            <button
              onClick={() => setReplayIndex(replayIndex === null ? filteredLog.length - 1 : null)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                replayIndex !== null
                  ? 'bg-blue-600 text-white'
                  : 'border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700'
              )}
            >
              {replayIndex !== null ? 'Exit Replay' : 'Replay Mode'}
            </button>
          )}
          <button
            onClick={handleUndo}
            disabled={changeLog.length === 0}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Undo Last
          </button>
        </div>
      </div>

      {/* Replay Controls */}
      {replayIndex !== null && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Replay Mode - Step {filteredLog.length - replayIndex} of {filteredLog.length}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={filteredLog.length - 1}
            value={filteredLog.length - 1 - replayIndex}
            onChange={(e) => setReplayIndex(filteredLog.length - 1 - Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between mt-2">
            <button
              onClick={() => setReplayIndex(Math.min(filteredLog.length - 1, replayIndex + 1))}
              disabled={replayIndex >= filteredLog.length - 1}
              className="px-2 py-1 text-xs rounded bg-blue-600 text-white disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setReplayIndex(Math.max(0, replayIndex - 1))}
              disabled={replayIndex <= 0}
              className="px-2 py-1 text-xs rounded bg-blue-600 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Change Log Entries */}
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, entries]) => (
          <div key={date}>
            <div className="sticky top-0 bg-surface-50 dark:bg-surface-900 py-2 mb-2">
              <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide">
                {date}
              </h4>
            </div>

            <div className="space-y-2">
              {entries.map((entry, idx) => {
                const stateName = (statesData.states as Record<string, { name: string }>)[entry.stateId]?.name;
                const prevColor = getRatingColor(entry.previousRating || undefined, colorblind);
                const newColor = getRatingColor(entry.newRating, colorblind);
                const isHighlighted = replayIndex !== null && filteredLog[replayIndex]?.id === entry.id;

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      isHighlighted
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-surface-900 dark:text-white">
                            {stateName || entry.stateId}
                          </span>
                          {entry.district !== undefined && (
                            <span className="text-xs text-surface-500">
                              District {entry.district}
                            </span>
                          )}
                          <span className="text-xs px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-500">
                            {entry.electionType}
                          </span>
                        </div>

                        {/* Rating Change */}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="px-2 py-0.5 text-xs font-medium rounded"
                            style={{
                              backgroundColor: prevColor.fill,
                              color: prevColor.text,
                            }}
                          >
                            {entry.previousRating
                              ? getRatingLabel(entry.previousRating.party, entry.previousRating.strength)
                              : 'Unrated'}
                          </span>
                          <svg className="w-3 h-3 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span
                            className="px-2 py-0.5 text-xs font-medium rounded"
                            style={{
                              backgroundColor: newColor.fill,
                              color: newColor.text,
                            }}
                          >
                            {getRatingLabel(entry.newRating.party, entry.newRating.strength)}
                          </span>
                        </div>

                        {/* Reason */}
                        {entry.reason && (
                          <div className="mt-2 text-xs text-surface-500 dark:text-surface-400 italic">
                            "{entry.reason}"
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-surface-400">
                        {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="text-xs text-surface-400 text-center py-2 border-t border-surface-200 dark:border-surface-700">
        {changeLog.length} total change{changeLog.length !== 1 ? 's' : ''}
        {filter !== 'all' && ` (showing ${filteredLog.length} ${filter})`}
      </div>
    </div>
  );
}
