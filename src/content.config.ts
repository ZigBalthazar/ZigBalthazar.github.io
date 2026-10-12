import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { LANGS } from '../site.config';

const lang = z.enum(LANGS);

/**
 * A note = one Markdown file in src/content/notes/<lang>/<topic>/<slug>.md
 * Topic folder is optional: src/content/notes/<lang>/<slug>.md is a standalone note.
 */
const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    /** One-line summary. Shown in listings and as the page meta description. */
    description: z.string().optional(),
    /** Larger subtitle under the H1 on the note page. */
    subtitle: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /** Position inside an ordered topic. Omit for standalone notes in a topic. */
    order: z.number().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Override the URL segment; defaults to the filename. ("slug" is reserved by Astro.) */
    permalink: z.string().optional(),
    /** Link this note to its translation in the other language (same value on both). */
    translationKey: z.string().optional(),
  }),
});

/**
 * A topic = src/content/topics/<lang>/<topic-id>.md
 * The Markdown body becomes the "about this series" text.
 */
const topics = defineCollection({
  loader: glob({ base: './src/content/topics', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    /** true -> rendered as a numbered series meant to be read front to back. */
    ordered: z.boolean().default(false),
    /** Sort position on the home page. Lower comes first. */
    weight: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

export const collections = { notes, topics };
export { lang };
