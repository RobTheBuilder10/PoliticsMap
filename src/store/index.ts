import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  MapLayer,
  Rating,
  Scenario,
  ChangeLogEntry,
  AppSettings,
  Party,
  RatingStrength,
  DistrictRating,
  ScenarioSummary,
} from '@/types';
import statesData from '@/data/states.json';

// ============================================
// STORE TYPES
// ============================================

interface MapState {
  layer: MapLayer;
  selectedState: string | null;
  selectedDistrict: number | null;
  hoveredState: string | null;
  showHistoricalMargins: boolean;
  historicalYear: number;
  zoom: number;
  center: [number, number];
}

interface ScenarioState {
  currentScenarioId: string;
  scenarios: Record<string, Scenario>;
  changeLog: ChangeLogEntry[];
}

interface UIState {
  settings: AppSettings;
  sidebarOpen: boolean;
  compareMode: boolean;
  compareScenarioId: string | null;
  keyboardShortcutsEnabled: boolean;
}

interface AppState extends MapState, ScenarioState, UIState {
  // Map actions
  setLayer: (layer: MapLayer) => void;
  selectState: (stateId: string | null) => void;
  selectDistrict: (district: number | null) => void;
  setHoveredState: (stateId: string | null) => void;
  toggleHistoricalMargins: () => void;
  setHistoricalYear: (year: number) => void;
  setZoom: (zoom: number) => void;
  setCenter: (center: [number, number]) => void;

  // Rating actions
  setRating: (
    stateId: string,
    party: Party,
    strength: RatingStrength,
    notes?: string,
    reason?: string
  ) => void;
  setDistrictRating: (
    stateId: string,
    district: number,
    rating: Partial<DistrictRating>,
    reason?: string
  ) => void;
  clearRating: (stateId: string, reason?: string) => void;
  toggleParty: (stateId: string) => void;

  // Scenario actions
  createScenario: (name: string, description?: string) => string;
  loadScenario: (scenarioId: string) => void;
  deleteScenario: (scenarioId: string) => void;
  duplicateScenario: (scenarioId: string, newName: string) => string;
  renameScenario: (scenarioId: string, newName: string) => void;
  exportScenario: (scenarioId: string) => Scenario;
  importScenario: (scenario: Scenario) => void;
  getScenarioSummary: (scenarioId?: string) => ScenarioSummary;

  // Compare mode actions
  setCompareMode: (enabled: boolean) => void;
  setCompareScenario: (scenarioId: string | null) => void;

  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleSidebar: () => void;

  // Change log actions
  undoLastChange: () => void;
  getChangeLogForState: (stateId: string) => ChangeLogEntry[];

  // Utility
  getCurrentRating: (stateId: string) => Rating | undefined;
  getCurrentDistrictRating: (stateId: string, district: number) => DistrictRating | undefined;
}

// ============================================
// DEFAULT VALUES
// ============================================

const defaultScenario: Scenario = {
  id: 'default',
  name: 'My Scenario',
  description: 'Create your own election scenario',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ratings: {
    presidential: {},
    senate: {},
    governor: {},
    house: {},
  },
};

const defaultSettings: AppSettings = {
  colorblindMode: false,
  darkMode: false,
  autoSave: true,
  showTooltips: true,
  keyboardShortcuts: true,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial map state
      layer: 'presidential',
      selectedState: null,
      selectedDistrict: null,
      hoveredState: null,
      showHistoricalMargins: false,
      historicalYear: 2024,
      zoom: 1,
      center: [-98.5, 39.8],

      // Initial scenario state
      currentScenarioId: 'default',
      scenarios: { default: defaultScenario },
      changeLog: [],

      // Initial UI state
      settings: defaultSettings,
      sidebarOpen: true,
      compareMode: false,
      compareScenarioId: null,
      keyboardShortcutsEnabled: true,

      // Map actions
      setLayer: (layer) => set({ layer, selectedDistrict: null }),
      selectState: (stateId) => set({ selectedState: stateId, selectedDistrict: null }),
      selectDistrict: (district) => set({ selectedDistrict: district }),
      setHoveredState: (stateId) => set({ hoveredState: stateId }),
      toggleHistoricalMargins: () =>
        set((state) => ({ showHistoricalMargins: !state.showHistoricalMargins })),
      setHistoricalYear: (year) => set({ historicalYear: year }),
      setZoom: (zoom) => set({ zoom }),
      setCenter: (center) => set({ center }),

      // Rating actions
      setRating: (stateId, party, strength, notes, reason) => {
        const state = get();
        const scenario = state.scenarios[state.currentScenarioId];
        if (!scenario) return;

        const layerKey = state.layer as 'presidential' | 'senate' | 'governor';
        const previousRating = scenario.ratings[layerKey]?.[stateId] || null;

        const newRating: Rating = {
          party,
          strength,
          notes,
          updatedAt: new Date().toISOString(),
        };

        // Create change log entry
        const logEntry: ChangeLogEntry = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          stateId,
          electionType: state.layer as any,
          previousRating,
          newRating,
          reason,
          scenarioId: state.currentScenarioId,
        };

        set((state) => ({
          scenarios: {
            ...state.scenarios,
            [state.currentScenarioId]: {
              ...scenario,
              updatedAt: new Date().toISOString(),
              ratings: {
                ...scenario.ratings,
                [layerKey]: {
                  ...scenario.ratings[layerKey],
                  [stateId]: newRating,
                },
              },
            },
          },
          changeLog: [...state.changeLog, logEntry],
        }));
      },

      setDistrictRating: (stateId, district, rating, reason) => {
        const state = get();
        const scenario = state.scenarios[state.currentScenarioId];
        if (!scenario) return;

        const key = `${stateId}-${district}`;
        const previousRating = scenario.ratings.house?.[key] || null;

        const newRating: DistrictRating = {
          stateId,
          district,
          party: rating.party || 'unrated',
          strength: rating.strength || 'unrated',
          isOpenSeat: rating.isOpenSeat || false,
          updatedAt: new Date().toISOString(),
          ...rating,
        };

        const logEntry: ChangeLogEntry = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          stateId,
          district,
          electionType: 'house',
          previousRating,
          newRating,
          reason,
          scenarioId: state.currentScenarioId,
        };

        set((state) => ({
          scenarios: {
            ...state.scenarios,
            [state.currentScenarioId]: {
              ...scenario,
              updatedAt: new Date().toISOString(),
              ratings: {
                ...scenario.ratings,
                house: {
                  ...scenario.ratings.house,
                  [key]: newRating,
                },
              },
            },
          },
          changeLog: [...state.changeLog, logEntry],
        }));
      },

      clearRating: (stateId, reason) => {
        const state = get();
        const scenario = state.scenarios[state.currentScenarioId];
        if (!scenario) return;

        const layerKey = state.layer as 'presidential' | 'senate' | 'governor';
        const previousRating = scenario.ratings[layerKey]?.[stateId] || null;

        const logEntry: ChangeLogEntry = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          stateId,
          electionType: state.layer as any,
          previousRating,
          newRating: { party: 'unrated', strength: 'unrated', updatedAt: new Date().toISOString() },
          reason,
          scenarioId: state.currentScenarioId,
        };

        const newRatings = { ...scenario.ratings[layerKey] };
        delete newRatings[stateId];

        set((state) => ({
          scenarios: {
            ...state.scenarios,
            [state.currentScenarioId]: {
              ...scenario,
              updatedAt: new Date().toISOString(),
              ratings: {
                ...scenario.ratings,
                [layerKey]: newRatings,
              },
            },
          },
          changeLog: [...state.changeLog, logEntry],
        }));
      },

      toggleParty: (stateId) => {
        const state = get();
        const rating = state.getCurrentRating(stateId);
        if (!rating || rating.party === 'purple' || rating.party === 'unrated') return;

        const newParty = rating.party === 'dem' ? 'rep' : 'dem';
        state.setRating(stateId, newParty, rating.strength, rating.notes, 'Party toggled');
      },

      // Scenario actions
      createScenario: (name, description) => {
        const id = uuidv4();
        const newScenario: Scenario = {
          id,
          name,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ratings: {
            presidential: {},
            senate: {},
            governor: {},
            house: {},
          },
        };

        set((state) => ({
          scenarios: { ...state.scenarios, [id]: newScenario },
          currentScenarioId: id,
        }));

        return id;
      },

      loadScenario: (scenarioId) => {
        const state = get();
        if (state.scenarios[scenarioId]) {
          set({ currentScenarioId: scenarioId });
        }
      },

      deleteScenario: (scenarioId) => {
        if (scenarioId === 'default') return;

        set((state) => {
          const { [scenarioId]: deleted, ...remaining } = state.scenarios;
          return {
            scenarios: remaining,
            currentScenarioId:
              state.currentScenarioId === scenarioId ? 'default' : state.currentScenarioId,
          };
        });
      },

      duplicateScenario: (scenarioId, newName) => {
        const state = get();
        const sourceScenario = state.scenarios[scenarioId];
        if (!sourceScenario) return '';

        const newId = uuidv4();
        const newScenario: Scenario = {
          ...sourceScenario,
          id: newId,
          name: newName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          scenarios: { ...state.scenarios, [newId]: newScenario },
          currentScenarioId: newId,
        }));

        return newId;
      },

      renameScenario: (scenarioId, newName) => {
        set((state) => {
          const scenario = state.scenarios[scenarioId];
          if (!scenario) return state;

          return {
            scenarios: {
              ...state.scenarios,
              [scenarioId]: { ...scenario, name: newName },
            },
          };
        });
      },

      exportScenario: (scenarioId) => {
        const state = get();
        return state.scenarios[scenarioId] || state.scenarios['default'];
      },

      importScenario: (scenario) => {
        const newId = uuidv4();
        const importedScenario: Scenario = {
          ...scenario,
          id: newId,
          name: `${scenario.name} (Imported)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          scenarios: { ...state.scenarios, [newId]: importedScenario },
          currentScenarioId: newId,
        }));
      },

      getScenarioSummary: (scenarioId) => {
        const state = get();
        const id = scenarioId || state.currentScenarioId;
        const scenario = state.scenarios[id];

        const summary: ScenarioSummary = {
          electoralCollege: { dem: 0, rep: 0, battleground: 0, unrated: 0 },
          senate: { dem: 0, rep: 0, battleground: 0, unrated: 0, notUpForElection: 0 },
          house: { dem: 0, rep: 0, battleground: 0, unrated: 0 },
        };

        if (!scenario) return summary;

        // Calculate Electoral College
        const states = statesData.states as Record<string, { electoralVotes: number }>;
        Object.entries(states).forEach(([stateId, stateInfo]) => {
          const rating = scenario.ratings.presidential[stateId];
          const ev = stateInfo.electoralVotes;

          if (!rating || rating.party === 'unrated') {
            summary.electoralCollege.unrated += ev;
          } else if (rating.party === 'purple' || rating.strength === 'battleground') {
            summary.electoralCollege.battleground += ev;
          } else if (rating.party === 'dem') {
            summary.electoralCollege.dem += ev;
          } else if (rating.party === 'rep') {
            summary.electoralCollege.rep += ev;
          }
        });

        // Calculate Senate
        Object.entries(scenario.ratings.senate).forEach(([, rating]) => {
          if (!rating || rating.party === 'unrated') {
            summary.senate.unrated += 1;
          } else if (rating.party === 'purple' || rating.strength === 'battleground') {
            summary.senate.battleground += 1;
          } else if (rating.party === 'dem') {
            summary.senate.dem += 1;
          } else if (rating.party === 'rep') {
            summary.senate.rep += 1;
          }
        });

        // Calculate House
        Object.entries(scenario.ratings.house).forEach(([, rating]) => {
          if (!rating || rating.party === 'unrated') {
            summary.house.unrated += 1;
          } else if (rating.party === 'purple' || rating.strength === 'battleground') {
            summary.house.battleground += 1;
          } else if (rating.party === 'dem') {
            summary.house.dem += 1;
          } else if (rating.party === 'rep') {
            summary.house.rep += 1;
          }
        });

        return summary;
      },

      // Compare mode actions
      setCompareMode: (enabled) =>
        set({ compareMode: enabled, compareScenarioId: enabled ? null : null }),
      setCompareScenario: (scenarioId) => set({ compareScenarioId: scenarioId }),

      // Settings actions
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Change log actions
      undoLastChange: () => {
        const state = get();
        if (state.changeLog.length === 0) return;

        const lastEntry = state.changeLog[state.changeLog.length - 1];
        const scenario = state.scenarios[lastEntry.scenarioId];
        if (!scenario) return;

        const layerKey = lastEntry.electionType as 'presidential' | 'senate' | 'governor' | 'house';

        if (lastEntry.electionType === 'house' && lastEntry.district !== undefined) {
          const key = `${lastEntry.stateId}-${lastEntry.district}`;
          const newHouseRatings = { ...scenario.ratings.house };

          if (lastEntry.previousRating) {
            newHouseRatings[key] = lastEntry.previousRating as DistrictRating;
          } else {
            delete newHouseRatings[key];
          }

          set((state) => ({
            scenarios: {
              ...state.scenarios,
              [lastEntry.scenarioId]: {
                ...scenario,
                ratings: { ...scenario.ratings, house: newHouseRatings },
              },
            },
            changeLog: state.changeLog.slice(0, -1),
          }));
        } else {
          const newRatings = { ...scenario.ratings[layerKey] } as Record<string, Rating>;

          if (lastEntry.previousRating) {
            newRatings[lastEntry.stateId] = lastEntry.previousRating as Rating;
          } else {
            delete newRatings[lastEntry.stateId];
          }

          set((state) => ({
            scenarios: {
              ...state.scenarios,
              [lastEntry.scenarioId]: {
                ...scenario,
                ratings: { ...scenario.ratings, [layerKey]: newRatings },
              },
            },
            changeLog: state.changeLog.slice(0, -1),
          }));
        }
      },

      getChangeLogForState: (stateId) => {
        return get().changeLog.filter((entry) => entry.stateId === stateId);
      },

      // Utility
      getCurrentRating: (stateId) => {
        const state = get();
        const scenario = state.scenarios[state.currentScenarioId];
        if (!scenario) return undefined;

        const layerKey = state.layer as 'presidential' | 'senate' | 'governor';
        return scenario.ratings[layerKey]?.[stateId];
      },

      getCurrentDistrictRating: (stateId, district) => {
        const state = get();
        const scenario = state.scenarios[state.currentScenarioId];
        if (!scenario) return undefined;

        const key = `${stateId}-${district}`;
        return scenario.ratings.house?.[key];
      },
    }),
    {
      name: 'politics-map-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        scenarios: state.scenarios,
        currentScenarioId: state.currentScenarioId,
        changeLog: state.changeLog,
        settings: state.settings,
        layer: state.layer,
      }),
    }
  )
);

// ============================================
// SELECTORS
// ============================================

export const selectCurrentScenario = (state: AppState) =>
  state.scenarios[state.currentScenarioId];

export const selectAllScenarios = (state: AppState) =>
  Object.values(state.scenarios);

export const selectRatingForState = (stateId: string) => (state: AppState) =>
  state.getCurrentRating(stateId);

export const selectIsColorblindMode = (state: AppState) =>
  state.settings.colorblindMode;
