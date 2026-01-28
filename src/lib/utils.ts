import type { Party, RatingStrength, Rating, RatingColor, TrendInsight, RegistrationSnapshot } from '@/types';

// ============================================
// COLOR UTILITIES
// ============================================

const STANDARD_COLORS = {
  dem: {
    safe: '#1a4480',
    likely: '#2e6db4',
    lean: '#5c9cd8',
    tilt: '#a6cee3',
  },
  rep: {
    safe: '#8b0000',
    likely: '#c41e3a',
    lean: '#e65c5c',
    tilt: '#f4a6a6',
  },
  purple: {
    battleground: '#7b2d8e',
    safe: '#7b2d8e',
    likely: '#7b2d8e',
    lean: '#9b4daa',
    tilt: '#9b4daa',
  },
  unrated: {
    safe: '#d4d4d8',
    likely: '#d4d4d8',
    lean: '#d4d4d8',
    tilt: '#d4d4d8',
    unrated: '#d4d4d8',
    battleground: '#d4d4d8',
  },
};

const COLORBLIND_COLORS = {
  dem: {
    safe: '#0072B2',
    likely: '#56B4E9',
    lean: '#88CCEE',
    tilt: '#BBDDFF',
  },
  rep: {
    safe: '#D55E00',
    likely: '#E69F00',
    lean: '#F0C566',
    tilt: '#FFDD99',
  },
  purple: {
    battleground: '#CC79A7',
    safe: '#CC79A7',
    likely: '#CC79A7',
    lean: '#DDAACC',
    tilt: '#DDAACC',
  },
  unrated: {
    safe: '#d4d4d8',
    likely: '#d4d4d8',
    lean: '#d4d4d8',
    tilt: '#d4d4d8',
    unrated: '#d4d4d8',
    battleground: '#d4d4d8',
  },
};

export function getRatingColor(
  rating: Rating | undefined,
  colorblindMode: boolean = false
): RatingColor {
  if (!rating || rating.party === 'unrated') {
    return {
      fill: '#e4e4e7',
      stroke: '#a1a1aa',
      text: '#52525b',
    };
  }

  const colors = colorblindMode ? COLORBLIND_COLORS : STANDARD_COLORS;
  const partyColors = colors[rating.party];
  const strengthKey = rating.strength === 'battleground' ? 'battleground' : rating.strength;
  const fill = partyColors[strengthKey as keyof typeof partyColors] || '#e4e4e7';

  return {
    fill,
    stroke: rating.party === 'purple' ? '#5a1f6a' : rating.party === 'dem' ? '#0f3460' : '#5a0000',
    text: ['safe', 'likely'].includes(rating.strength) ? '#ffffff' : '#1a1a1a',
  };
}

export function getMarginColor(margin: number, colorblindMode: boolean = false): string {
  const colors = colorblindMode ? COLORBLIND_COLORS : STANDARD_COLORS;

  if (margin > 15) return colors.dem.safe;
  if (margin > 8) return colors.dem.likely;
  if (margin > 3) return colors.dem.lean;
  if (margin > 0) return colors.dem.tilt;
  if (margin > -3) return colors.rep.tilt;
  if (margin > -8) return colors.rep.lean;
  if (margin > -15) return colors.rep.likely;
  return colors.rep.safe;
}

// ============================================
// FORMATTING UTILITIES
// ============================================

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

export function formatPercentage(num: number, decimals: number = 1): string {
  return `${num.toFixed(decimals)}%`;
}

export function formatMargin(margin: number): string {
  const prefix = margin > 0 ? 'D+' : margin < 0 ? 'R+' : '';
  return `${prefix}${Math.abs(margin).toFixed(1)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ============================================
// RATING UTILITIES
// ============================================

export function getRatingLabel(party: Party, strength: RatingStrength): string {
  if (party === 'unrated' || strength === 'unrated') return 'Unrated';
  if (party === 'purple' || strength === 'battleground') return 'Battleground';

  const partyLabel = party === 'dem' ? 'Dem' : 'Rep';
  const strengthLabel = strength.charAt(0).toUpperCase() + strength.slice(1);

  return `${strengthLabel} ${partyLabel}`;
}

export function getRatingShortLabel(rating: Rating | undefined): string {
  if (!rating || rating.party === 'unrated') return '-';
  if (rating.party === 'purple' || rating.strength === 'battleground') return 'BG';

  const partyPrefix = rating.party === 'dem' ? 'D' : 'R';
  const strengthSuffix = {
    safe: 'S',
    likely: 'L',
    lean: 'l',
    tilt: 'T',
    battleground: 'B',
    unrated: '-',
  }[rating.strength];

  return `${partyPrefix}${strengthSuffix}`;
}

export function sortRatingsByStrength(a: RatingStrength, b: RatingStrength): number {
  const order: Record<RatingStrength, number> = {
    safe: 0,
    likely: 1,
    lean: 2,
    tilt: 3,
    battleground: 4,
    unrated: 5,
  };
  return order[a] - order[b];
}

// ============================================
// TREND CALCULATION UTILITIES
// ============================================

export function calculateTrendInsights(history: RegistrationSnapshot[]): TrendInsight | null {
  if (history.length < 2) return null;

  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const current = sorted[0];
  const previous = sorted[1];
  const twelveMonthsAgo = sorted.find((s) => {
    const diff = new Date(current.date).getTime() - new Date(s.date).getTime();
    const months = diff / (1000 * 60 * 60 * 24 * 30);
    return months >= 11 && months <= 13;
  });

  const momChange = current.total - previous.total;

  let momPartyShift: TrendInsight['momPartyShift'] | undefined;
  if (current.democratic !== undefined && previous.democratic !== undefined) {
    momPartyShift = {
      dem: (current.democratic || 0) - (previous.democratic || 0),
      rep: (current.republican || 0) - (previous.republican || 0),
      ind: (current.independent || 0) - (previous.independent || 0),
    };
  }

  let twelveMonthSlope: 'up' | 'down' | 'flat' = 'flat';
  let slopeValue: number | undefined;

  if (twelveMonthsAgo) {
    const totalChange = current.total - twelveMonthsAgo.total;
    slopeValue = totalChange;
    if (totalChange > current.total * 0.01) {
      twelveMonthSlope = 'up';
    } else if (totalChange < -current.total * 0.01) {
      twelveMonthSlope = 'down';
    }
  }

  return {
    momChange,
    momPartyShift,
    twelveMonthSlope,
    slopeValue,
  };
}

// ============================================
// URL / PERMALINK UTILITIES
// ============================================

import LZString from 'lz-string';
import type { Scenario, PermalinkData, MapLayer } from '@/types';

export function encodeScenarioToUrl(scenario: Scenario, layer: MapLayer, selectedState?: string): string {
  const data: PermalinkData = {
    scenarioId: scenario.id,
    ratings: LZString.compressToEncodedURIComponent(JSON.stringify(scenario.ratings)),
    layer,
    selectedState,
    version: 1,
  };

  return LZString.compressToEncodedURIComponent(JSON.stringify(data));
}

export function decodeScenarioFromUrl(encoded: string): PermalinkData | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (!decompressed) return null;

    const data = JSON.parse(decompressed) as PermalinkData;
    data.ratings = LZString.decompressFromEncodedURIComponent(data.ratings) || '{}';

    return data;
  } catch {
    return null;
  }
}

export function generateShareableUrl(scenario: Scenario, layer: MapLayer, selectedState?: string): string {
  const encoded = encodeScenarioToUrl(scenario, layer, selectedState);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/?s=${encoded}`;
}

// ============================================
// KEYBOARD SHORTCUT UTILITIES
// ============================================

export function getKeyboardAction(
  event: KeyboardEvent
): { action: string; modifiers: string[] } | null {
  const modifiers: string[] = [];
  if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
  if (event.shiftKey) modifiers.push('shift');
  if (event.altKey) modifiers.push('alt');

  const key = event.key;

  const shortcuts: Record<string, { action: string; modifiers: string[] }> = {
    '1': { action: 'setTilt', modifiers: [] },
    '2': { action: 'setLean', modifiers: [] },
    '3': { action: 'setLikely', modifiers: [] },
    '4': { action: 'setSafe', modifiers: [] },
    'p': { action: 'setBattleground', modifiers: [] },
    'P': { action: 'setBattleground', modifiers: [] },
    'u': { action: 'setUnrated', modifiers: [] },
    'U': { action: 'setUnrated', modifiers: [] },
    'd': { action: 'setDem', modifiers: [] },
    'D': { action: 'setDem', modifiers: [] },
    'r': { action: 'setRep', modifiers: [] },
    'R': { action: 'setRep', modifiers: [] },
    'Escape': { action: 'deselect', modifiers: [] },
    'ArrowLeft': { action: 'prevState', modifiers: [] },
    'ArrowRight': { action: 'nextState', modifiers: [] },
    'Tab': { action: 'nextState', modifiers: [] },
  };

  // Ctrl+Z for undo
  if ((event.ctrlKey || event.metaKey) && key === 'z') {
    return { action: 'undo', modifiers: ['ctrl'] };
  }

  // Ctrl+S for save
  if ((event.ctrlKey || event.metaKey) && key === 's') {
    return { action: 'save', modifiers: ['ctrl'] };
  }

  return shortcuts[key] || null;
}

// ============================================
// STATE NAVIGATION UTILITIES
// ============================================

const STATE_ORDER = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function getNextState(currentState: string | null): string {
  if (!currentState) return STATE_ORDER[0];
  const currentIndex = STATE_ORDER.indexOf(currentState);
  const nextIndex = (currentIndex + 1) % STATE_ORDER.length;
  return STATE_ORDER[nextIndex];
}

export function getPrevState(currentState: string | null): string {
  if (!currentState) return STATE_ORDER[STATE_ORDER.length - 1];
  const currentIndex = STATE_ORDER.indexOf(currentState);
  const prevIndex = (currentIndex - 1 + STATE_ORDER.length) % STATE_ORDER.length;
  return STATE_ORDER[prevIndex];
}

// ============================================
// DATA VALIDATION UTILITIES
// ============================================

export function validateRegistrationData(data: RegistrationSnapshot): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof data.total !== 'number' || data.total < 0) {
    errors.push('Total must be a non-negative integer');
  }

  if (data.democratic !== undefined && (typeof data.democratic !== 'number' || data.democratic < 0)) {
    errors.push('Democratic count must be a non-negative integer');
  }

  if (data.republican !== undefined && (typeof data.republican !== 'number' || data.republican < 0)) {
    errors.push('Republican count must be a non-negative integer');
  }

  // Check if partisan totals match overall total (with tolerance)
  if (data.democratic !== undefined && data.republican !== undefined) {
    const partisanTotal = (data.democratic || 0) + (data.republican || 0) +
                          (data.independent || 0) + (data.other || 0) + (data.noParty || 0);
    const diff = Math.abs(partisanTotal - data.total);
    if (diff > data.total * 0.01) { // 1% tolerance
      errors.push(`Partisan totals (${partisanTotal}) don't match overall total (${data.total})`);
    }
  }

  if (!data.source) {
    errors.push('Source is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// CLASS NAME UTILITY
// ============================================

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
