import type { Lang } from '../../site.config';

/** Every piece of chrome text on the site. Add a key here, use t('key') anywhere. */
export const ui = {
  fa: {
    'site.title': 'پویا علیزاده',
    'site.tagline': 'یادداشت‌هایی دربارهٔ بک‌اند، سیستم‌های توزیع‌شده و پروتکل‌های باز',
    'nav.notes': 'برگه‌ها',
    'nav.about': 'درباره',
    'nav.index': 'فهرست',
    'home.topics': 'موضوع',
    'home.topics.one': 'موضوع',
    'home.notes': 'برگه',
    'home.notes.one': 'برگه',
    'home.otherTopics': 'موضوع‌های دیگر',
    'home.looseNotes': 'یادداشت‌های تکی',
    'home.readInOrder': 'به ترتیب بخوانید',
    'home.startFirst': 'از برگهٔ یکم شروع کنید',
    'note.series': 'برگهٔ {n} از {total}',
    'note.prev': 'برگهٔ پیشین',
    'note.next': 'برگهٔ بعدی',
    'note.updated': 'آخرین ویرایش',
    'note.toc': 'در این برگه',
    'note.draft': 'پیش‌نویس',
    'theme.toggle': 'تغییر تم',
    'lang.switch': 'English',
    'rss': 'خوراک RSS',
    'notFound.title': 'این برگه پیدا نشد',
    'notFound.body': 'شاید نشانی را اشتباه وارد کرده‌اید، یا این برگه جابه‌جا شده است.',
    'notFound.home': 'بازگشت به خانه',
  },
  en: {
    'site.title': 'Pouya Alizadeh',
    'site.tagline': 'Notes on backend engineering, distributed systems and open protocols',
    'nav.notes': 'Notes',
    'nav.about': 'About',
    'nav.index': 'Index',
    'home.topics': 'topics',
    'home.topics.one': 'topic',
    'home.notes': 'notes',
    'home.notes.one': 'note',
    'home.otherTopics': 'Other topics',
    'home.looseNotes': 'Standalone notes',
    'home.readInOrder': 'Read in order',
    'home.startFirst': 'Start from the first note',
    'note.series': 'Note {n} of {total}',
    'note.prev': 'Previous',
    'note.next': 'Next',
    'note.updated': 'Last updated',
    'note.toc': 'On this page',
    'note.draft': 'Draft',
    'theme.toggle': 'Toggle theme',
    'lang.switch': 'فارسی',
    'rss': 'RSS feed',
    'notFound.title': 'Page not found',
    'notFound.body': 'The address may be wrong, or this note has moved.',
    'notFound.home': 'Back home',
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];

/** Picks the singular form when n === 1: plural('home.notes', 1) -> "note". */
export function plural(lang: Lang, key: 'home.notes' | 'home.topics', n: number): string {
  const t = useTranslations(lang);
  return n === 1 ? t(`${key}.one` as UIKey) : t(key);
}

/** t('note.series', { n: 2, total: 9 }) -> "Note 2 of 9" */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey, vars?: Record<string, string | number>): string {
    let s: string = ui[lang][key] ?? ui.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}
