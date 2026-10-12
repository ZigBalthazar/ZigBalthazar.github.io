import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { LANGS, SITE, type Lang } from '../../../site.config';
import { ui } from '../../i18n/ui';
import { getNotes, noteHref } from '../../lib/content';

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

export async function GET(context: APIContext) {
  const lang = context.params.lang as Lang;
  const notes = await getNotes(lang);

  return rss({
    title: ui[lang]['site.title'],
    description: ui[lang]['site.tagline'],
    site: context.site ?? SITE.url,
    trailingSlash: true,
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description ?? note.data.subtitle ?? '',
      pubDate: note.data.date,
      link: noteHref(note),
    })),
    customData: `<language>${lang}</language>`,
  });
}
