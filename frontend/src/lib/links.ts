// frontend/src/lib/links.ts
export interface LinkItem {
  label: string;
  href: string;
}

// You can add internal links here if needed, but for now, we'll just use external
// export const internalLinks: LinkItem[] = [
//   { label: 'Home', href: '/' },
// ];

export const externalLinks: LinkItem[] = [
  { label: 'Personal Page', href: 'https://www.louisvolant.com' },
  { label: 'Password Keeper', href: 'https://www.securaised.net' },
  { label: 'MP3 Tool', href: 'https://mp3-tool.louisvolant.com' },
  { label: 'Skipass Checker', href: 'https://skipass-earlybird-checker.louisvolant.com' },
  { label: 'Build My CV', href: 'https://buildmycv.net' },
  { label: 'My 20 years old blog', href: 'https://www.abricocotier.fr' },
];