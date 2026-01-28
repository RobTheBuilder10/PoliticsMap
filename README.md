# PoliticsMap

An interactive U.S. elections analysis platform for visualizing and modeling presidential, Senate, House, and gubernatorial races.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Overview

PoliticsMap is a comprehensive election visualization tool designed for researchers, journalists, and political enthusiasts. It provides:

- **Interactive Maps**: Click-to-rate system for all 50 states + DC
- **Rating System**: Safe/Likely/Lean/Tilt for both parties, plus Battleground
- **Registration Trends**: Historical voter registration data with charts
- **Results History**: Past election results for context
- **Scenario Modeling**: Create, save, compare, and export scenarios
- **Change Tracking**: Full audit trail of all rating changes

**This is a visualization and analysis tool, not a prediction or persuasion product.**

## Features

### Core Features

- **Multi-layer Maps**: Presidential, Senate, Governor, and House views
- **State Detail Panel**: Comprehensive "command center" when selecting states
- **Real-time Summary**: Electoral College, Senate, and House tallies
- **Keyboard Shortcuts**: Navigate and rate states without a mouse
- **Accessibility**: Colorblind-friendly palette, full keyboard navigation

### Data Features

- **Registration Trends**: Monthly data from state election offices
- **Turnout History**: Historical turnout rates by election type
- **Election Results**: Past 3 cycles for each office type
- **Trend Insights**: Month-over-month changes (clearly labeled as trends, not predictions)

### Scenario Features

- **Multiple Scenarios**: Create and manage multiple scenarios
- **Compare Mode**: Side-by-side comparison of two scenarios
- **Change Log**: Full audit trail with replay functionality
- **Export/Import**: JSON export, PNG map images, shareable URLs

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/politicsmap.git
cd politicsmap

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
politicsmap/
├── data/                     # Versioned JSON data files
│   ├── states.json           # State metadata (EV, districts, etc.)
│   ├── coverage.json         # Data availability by state
│   ├── calendar.json         # Election dates and deadlines
│   ├── sources.json          # Data source attribution
│   ├── errors.json           # Pipeline error tracking
│   ├── ratings/              # Scenario files
│   │   └── baseline.json
│   ├── trends/               # State registration trends
│   │   └── [STATE].json
│   └── results/              # Historical election results
│       └── [STATE].json
├── scripts/                  # Data pipeline scripts
│   ├── types.ts              # Pipeline type definitions
│   ├── fetch-data.ts         # Data fetching script
│   ├── validate-data.ts      # Data validation script
│   └── refresh-pipeline.ts   # Main pipeline orchestrator
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Home (map view)
│   │   ├── scenarios/        # Scenario management
│   │   ├── coverage/         # Data availability
│   │   ├── calendar/         # Election dates
│   │   └── about/            # About page
│   ├── components/
│   │   ├── map/              # Map components (D3/TopoJSON)
│   │   ├── panel/            # State detail panel
│   │   ├── scenarios/        # Scenario management
│   │   ├── changelog/        # Audit trail
│   │   └── layout/           # Layout components
│   ├── store/                # Zustand state management
│   ├── lib/                  # Utilities and helpers
│   └── types/                # TypeScript type definitions
├── .github/workflows/        # GitHub Actions
│   ├── ci.yml                # Build/lint/test
│   └── data-refresh.yml      # Monthly data refresh
└── public/                   # Static assets
```

## Data Update Process

### Monthly Refresh Pipeline

Data is refreshed automatically on the 1st of every month via GitHub Actions:

1. **Fetch**: Scripts fetch data from state election office websites
2. **Parse**: Raw data is parsed into structured JSON format
3. **Validate**: Data integrity checks ensure quality
4. **Version**: Changes are committed to the repository
5. **Deploy**: Updated site is deployed automatically

### Manual Data Refresh

```bash
# Run the full pipeline locally
npm run data:refresh

# Or run individual steps
npm run data:fetch      # Fetch new data
npm run data:validate   # Validate data files
```

### Adding a New State Connector

1. Add state configuration to `scripts/types.ts`:

```typescript
export const STATE_CONFIGS = {
  // ...existing states
  XX: {
    id: 'XX',
    name: 'New State',
    registrationUrl: 'https://...',
    hasPartisanData: true,
    updateFrequency: 'monthly',
  },
};
```

2. If the state has a non-standard data format, add a custom parser in `scripts/fetch-data.ts`

3. Run validation to ensure data quality:

```bash
npm run data:validate
```

## Scenarios and Permalinks

### Scenario Structure

Scenarios are stored in `data/ratings/` with this structure:

```json
{
  "id": "baseline",
  "name": "My Scenario",
  "description": "Description here",
  "createdAt": "2026-01-27T00:00:00Z",
  "updatedAt": "2026-01-27T00:00:00Z",
  "ratings": {
    "presidential": {
      "AZ": { "party": "purple", "strength": "battleground" },
      "TX": { "party": "rep", "strength": "likely" }
    },
    "senate": { ... },
    "governor": { ... },
    "house": { ... }
  }
}
```

### Permalink Format

Shareable URLs encode the scenario state using LZ-string compression:

```
https://yoursite.com/?s=BASE64_ENCODED_SCENARIO_DATA
```

The encoded data includes:
- All ratings
- Current map layer
- Selected state (optional)
- Version number for forward compatibility

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Set rating to Tilt |
| `2` | Set rating to Lean |
| `3` | Set rating to Likely |
| `4` | Set rating to Safe |
| `P` | Set as Battleground |
| `U` | Clear rating |
| `D` | Set to Democrat |
| `R` | Set to Republican |
| `←`/`→` | Navigate between states |
| `Escape` | Deselect state |
| `Ctrl+Z` | Undo last change |

## Rating Scale

| Rating | Description |
|--------|-------------|
| **Safe** | Expected win margin of 15+ points |
| **Likely** | Expected win margin of 8-15 points |
| **Lean** | Expected win margin of 3-8 points |
| **Tilt** | Expected win margin of 0-3 points |
| **Battleground** | True toss-up |

## Data Sources

All data comes from official public sources:

- **Primary**: State Secretary of State offices
- **Secondary**: State Board of Elections
- **National**: EAC EAVS (biennial reference), Census CPS

See the [Data Coverage](/coverage) page for detailed availability by state.

### Data Limitations

- Not all states track party registration
- Update frequencies vary by state
- Registration trends ≠ election predictions
- Some historical data may be incomplete

## Configuration

### Environment Variables

No environment variables required for basic usage.

For deployment:
- `NEXT_PUBLIC_SITE_URL`: Base URL for permalink generation

### Tailwind Theme

Customize colors in `tailwind.config.ts`:

```typescript
colors: {
  dem: { safe: '#1a4480', likely: '#2e6db4', ... },
  rep: { safe: '#8b0000', likely: '#c41e3a', ... },
  battleground: { DEFAULT: '#7b2d8e' },
  // Colorblind-friendly alternatives
  'cb-dem': { ... },
  'cb-rep': { ... },
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run validation: `npm run data:validate`
5. Submit a pull request

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Follow existing patterns

## Disclaimers

- **Not Predictions**: Ratings are user-defined, not automated forecasts
- **Registration ≠ Votes**: Trends don't predict election outcomes
- **No Affiliation**: Not affiliated with any party or campaign
- **Verify Dates**: Always confirm deadlines with official sources

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Map data: US Census Bureau, Natural Earth
- TopoJSON: Mike Bostock
- D3.js: Observable
