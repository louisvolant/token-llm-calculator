// frontend/src/lib/links.ts
export interface LinkItem {
  label: string;
  href: string;
}

// You can add internal links here if needed, but for now, we'll just use external
// export const internalLinks: LinkItem[] = [
//   { label: 'Home', href: '/' },
// ];

// Footer links. Kept intentionally short so the footer fits on a single line.
export const externalLinks: LinkItem[] = [
  { label: 'Personal Page', href: 'https://www.louisvolant.com' },
  { label: 'Portfolio', href: 'https://www.louisvolant.com/portfolio' },
];
