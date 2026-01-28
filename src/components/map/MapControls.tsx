'use client';

import React from 'react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import type { MapLayer } from '@/types';

interface MapControlsProps {
  className?: string;
}

const LAYERS: { id: MapLayer; label: string; description: string }[] = [
  { id: 'presidential', label: 'President', description: 'Presidential election ratings' },
  { id: 'senate', label: 'Senate', description: 'Senate race ratings' },
  { id: 'governor', label: 'Governor', description: 'Gubernatorial race ratings' },
  { id: 'house', label: 'House', description: 'House district ratings' },
];

export function MapControls({ className }: MapControlsProps) {
  const {
    layer,
    setLayer,
    showHistoricalMargins,
    toggleHistoricalMargins,
    historicalYear,
    setHistoricalYear,
    settings,
    updateSettings,
  } = useStore();

  const handleLayerChange = (newLayer: MapLayer) => {
    setLayer(newLayer);
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {/* Layer Selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-surface-600 dark:text-surface-400">View:</span>
        <div className="flex rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
          {LAYERS.map((l) => (
            <button
              key={l.id}
              onClick={() => handleLayerChange(l.id)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
                layer === l.id
                  ? 'bg-surface-800 dark:bg-surface-200 text-white dark:text-surface-900'
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700'
              )}
              title={l.description}
              aria-pressed={layer === l.id}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Historical View Toggle */}
      <div className="flex items-center gap-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showHistoricalMargins}
            onChange={toggleHistoricalMargins}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-surface-200 dark:bg-surface-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          <span className="ml-2 text-sm font-medium text-surface-600 dark:text-surface-400">
            Historical
          </span>
        </label>

        {showHistoricalMargins && (
          <select
            value={historicalYear}
            onChange={(e) => setHistoricalYear(Number(e.target.value))}
            className="px-2 py-1 text-sm rounded border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2024}>2024</option>
            <option value={2022}>2022</option>
            <option value={2020}>2020</option>
            <option value={2018}>2018</option>
            <option value={2016}>2016</option>
          </select>
        )}
      </div>

      {/* Colorblind Mode Toggle */}
      <div className="flex items-center gap-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.colorblindMode}
            onChange={(e) => updateSettings({ colorblindMode: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-surface-200 dark:bg-surface-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          <span className="ml-2 text-sm font-medium text-surface-600 dark:text-surface-400">
            Colorblind Mode
          </span>
        </label>
      </div>

      {/* Keyboard shortcut indicator */}
      <div className="hidden lg:flex items-center gap-1 text-xs text-surface-400">
        <kbd className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-700 rounded border border-surface-200 dark:border-surface-600">
          ?
        </kbd>
        <span>Shortcuts</span>
      </div>
    </div>
  );
}
