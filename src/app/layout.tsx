import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'PoliticsMap - U.S. Elections Analysis Platform',
  description: 'Interactive election analysis tool with state ratings, registration trends, results history, and scenario modeling for presidential, Senate, House, and gubernatorial races.',
  keywords: ['elections', 'electoral college', 'voter registration', 'election analysis', 'political maps'],
  authors: [{ name: 'PoliticsMap Team' }],
  openGraph: {
    title: 'PoliticsMap - U.S. Elections Analysis Platform',
    description: 'Interactive election analysis tool with scenario modeling and registration trends.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-surface-200 dark:border-surface-700 py-6 mt-auto">
              <div className="max-w-screen-2xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-surface-500 dark:text-surface-400">
                  <div>
                    <span className="font-medium">PoliticsMap</span> — An election analysis and visualization tool
                  </div>
                  <div className="flex items-center gap-4">
                    <a href="/about" className="hover:text-surface-700 dark:hover:text-surface-200 transition-colors">
                      About
                    </a>
                    <a href="/coverage" className="hover:text-surface-700 dark:hover:text-surface-200 transition-colors">
                      Data Sources
                    </a>
                    <span className="text-surface-300 dark:text-surface-600">|</span>
                    <span>Not affiliated with any campaign or party</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
