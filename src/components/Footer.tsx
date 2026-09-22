// frontend/src/components/Footer.tsx
'use client';

import { Fragment } from 'react';
import { externalLinks } from '@/lib/links';
import { useLanguage } from '@/context/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-800 py-4 mt-auto">
      {/* Single compact row: copyright, external links and theme toggle. */}
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 text-xs text-gray-600 dark:text-gray-300">
        <span className="text-gray-700 dark:text-gray-400">
          {t('footer_copyright', { year: new Date().getFullYear() })}
        </span>
        {externalLinks.map((link) => (
          <Fragment key={link.href}>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            {/* Use native <a> for external links to avoid Next.js prefetching/internal routing */}
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200"
            >
              {link.label}
            </a>
          </Fragment>
        ))}
        <ThemeToggle />
      </div>
    </footer>
  );
}
