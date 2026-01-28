'use client';

import React, { useState, useRef } from 'react';
import { useStore, selectAllScenarios } from '@/store';
import { formatTimestamp, cn } from '@/lib/utils';
import type { Scenario } from '@/types';

interface ScenarioManagerProps {
  className?: string;
}

export function ScenarioManager({ className }: ScenarioManagerProps) {
  const {
    currentScenarioId,
    scenarios,
    createScenario,
    loadScenario,
    deleteScenario,
    duplicateScenario,
    renameScenario,
    exportScenario,
    importScenario,
  } = useStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDesc, setNewScenarioDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allScenarios = Object.values(scenarios).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleCreate = () => {
    if (newScenarioName.trim()) {
      createScenario(newScenarioName.trim(), newScenarioDesc.trim() || undefined);
      setNewScenarioName('');
      setNewScenarioDesc('');
      setShowCreateModal(false);
    }
  };

  const handleDuplicate = (id: string) => {
    const scenario = scenarios[id];
    if (scenario) {
      duplicateScenario(id, `${scenario.name} (Copy)`);
    }
  };

  const handleExport = (id: string) => {
    const scenario = exportScenario(id);
    const blob = new Blob([JSON.stringify(scenario, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-${scenario.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const scenario = JSON.parse(e.target?.result as string) as Scenario;
        importScenario(scenario);
      } catch (error) {
        alert('Invalid scenario file');
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim() && editName !== scenarios[id]?.name) {
      renameScenario(id, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const startEditing = (scenario: Scenario) => {
    setEditingId(scenario.id);
    setEditName(scenario.name);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
          Scenarios
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
          >
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            New Scenario
          </button>
        </div>
      </div>

      {/* Scenario List */}
      <div className="space-y-2">
        {allScenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={cn(
              'p-4 rounded-lg border transition-all',
              scenario.id === currentScenarioId
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-surface-300 dark:hover:border-surface-600'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {editingId === scenario.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(scenario.id);
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditName('');
                        }
                      }}
                      className="flex-1 px-2 py-1 text-sm rounded border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRename(scenario.id)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditName('');
                      }}
                      className="px-2 py-1 text-xs border border-surface-300 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                      {scenario.name}
                    </h3>
                    {scenario.description && (
                      <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5 truncate">
                        {scenario.description}
                      </p>
                    )}
                  </>
                )}
                <div className="text-xs text-surface-400 mt-1">
                  Updated: {formatTimestamp(scenario.updatedAt)}
                </div>
              </div>

              {scenario.id === currentScenarioId && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                  Active
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              {scenario.id !== currentScenarioId && (
                <button
                  onClick={() => loadScenario(scenario.id)}
                  className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Load
                </button>
              )}
              <button
                onClick={() => startEditing(scenario)}
                className="px-3 py-1 text-xs font-medium rounded border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
              >
                Rename
              </button>
              <button
                onClick={() => handleDuplicate(scenario.id)}
                className="px-3 py-1 text-xs font-medium rounded border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
              >
                Duplicate
              </button>
              <button
                onClick={() => handleExport(scenario.id)}
                className="px-3 py-1 text-xs font-medium rounded border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
              >
                Export
              </button>
              {scenario.id !== 'default' && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this scenario?')) {
                      deleteScenario(scenario.id);
                    }
                  }}
                  className="px-3 py-1 text-xs font-medium rounded border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
              Create New Scenario
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="My Scenario"
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newScenarioDesc}
                  onChange={(e) => setNewScenarioDesc(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewScenarioName('');
                  setNewScenarioDesc('');
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newScenarioName.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
