'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Map' },
  { href: '/scenarios', label: 'Scenarios' },
  { href: '/coverage', label: 'Data Coverage' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const pathname = usePathname();
  const { scenarios, currentScenarioId, settings, updateSettings } = useStore();
  const currentScenario = scenarios[currentScenarioId];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <span className="font-bold text-lg text-surface-900 dark:text-white hidden sm:inline">
                PoliticsMap
              </span>
            </Link>

            {/* Current Scenario Indicator */}
            {currentScenario && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-surface-100 dark:bg-surface-800 rounded-lg">
                <span className="text-xs text-surface-500">Scenario:</span>
                <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                  {currentScenario.name}
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-50 dark:hover:bg-surface-800'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Settings */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {settings.darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Help / Shortcuts */}
            <button
              className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              onClick={() => {
                // Could open a shortcuts modal
                alert('Keyboard Shortcuts:\n\n1-4: Set Tilt/Lean/Likely/Safe\nP: Battleground\nU: Clear\nD/R: Set Democrat/Republican\nArrow Keys: Navigate\nCtrl+Z: Undo');
              }}
            >
              <kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-surface-700 rounded text-[10px]">?</kbd>
              <span>Shortcuts</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
