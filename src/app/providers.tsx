'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { ToastProvider } from '@/components/ui/Toast';

function DarkModeSync() {
  const darkMode = useStore((state) => state.settings.darkMode);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return null;
}

function HydrationGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center shadow-sm mx-auto mb-3">
            <span className="text-white font-bold text-sm">PM</span>
          </div>
          <div className="text-surface-500 text-sm">Loading PoliticsMap...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DarkModeSync />
      <HydrationGate>{children}</HydrationGate>
    </ToastProvider>
  );
}
