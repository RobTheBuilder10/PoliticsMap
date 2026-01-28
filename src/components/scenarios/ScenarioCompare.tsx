'use client';

import React, { useMemo } from 'react';
import { useStore } from '@/store';
import { getRatingColor, getRatingLabel, cn } from '@/lib/utils';
import statesData from '@/data/states.json';
import type { Scenario, ScenarioDiff, MapLayer } from '@/types';

interface ScenarioCompareProps {
  scenario1Id: string;
  scenario2Id: string;
  layer: MapLayer;
  className?: string;
}

export function ScenarioCompare({
  scenario1Id,
  scenario2Id,
  layer,
  className,
}: ScenarioCompareProps) {
  const { scenarios, settings, getScenarioSummary } = useStore();

  const scenario1 = scenarios[scenario1Id];
  const scenario2 = scenarios[scenario2Id];

  const summary1 = getScenarioSummary(scenario1Id);
  const summary2 = getScenarioSummary(scenario2Id);

  const diffs = useMemo(() => {
    if (!scenario1 || !scenario2) return [];

    const differences: ScenarioDiff[] = [];
    const layerKey = layer as 'presidential' | 'senate' | 'governor';
    const states = Object.keys(statesData.states);

    states.forEach((stateId) => {
      const rating1 = scenario1.ratings[layerKey]?.[stateId];
      const rating2 = scenario2.ratings[layerKey]?.[stateId];

      // Check if ratings are different
      const isDifferent =
        rating1?.party !== rating2?.party || rating1?.strength !== rating2?.strength;

      if (isDifferent) {
        differences.push({
          stateId,
          electionType: layer as any,
          scenario1Rating: rating1 || null,
          scenario2Rating: rating2 || null,
        });
      }
    });

    return differences;
  }, [scenario1, scenario2, layer]);

  if (!scenario1 || !scenario2) {
    return (
      <div className={cn('p-6 text-center text-surface-500', className)}>
        Select two scenarios to compare
      </div>
    );
  }

  const colorblind = settings.colorblindMode;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
          <h3 className="font-semibold text-surface-900 dark:text-white">
            {scenario1.name}
          </h3>
          <p className="text-sm text-surface-500 mt-1">
            {scenario1.description || 'No description'}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
          <h3 className="font-semibold text-surface-900 dark:text-white">
            {scenario2.name}
          </h3>
          <p className="text-sm text-surface-500 mt-1">
            {scenario2.description || 'No description'}
          </p>
        </div>
      </div>

      {/* Summary Comparison */}
      <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-4">
        <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
          Electoral College Comparison
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Scenario 1 Summary */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-surface-500">Dem</span>
              <span className="font-semibold text-dem-likely">{summary1.electoralCollege.dem}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-surface-500">Battleground</span>
              <span className="font-semibold text-battleground">{summary1.electoralCollege.battleground}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-surface-500">Rep</span>
              <span className="font-semibold text-rep-likely">{summary1.electoralCollege.rep}</span>
            </div>
          </div>

          {/* Scenario 2 Summary */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-surface-500">Dem</span>
              <span className="font-semibold text-dem-likely">{summary2.electoralCollege.dem}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-surface-500">Battleground</span>
              <span className="font-semibold text-battleground">{summary2.electoralCollege.battleground}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-surface-500">Rep</span>
              <span className="font-semibold text-rep-likely">{summary2.electoralCollege.rep}</span>
            </div>
          </div>
        </div>

        {/* Delta Display */}
        <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
          <div className="text-xs text-surface-500 mb-2">Difference (Scenario 2 - Scenario 1)</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={cn(
              'p-2 rounded',
              summary2.electoralCollege.dem - summary1.electoralCollege.dem > 0
                ? 'bg-dem-tilt/30'
                : summary2.electoralCollege.dem - summary1.electoralCollege.dem < 0
                ? 'bg-rep-tilt/30'
                : 'bg-surface-100 dark:bg-surface-700'
            )}>
              <div className="text-xs text-surface-500">Dem</div>
              <div className="font-semibold">
                {summary2.electoralCollege.dem - summary1.electoralCollege.dem > 0 ? '+' : ''}
                {summary2.electoralCollege.dem - summary1.electoralCollege.dem}
              </div>
            </div>
            <div className="p-2 rounded bg-surface-100 dark:bg-surface-700">
              <div className="text-xs text-surface-500">BG</div>
              <div className="font-semibold">
                {summary2.electoralCollege.battleground - summary1.electoralCollege.battleground > 0 ? '+' : ''}
                {summary2.electoralCollege.battleground - summary1.electoralCollege.battleground}
              </div>
            </div>
            <div className={cn(
              'p-2 rounded',
              summary2.electoralCollege.rep - summary1.electoralCollege.rep > 0
                ? 'bg-rep-tilt/30'
                : summary2.electoralCollege.rep - summary1.electoralCollege.rep < 0
                ? 'bg-dem-tilt/30'
                : 'bg-surface-100 dark:bg-surface-700'
            )}>
              <div className="text-xs text-surface-500">Rep</div>
              <div className="font-semibold">
                {summary2.electoralCollege.rep - summary1.electoralCollege.rep > 0 ? '+' : ''}
                {summary2.electoralCollege.rep - summary1.electoralCollege.rep}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Differences */}
      <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-4">
        <h4 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4">
          States with Different Ratings ({diffs.length})
        </h4>

        {diffs.length === 0 ? (
          <div className="text-sm text-surface-500 text-center py-4">
            No differences found between scenarios
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {diffs.map((diff) => {
              const stateName = (statesData.states as Record<string, { name: string }>)[diff.stateId]?.name;
              const ev = (statesData.states as Record<string, { electoralVotes: number }>)[diff.stateId]?.electoralVotes;

              const color1 = getRatingColor(diff.scenario1Rating || undefined, colorblind);
              const color2 = getRatingColor(diff.scenario2Rating || undefined, colorblind);

              return (
                <div
                  key={diff.stateId}
                  className="flex items-center justify-between p-2 bg-surface-50 dark:bg-surface-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-surface-900 dark:text-white">
                      {stateName}
                    </span>
                    <span className="text-xs text-surface-400">({ev} EV)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 text-xs font-medium rounded"
                      style={{
                        backgroundColor: color1.fill,
                        color: color1.text,
                      }}
                    >
                      {diff.scenario1Rating
                        ? getRatingLabel(diff.scenario1Rating.party, diff.scenario1Rating.strength)
                        : 'Unrated'}
                    </span>
                    <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span
                      className="px-2 py-0.5 text-xs font-medium rounded"
                      style={{
                        backgroundColor: color2.fill,
                        color: color2.text,
                      }}
                    >
                      {diff.scenario2Rating
                        ? getRatingLabel(diff.scenario2Rating.party, diff.scenario2Rating.strength)
                        : 'Unrated'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
