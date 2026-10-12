/**
 * The one file you edit to make this blog yours.
 * Everything else reads from here.
 */
export const SITE = {
  /** Used for canonical URLs, sitemap and RSS. */
  url: 'https://zigbalthazar.github.io',
  /** Which language a bare visit to "/" lands on. */
  defaultLang: 'en' as const,
  author: 'Pouya Alizadeh',
  /** Shown in the footer; set any entry to null to hide it. */
  links: {
    github: 'https://github.com/ZigBalthazar',
    linkedin: 'https://www.linkedin.com/in/pouya-alizadeh/',
  },
};

export const LANGS = ['en', 'fa'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_META: Record<Lang, { dir: 'rtl' | 'ltr'; label: string; locale: string }> = {
  en: { dir: 'ltr', label: 'English', locale: 'en-US' },
  fa: { dir: 'rtl', label: 'فارسی', locale: 'fa-IR' },
};
