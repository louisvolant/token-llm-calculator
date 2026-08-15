// frontend/src/context/LanguageContext.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';

interface LanguageContextType {
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Simple placeholder translation function for now
  const t = (key: string, variables?: Record<string, string | number>): string => {
    let translatedString = key; // Default to key if not found

    switch (key) {
      case 'footer_copyright':
        translatedString = `© ${variables?.year || new Date().getFullYear()} Tokenizors.net. All rights reserved.`;
        break;
      case 'toggle_dark_mode':
        translatedString = 'Toggle Dark Mode';
        break;
      // Add more translations as needed
    }
    return translatedString;
  };

  return (
    <LanguageContext.Provider value={{ t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}