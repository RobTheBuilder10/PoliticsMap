// ============================================
// CORE TYPES FOR ELECTIONS ANALYSIS PLATFORM
// ============================================

// Political party alignment
export type Party = 'dem' | 'rep' | 'purple' | 'unrated';

// Rating strength levels
export type RatingStrength = 'safe' | 'likely' | 'lean' | 'tilt' | 'battleground' | 'unrated';

// Election types
export type ElectionType = 'presidential' | 'senate' | 'house' | 'governor';

// Map layer types
export type MapLayer = 'presidential' | 'senate' | 'governor' | 'house';

// ============================================
// STATE DATA TYPES
// ============================================

export interface StateInfo {
  id: string; // Two-letter code (e.g., "AZ")
  name: string;
  fips: string;
  electoralVotes: number;
  region: 'northeast' | 'southeast' | 'midwest' | 'southwest' | 'west';
  senateClass1: 1 | 2 | 3; // Which class the senior senator belongs to
  senateClass2: 1 | 2 | 3; // Which class the junior senator belongs to
  hasPartisanRegistration: boolean;
  houseDistricts: number;
}

// ============================================
// RATING TYPES
// ============================================

export interface Rating {
  party: Party;
  strength: RatingStrength;
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface StateRating extends Rating {
  stateId: string;
  electionType: ElectionType;
}

export interface DistrictRating extends Rating {
  stateId: string;
  district: number;
  incumbent?: string;
  incumbentParty?: Party;
  isOpenSeat: boolean;
}

// ============================================
// SCENARIO TYPES
// ============================================

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ratings: {
    presidential: Record<string, Rating>;
    senate: Record<string, Rating>;
    governor: Record<string, Rating>;
    house: Record<string, DistrictRating>;
  };
  metadata?: {
    author?: string;
    source?: string;
    version?: number;
  };
}

export interface ScenarioSummary {
  electoralCollege: {
    dem: number;
    rep: number;
    battleground: number;
    unrated: number;
  };
  senate: {
    dem: number;
    rep: number;
    battleground: number;
    unrated: number;
    notUpForElection: number;
  };
  house: {
    dem: number;
    rep: number;
    battleground: number;
    unrated: number;
  };
}

export interface ScenarioDiff {
  stateId: string;
  electionType: ElectionType;
  district?: number;
  scenario1Rating: Rating | null;
  scenario2Rating: Rating | null;
}

// ============================================
// REGISTRATION & TREND TYPES
// ============================================

export interface RegistrationSnapshot {
  date: string;
  total: number;
  democratic?: number;
  republican?: number;
  independent?: number;
  other?: number;
  noParty?: number;
  source: string;
  sourceUrl: string;
}

export interface StateTrends {
  stateId: string;
  hasPartisanRegistration: boolean;
  registrationHistory: RegistrationSnapshot[];
  lastUpdated: string;
  updateFrequency: 'monthly' | 'quarterly' | 'annual' | 'biennial' | 'unknown';
  coverageNotes?: string;
}

export interface TrendInsight {
  momChange: number; // Month-over-month change in total registration
  momPartyShift?: {
    dem: number;
    rep: number;
    ind: number;
  };
  twelveMonthSlope: 'up' | 'down' | 'flat';
  slopeValue?: number;
}

// ============================================
// TURNOUT TYPES
// ============================================

export interface TurnoutData {
  year: number;
  electionType: 'general' | 'primary' | 'special';
  registeredVoters?: number;
  totalVotes: number;
  turnoutRate?: number;
  source: string;
  sourceUrl: string;
}

// ============================================
// ELECTION RESULTS TYPES
// ============================================

export interface CandidateResult {
  name: string;
  party: Party | 'other';
  votes: number;
  percentage: number;
}

export interface ElectionResult {
  year: number;
  electionType: ElectionType;
  stateId: string;
  district?: number;
  winner: string;
  winnerParty: Party | 'other';
  margin: number;
  candidates: CandidateResult[];
  totalVotes: number;
  turnout?: number;
  source: string;
  sourceUrl: string;
}

export interface StateResults {
  stateId: string;
  presidential: ElectionResult[];
  senate: ElectionResult[];
  governor: ElectionResult[];
  house: Record<number, ElectionResult[]>;
}

// ============================================
// CALENDAR & DEADLINE TYPES
// ============================================

export interface ElectionDate {
  date: string;
  type: 'registration_deadline' | 'early_voting_start' | 'early_voting_end' | 'primary' | 'general' | 'runoff';
  description: string;
  stateId?: string; // If state-specific
  source?: string;
  sourceUrl?: string;
  isReliable: boolean; // False if data is uncertain
}

export interface StateCalendar {
  stateId: string;
  dates: ElectionDate[];
  lastVerified: string;
  coverageNotes?: string;
}

// ============================================
// DATA COVERAGE TYPES
// ============================================

export interface DataCoverage {
  stateId: string;
  registration: {
    available: boolean;
    frequency: 'monthly' | 'quarterly' | 'annual' | 'biennial' | 'none';
    hasPartisanBreakdown: boolean;
    lastUpdated?: string;
    sourceUrl?: string;
    notes?: string;
  };
  turnout: {
    available: boolean;
    years: number[];
    source?: string;
  };
  results: {
    presidential: number[]; // Years available
    senate: number[];
    governor: number[];
    house: number[];
  };
  calendar: {
    available: boolean;
    lastVerified?: string;
    isReliable: boolean;
  };
}

// ============================================
// CHANGE LOG / AUDIT TYPES
// ============================================

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  stateId: string;
  district?: number;
  electionType: ElectionType;
  previousRating: Rating | null;
  newRating: Rating;
  reason?: string;
  scenarioId: string;
}

export interface AuditTrail {
  scenarioId: string;
  entries: ChangeLogEntry[];
  createdAt: string;
  lastModified: string;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface MapViewState {
  layer: MapLayer;
  selectedState: string | null;
  selectedDistrict: number | null;
  zoom: number;
  center: [number, number];
  showHistoricalMargins: boolean;
  historicalYear?: number;
  colorblindMode: boolean;
}

export interface AppSettings {
  colorblindMode: boolean;
  darkMode: boolean;
  autoSave: boolean;
  showTooltips: boolean;
  keyboardShortcuts: boolean;
}

// ============================================
// EXPORT TYPES
// ============================================

export interface ExportOptions {
  format: 'png' | 'json' | 'url';
  includeNotes: boolean;
  includeTimestamps: boolean;
  scenario: Scenario;
}

export interface PermalinkData {
  scenarioId?: string;
  ratings: string; // Compressed/encoded rating data
  layer: MapLayer;
  selectedState?: string;
  version: number;
}

// ============================================
// PIPELINE TYPES
// ============================================

export interface PipelineError {
  stateId: string;
  errorType: 'fetch' | 'parse' | 'validate' | 'unknown';
  message: string;
  timestamp: string;
  attemptedSource?: string;
}

export interface PipelineStatus {
  lastRun: string;
  success: boolean;
  statesUpdated: string[];
  errors: PipelineError[];
  duration: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================
// API / DATA FETCH TYPES
// ============================================

export interface DataSource {
  id: string;
  name: string;
  url: string;
  type: 'registration' | 'turnout' | 'results' | 'calendar';
  states: string[]; // Which states this source covers
  updateFrequency: string;
  lastChecked: string;
  notes?: string;
}

// ============================================
// COMPUTED TYPES (for UI)
// ============================================

export interface RatingColor {
  fill: string;
  stroke: string;
  text: string;
}

export interface TooltipData {
  stateId: string;
  stateName: string;
  rating?: Rating;
  registration?: RegistrationSnapshot;
  lastResult?: ElectionResult;
  position: { x: number; y: number };
}

// ============================================
// KEYBOARD SHORTCUT TYPES
// ============================================

export interface KeyboardShortcut {
  key: string;
  action: string;
  description: string;
  modifiers?: ('ctrl' | 'shift' | 'alt')[];
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { key: '1', action: 'setTilt', description: 'Set rating to Tilt' },
  { key: '2', action: 'setLean', description: 'Set rating to Lean' },
  { key: '3', action: 'setLikely', description: 'Set rating to Likely' },
  { key: '4', action: 'setSafe', description: 'Set rating to Safe' },
  { key: 'p', action: 'setBattleground', description: 'Set as Battleground' },
  { key: 'u', action: 'setUnrated', description: 'Clear rating' },
  { key: 'd', action: 'toggleParty', description: 'Toggle Democrat/Republican' },
  { key: 'r', action: 'toggleParty', description: 'Toggle Democrat/Republican' },
  { key: 'Escape', action: 'deselect', description: 'Deselect state' },
  { key: 'ArrowLeft', action: 'prevState', description: 'Previous state' },
  { key: 'ArrowRight', action: 'nextState', description: 'Next state' },
  { key: 's', action: 'save', description: 'Save scenario', modifiers: ['ctrl'] },
  { key: 'z', action: 'undo', description: 'Undo last change', modifiers: ['ctrl'] },
];
