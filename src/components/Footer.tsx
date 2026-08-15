// frontend/src/components/Footer.tsx
'use client';

import Link from 'next/link';
import { externalLinks } from '@/lib/links';
import { useLanguage } from '@/context/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-800 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">

        {/* External links */}
        <div className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          {externalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright and Theme Toggle */}
        <div className="mt-4 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
          <span className="text-gray-700 dark:text-gray-400">
            {t('footer_copyright', { year: new Date().getFullYear() })}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}