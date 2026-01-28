'use client';

import React, { useState, useMemo } from 'react';
import { cn, formatDate } from '@/lib/utils';
import calendarData from '@/data/calendar.json';
import statesData from '@/data/states.json';

type DateType = 'all' | 'registration_deadline' | 'early_voting_start' | 'primary' | 'general';

export default function CalendarPage() {
  const [filter, setFilter] = useState<DateType>('all');
  const [selectedState, setSelectedState] = useState<string>('');

  const states = Object.values(statesData.states) as Array<{ id: string; name: string }>;

  const allDates = useMemo(() => {
    const dates: Array<{
      date: string;
      type: string;
      description: string;
      stateId?: string;
      stateName?: string;
      isReliable: boolean;
      source?: string;
      sourceUrl?: string;
    }> = [];

    // Add national dates
    calendarData.nationalDates.forEach((d) => {
      dates.push({
        ...d,
        stateName: 'National',
      });
    });

    // Add state-specific dates
    Object.entries(calendarData.stateCalendars).forEach(([stateId, calendar]) => {
      const state = states.find((s) => s.id === stateId);
      (calendar as { dates: Array<any> }).dates.forEach((d) => {
        dates.push({
          ...d,
          stateId,
          stateName: state?.name || stateId,
        });
      });
    });

    // Sort by date
    return dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [states]);

  const filteredDates = useMemo(() => {
    return allDates.filter((d) => {
      if (filter !== 'all' && d.type !== filter) return false;
      if (selectedState && d.stateId !== selectedState) return false;
      return true;
    });
  }, [allDates, filter, selectedState]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, typeof filteredDates> = {};

    filteredDates.forEach((d) => {
      const monthKey = new Date(d.date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(d);
    });

    return groups;
  }, [filteredDates]);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      registration_deadline: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      early_voting_start: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      early_voting_end: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      general: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      runoff: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };

    return colors[type] || 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      registration_deadline: 'Reg. Deadline',
      early_voting_start: 'Early Voting Start',
      early_voting_end: 'Early Voting End',
      primary: 'Primary',
      general: 'General',
      runoff: 'Runoff',
    };

    return labels[type] || type;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
          Election Calendar
        </h1>
        <p className="text-surface-600 dark:text-surface-400">
          Key dates and deadlines for voter registration, early voting, primaries, and general elections.
          Always verify dates with your state election office.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Important:</strong> Dates shown here are for informational purposes only.
            Election laws and deadlines can change. Always verify with your state or local election office.
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            State
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
          >
            <option value="">All States</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Event Type
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as DateType)}
            className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="registration_deadline">Registration Deadlines</option>
            <option value="early_voting_start">Early Voting</option>
            <option value="primary">Primaries</option>
            <option value="general">General Elections</option>
          </select>
        </div>
      </div>

      {/* Calendar View */}
      <div className="space-y-8">
        {Object.entries(groupedByMonth).map(([month, dates]) => (
          <div key={month}>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 sticky top-14 bg-surface-50 dark:bg-surface-900 py-2 -mx-4 px-4">
              {month}
            </h2>

            <div className="space-y-3">
              {dates.map((d, idx) => (
                <div
                  key={`${d.date}-${d.stateId || 'national'}-${idx}`}
                  className={cn(
                    'card p-4',
                    !d.isReliable && 'border-amber-300 dark:border-amber-700'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded',
                            getTypeColor(d.type)
                          )}
                        >
                          {getTypeLabel(d.type)}
                        </span>
                        {!d.isReliable && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            Verify
                          </span>
                        )}
                      </div>

                      <h3 className="font-medium text-surface-900 dark:text-white">
                        {d.description}
                      </h3>

                      <div className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                        {d.stateName}
                        {d.source && (
                          <>
                            {' '}&middot;{' '}
                            {d.sourceUrl ? (
                              <a
                                href={d.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {d.source}
                              </a>
                            ) : (
                              d.source
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-surface-900 dark:text-white">
                        {new Date(d.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-surface-500">
                        {new Date(d.date).getFullYear()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredDates.length === 0 && (
          <div className="text-center py-12 text-surface-500 dark:text-surface-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-surface-300 dark:text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-medium">No dates found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Export hint */}
      <div className="mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
        <p>Need to export these dates? Visit the <a href="/coverage" className="text-blue-600 dark:text-blue-400 hover:underline">Data Coverage</a> page for source links.</p>
      </div>
    </div>
  );
}
