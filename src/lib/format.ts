import { LANG_META, type Lang } from '../../site.config';

/** Persian pages get Persian digits; English pages get Latin ones. */
export function localeNum(n: number, lang: Lang): string {
  return new Intl.NumberFormat(LANG_META[lang].locale, { useGrouping: false }).format(n);
}

export function formatDate(d: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(LANG_META[lang].locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: lang === 'fa' ? 'persian' : 'gregory',
  }).format(d);
}
