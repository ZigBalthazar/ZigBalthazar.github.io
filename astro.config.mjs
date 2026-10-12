import { defineConfig } from 'astro/config';
import { satteri, satteriHeadingIdsPlugin } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { SITE } from './site.config.ts';
import { katexPlugin } from './plugins/katex.mjs';
import { headingAnchors } from './plugins/heading-anchors.mjs';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  /** A bare "/" lands on the default language. */
  redirects: { '/': `/${SITE.defaultLang}/` },
  integrations: [
    sitemap({ i18n: { defaultLocale: 'fa', locales: { fa: 'fa-IR', en: 'en-US' } } }),
  ],
  markdown: {
    processor: satteri({
      features: {
        math: true,
        gfm: true,
        smartPunctuation: true,
      },
      hastPlugins: [
        katexPlugin(),
        // Astro appends its own heading-ids plugin after ours, so run one here
        // first to give `headingAnchors` the ids it needs. Astro's pass keeps
        // any id it finds already set.
        satteriHeadingIdsPlugin(),
        headingAnchors(),
      ],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
