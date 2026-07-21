// src/components/ThemeToggle.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <aside className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
      <button
        onClick={() => setIsDark(!isDark)}
        aria-label="Toggle Theme"
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200/80 bg-white/90 text-zinc-800 shadow-xl backdrop-blur-md transition-all hover:scale-105 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-100 dark:shadow-black/40"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-amber-400 transition-transform rotate-0 hover:rotate-90" />
        ) : (
          <Moon className="h-5 w-5 text-zinc-700 transition-transform hover:-rotate-12" />
        )}
      </button>
    </aside>
  );
}