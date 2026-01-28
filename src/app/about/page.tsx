import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">
        About PoliticsMap
      </h1>

      <div className="prose prose-surface dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
            What is PoliticsMap?
          </h2>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            PoliticsMap is an interactive election analysis and visualization tool designed for
            researchers, journalists, political enthusiasts, and anyone interested in understanding
            U.S. elections. It provides comprehensive data on presidential, Senate, House, and
            gubernatorial races.
          </p>
          <p className="text-surface-600 dark:text-surface-400">
            <strong>This is a visualization and analysis tool, not a prediction or persuasion product.</strong>
            We aim to present data clearly and honestly, letting users draw their own conclusions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
            Key Features
          </h2>
          <ul className="list-disc list-inside text-surface-600 dark:text-surface-400 space-y-2">
            <li>
              <strong>Interactive Maps:</strong> Click on states to view details and set ratings
              for presidential, Senate, governor, and House races.
            </li>
            <li>
              <strong>Rating System:</strong> Rate states using a familiar scale (Safe, Likely, Lean, Tilt)
              for both parties, or mark as Battleground.
            </li>
            <li>
              <strong>Registration Trends:</strong> View historical voter registration data where available,
              with clear attribution and update frequency.
            </li>
            <li>
              <strong>Election Results:</strong> Access historical election results to provide context
              for current ratings.
            </li>
            <li>
              <strong>Scenario Modeling:</strong> Create, save, compare, and share multiple scenarios
              to explore different electoral outcomes.
            </li>
            <li>
              <strong>Change Log:</strong> Full audit trail of all rating changes with timestamps
              and optional reason tracking.
            </li>
            <li>
              <strong>Accessibility:</strong> Keyboard navigation, colorblind-friendly palette option,
              and mobile-responsive design.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
            Methodology
          </h2>
          <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-2">
              Rating Scale
            </h3>
            <ul className="text-sm text-surface-600 dark:text-surface-400 space-y-1">
              <li><strong>Safe:</strong> Expected win margin of 15+ points</li>
              <li><strong>Likely:</strong> Expected win margin of 8-15 points</li>
              <li><strong>Lean:</strong> Expected win margin of 3-8 points</li>
              <li><strong>Tilt:</strong> Expected win margin of 0-3 points</li>
              <li><strong>Battleground:</strong> True toss-up, either party could win</li>
            </ul>
          </div>
          <p className="text-surface-600 dark:text-surface-400">
            Ratings are user-defined and subjective. This tool does not generate automated predictions
            or use polling averages to set ratings. Users can create their own assessments based on
            whatever factors they consider relevant.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
            Data Sources
          </h2>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            All data comes from official public sources, primarily state Secretaries of State
            and election offices. We use:
          </p>
          <ul className="list-disc list-inside text-surface-600 dark:text-surface-400 space-y-1">
            <li>State-level voter registration statistics (where publicly available)</li>
            <li>Official certified election results</li>
            <li>U.S. Election Assistance Commission (EAC) EAVS data for baseline reference</li>
            <li>Census Bureau CPS Voting Supplement for additional context</li>
          </ul>
          <p className="text-surface-600 dark:text-surface-400 mt-4">
            We do not use any personally identifiable information (PII) or individual voter files.
            All data is aggregate and publicly available.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
            Data Transparency
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            We believe in complete transparency about our data:
          </p>
          <ul className="list-disc list-inside text-surface-600 dark:text-surface-400 space-y-1 mt-2">
            <li>Every data point shows its source and last update date</li>
            <li>States without available data are clearly marked, not filled with estimates</li>
            <li>Update frequencies vary by state and are clearly labeled</li>
            <li>Registration trends are labeled as such, not as election predictions</li>
            <li>The <a href="/coverage" className="text-blue-600 dark:text-blue-400 hover:underline">Data Coverage</a> page shows exactly what data we have for each state</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
            Important Disclaimers
          </h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
              <li>
                <strong>Not Predictions:</strong> This tool does not predict election outcomes.
                Ratings are user-defined assessments, not forecasts.
              </li>
              <li>
                <strong>Registration ≠ Votes:</strong> Voter registration trends do not predict
                how people will vote or turnout patterns.
              </li>
              <li>
                <strong>No Affiliation:</strong> PoliticsMap is not affiliated with any political
                party, campaign, or government entity.
              </li>
              <li>
                <strong>Educational Purpose:</strong> This tool is for analysis and education,
                not voter persuasion or suppression.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
            Privacy
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            PoliticsMap respects your privacy:
          </p>
          <ul className="list-disc list-inside text-surface-600 dark:text-surface-400 space-y-1 mt-2">
            <li>All scenarios are stored locally in your browser</li>
            <li>No account or login required</li>
            <li>No personal data is collected or transmitted</li>
            <li>No tracking cookies or analytics beyond standard web server logs</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
            Technical Details
          </h2>
          <p className="text-surface-600 dark:text-surface-400 mb-2">
            Built with:
          </p>
          <ul className="list-disc list-inside text-surface-600 dark:text-surface-400 space-y-1">
            <li>Next.js 14 (App Router)</li>
            <li>TypeScript for type safety</li>
            <li>D3.js and TopoJSON for map rendering</li>
            <li>Recharts for data visualization</li>
            <li>Tailwind CSS for styling</li>
            <li>Zustand for state management</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
            Contact
          </h2>
          <p className="text-surface-600 dark:text-surface-400">
            For questions, bug reports, or feature requests, please open an issue on our
            GitHub repository.
          </p>
        </section>
      </div>
    </div>
  );
}
