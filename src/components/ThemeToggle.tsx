// frontend/src/components/ThemeToggle.tsx
"use client";

import { useTheme } from "@/context/ThemeProvider"; // Use your custom useTheme
import { useLanguage } from "@/context/LanguageContext"; // Use your custom useLanguage
import { useSyncExternalStore } from "react"; // Keep useState and useState for mounted state

export function ThemeToggle() {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const { darkMode, toggleDarkMode } = useTheme(); // Now using your custom useTheme
  const { t } = useLanguage();

  if (!mounted) {
    return null; // Don't render until mounted to prevent hydration mismatches
  }

  return (
    <button
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      onClick={toggleDarkMode} // Call the toggleDarkMode from your custom hook
      aria-label={t('toggle_dark_mode')}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
}