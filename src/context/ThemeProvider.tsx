// frontend/src/context/ThemeProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme ? savedTheme === 'dark' : prefersDark;
      document.documentElement.classList.toggle('dark', initialTheme);
      return initialTheme;
    }
    return false;
  });

  useEffect(() => {
    // Apply class on mount for client-side hydration
    document.documentElement.classList.toggle('dark', darkMode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      localStorage.setItem('theme', newMode ? 'dark' : 'light'); // Writes to local storage
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}