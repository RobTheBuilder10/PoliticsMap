// Pipeline-specific types
export interface StateConfig {
  id: string;
  name: string;
  registrationUrl?: string;
  registrationParser?: string;
  hasPartisanData: boolean;
  updateFrequency: 'monthly' | 'quarterly' | 'annual' | 'biennial' | 'none';
  notes?: string;
}

export interface FetchResult {
  stateId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}

export interface ParsedRegistration {
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

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface PipelineRun {
  id: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  statesProcessed: string[];
  statesSuccessful: string[];
  statesFailed: string[];
  errors: Array<{
    stateId: string;
    errorType: string;
    message: string;
  }>;
}

// State configurations for data fetching
export const STATE_CONFIGS: Record<string, StateConfig> = {
  AZ: {
    id: 'AZ',
    name: 'Arizona',
    registrationUrl: 'https://azsos.gov/elections/voter-registration-historical-election-data',
    hasPartisanData: true,
    updateFrequency: 'monthly',
  },
  CA: {
    id: 'CA',
    name: 'California',
    registrationUrl: 'https://www.sos.ca.gov/elections/voter-registration',
    hasPartisanData: true,
    updateFrequency: 'monthly',
  },
  CO: {
    id: 'CO',
    name: 'Colorado',
    registrationUrl: 'https://www.sos.state.co.us/pubs/elections/VoterRegNumbers/VoterRegNumbers.html',
    hasPartisanData: true,
    updateFrequency: 'monthly',
  },
  FL: {
    id: 'FL',
    name: 'Florida',
    registrationUrl: 'https://dos.myflorida.com/elections/data-statistics/voter-registration-statistics/',
    hasPartisanData: true,
    updateFrequency: 'monthly',
  },
  GA: {
    id: 'GA',
    name: 'Georgia',
    registrationUrl: 'https://sos.ga.gov/page/voter-registration-statistics',
    hasPartisanData: false,
    updateFrequency: 'monthly',
  },
  MI: {
    id: 'MI',
    name: 'Michigan',
    registrationUrl: 'https://mvic.sos.state.mi.us/',
    hasPartisanData: false,
    updateFrequency: 'monthly',
  },
  NC: {
    id: 'NC',
    name: 'North Carolina',
    registrationUrl: 'https://www.ncsbe.gov/results-data/voter-registration-data',
    hasPartisanData: true,
    updateFrequency: 'monthly',
  },
  NV: {
    id: 'NV',
    name: 'Nevada',
    registrationUrl: 'https://www.nvsos.gov/sos/elections/voters/voter-registration-statistics',
    hasPartisanData: true,
    updateFrequency: 'monthly',
  },
  PA: {
    id: 'PA',
    name: 'Pennsylvania',
    registrationUrl: 'https://www.dos.pa.gov/VotingElections/OtherServicesEvents/VotingElectionStatistics/Pages/default.aspx',
    hasPartisanData: true,
    updateFrequency: 'monthly',
  },
  TX: {
    id: 'TX',
    name: 'Texas',
    registrationUrl: 'https://www.sos.texas.gov/elections/historical/index.shtml',
    hasPartisanData: false,
    updateFrequency: 'monthly',
  },
  WI: {
    id: 'WI',
    name: 'Wisconsin',
    registrationUrl: 'https://elections.wi.gov/statistics-data',
    hasPartisanData: false,
    updateFrequency: 'quarterly',
  },
};
