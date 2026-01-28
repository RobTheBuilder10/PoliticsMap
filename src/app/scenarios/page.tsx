'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { ScenarioManager, ScenarioCompare } from '@/components/scenarios';
import { ChangeLog } from '@/components/changelog';
import { cn } from '@/lib/utils';

type Tab = 'manage' | 'compare' | 'changelog';

export default function ScenariosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('manage');
  const { scenarios, currentScenarioId, layer } = useStore();

  const [compareScenario1, setCompareScenario1] = useState<string>(currentScenarioId);
  const [compareScenario2, setCompareScenario2] = useState<string>('');

  const scenarioList = Object.values(scenarios);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
          Scenarios
        </h1>
        <p className="text-surface-600 dark:text-surface-400">
          Create, manage, and compare different election scenarios. Export your analysis or share with others.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-surface-200 dark:border-surface-700">
        {[
          { id: 'manage' as Tab, label: 'Manage Scenarios' },
          { id: 'compare' as Tab, label: 'Compare' },
          { id: 'changelog' as Tab, label: 'Change Log' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'manage' && (
          <ScenarioManager />
        )}

        {activeTab === 'compare' && (
          <div className="space-y-6">
            {/* Scenario Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Scenario 1
                </label>
                <select
                  value={compareScenario1}
                  onChange={(e) => setCompareScenario1(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                >
                  {scenarioList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Scenario 2
                </label>
                <select
                  value={compareScenario2}
                  onChange={(e) => setCompareScenario2(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                >
                  <option value="">Select a scenario...</option>
                  {scenarioList
                    .filter((s) => s.id !== compareScenario1)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Comparison View */}
            {compareScenario1 && compareScenario2 ? (
              <ScenarioCompare
                scenario1Id={compareScenario1}
                scenario2Id={compareScenario2}
                layer={layer}
              />
            ) : (
              <div className="text-center py-12 text-surface-500 dark:text-surface-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-surface-300 dark:text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-medium">Select two scenarios to compare</p>
                <p className="text-sm mt-1">See differences in ratings and electoral outcomes</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'changelog' && (
          <div className="card p-6">
            <ChangeLog showReplay />
          </div>
        )}
      </div>
    </div>
  );
}
