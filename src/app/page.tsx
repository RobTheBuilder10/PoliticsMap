'use client';

import React, { useEffect, useCallback } from 'react';
import { useStore } from '@/store';
import { USMap, SummaryBar, MapControls } from '@/components/map';
import { StateDetailPanel } from '@/components/panel';
import { getKeyboardAction, getNextState, getPrevState, cn } from '@/lib/utils';

export default function HomePage() {
  const {
    selectedState,
    selectState,
    layer,
    settings,
    setRating,
    clearRating,
    undoLastChange,
    getCurrentRating,
    sidebarOpen,
    toggleSidebar,
  } = useStore();

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!settings.keyboardShortcuts) return;

      // Ignore if typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const action = getKeyboardAction(event);
      if (!action) return;

      const currentRating = selectedState ? getCurrentRating(selectedState) : undefined;

      switch (action.action) {
        case 'setTilt':
          if (selectedState && currentRating) {
            setRating(selectedState, currentRating.party, 'tilt');
          }
          break;
        case 'setLean':
          if (selectedState && currentRating) {
            setRating(selectedState, currentRating.party, 'lean');
          }
          break;
        case 'setLikely':
          if (selectedState && currentRating) {
            setRating(selectedState, currentRating.party, 'likely');
          }
          break;
        case 'setSafe':
          if (selectedState && currentRating) {
            setRating(selectedState, currentRating.party, 'safe');
          }
          break;
        case 'setBattleground':
          if (selectedState) {
            setRating(selectedState, 'purple', 'battleground');
          }
          break;
        case 'setUnrated':
          if (selectedState) {
            clearRating(selectedState);
          }
          break;
        case 'setDem':
          if (selectedState) {
            const strength = currentRating && currentRating.strength !== 'battleground' && currentRating.strength !== 'unrated'
              ? currentRating.strength
              : 'lean';
            setRating(selectedState, 'dem', strength);
          }
          break;
        case 'setRep':
          if (selectedState) {
            const strength = currentRating && currentRating.strength !== 'battleground' && currentRating.strength !== 'unrated'
              ? currentRating.strength
              : 'lean';
            setRating(selectedState, 'rep', strength);
          }
          break;
        case 'deselect':
          selectState(null);
          break;
        case 'nextState':
          event.preventDefault();
          selectState(getNextState(selectedState));
          break;
        case 'prevState':
          event.preventDefault();
          selectState(getPrevState(selectedState));
          break;
        case 'undo':
          event.preventDefault();
          undoLastChange();
          break;
        case 'save':
          event.preventDefault();
          // Auto-save is enabled by default, so just show a notification
          break;
      }
    },
    [
      selectedState,
      settings.keyboardShortcuts,
      getCurrentRating,
      setRating,
      clearRating,
      selectState,
      undoLastChange,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Controls Bar */}
        <div className="flex-shrink-0 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-4 py-3">
          <MapControls />
        </div>

        {/* Map Container */}
        <div className="flex-1 overflow-auto p-4 bg-surface-100 dark:bg-surface-900">
          <div className="max-w-6xl mx-auto">
            <USMap />
          </div>
        </div>

        {/* Summary Bar */}
        <div className="flex-shrink-0 border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-4">
          <div className="max-w-4xl mx-auto">
            <SummaryBar />
          </div>
        </div>
      </div>

      {/* Sidebar Toggle (mobile) */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'lg:hidden fixed bottom-20 right-4 z-30 p-3 rounded-full shadow-lg transition-all',
          sidebarOpen
            ? 'bg-surface-800 text-white'
            : 'bg-blue-600 text-white'
        )}
        aria-label={sidebarOpen ? 'Close panel' : 'Open panel'}
      >
        {sidebarOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* State Detail Sidebar */}
      <aside
        className={cn(
          'lg:w-96 lg:flex-shrink-0 lg:border-l border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800',
          'fixed lg:relative inset-y-0 right-0 z-20 w-full sm:w-96 transform transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
        style={{ top: '3.5rem' }}
      >
        <StateDetailPanel className="h-full" />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-10"
          onClick={toggleSidebar}
          style={{ top: '3.5rem' }}
        />
      )}
    </div>
  );
}
