#!/usr/bin/env node
/**
 * Scaffold a new note. Interactive, no flags to memorise:
 *     pnpm new
 * Or go straight there:
 *     pnpm new -- --lang fa --topic complex-numbers --title "عنوان"
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { mkdir, writeFile, access, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOTES = join(root, 'src/content/notes');
const TOPICS = join(root, 'src/content/topics');

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

/** Keeps Persian letters, strips what a URL shouldn't carry. */
function slugify(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

const exists = (p) => access(p).then(() => true, () => false);

async function listTopics(lang) {
  const dir = join(TOPICS, lang);
  if (!(await exists(dir))) return [];
  return (await readdir(dir)).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.mdx?$/, ''));
}

/** Next free `order` in an ordered topic, so series numbering just works. */
async function nextOrder(lang, topic) {
  const dir = join(NOTES, lang, topic);
  if (!(await exists(dir))) return 1;
  const files = (await readdir(dir)).filter((f) => /\.mdx?$/.test(f));
  let max = 0;
  for (const f of files) {
    const { readFile } = await import('node:fs/promises');
    const text = await readFile(join(dir, f), 'utf8');
    const m = text.match(/^order:\s*(\d+)\s*$/m);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

const rl = createInterface({ input: stdin, output: stdout });
const ask = async (q, fallback = '') => {
  const a = (await rl.question(fallback ? `${q} (${fallback}) ` : `${q} `)).trim();
  return a || fallback;
};

try {
  const lang = arg('lang') ?? (await ask('Language — fa or en?', 'fa'));
  if (!['fa', 'en'].includes(lang)) throw new Error(`Unknown language: ${lang}`);

  const available = await listTopics(lang);
  if (!arg('topic') && available.length) {
    console.log(`\nTopics in "${lang}": ${available.join(', ')}`);
    console.log('(leave blank for a standalone note with no topic)\n');
  }
  const topic = arg('topic') ?? (await ask('Topic?', ''));
  if (topic && !available.includes(topic)) {
    console.log(`\n⚠  No topic file at src/content/topics/${lang}/${topic}.md — create it so the topic appears on the home page.\n`);
  }

  const title = arg('title') ?? (await ask('Title?'));
  if (!title) throw new Error('A title is required.');

  const slug = arg('slug') ?? (await ask('URL slug?', slugify(title)));
  const order = topic ? await nextOrder(lang, topic) : null;

  const dir = topic ? join(NOTES, lang, topic) : join(NOTES, lang);
  const file = join(dir, `${slug}.md`);
  if (await exists(file)) throw new Error(`Already exists: ${file}`);

  const today = new Date().toISOString().slice(0, 10);
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    'subtitle: ""',
    'description: ""',
    `date: ${today}`,
    ...(order !== null ? [`order: ${order}`] : []),
    'tags: []',
    'draft: true',
    `# permalink: ${slug}   # optional: override the URL segment`,
    `# translationKey: ${slug}   # set the SAME value on the other language's version to link them`,
    '---',
    '',
    lang === 'fa' ? 'اینجا بنویسید.' : 'Write here.',
    '',
  ].join('\n');

  await mkdir(dir, { recursive: true });
  await writeFile(file, frontmatter, 'utf8');

  const url = topic ? `/${lang}/${topic}/${slug}/` : `/${lang}/${slug}/`;
  console.log(`\n✓ ${file.replace(root + '/', '')}`);
  console.log(`  → ${url}`);
  console.log(`\n  It is marked draft: true — visible in \`pnpm dev\`, skipped in \`pnpm build\`.`);
  console.log(`  Remove that line when you're ready to publish.\n`);
} catch (err) {
  console.error(`\n✗ ${err.message}\n`);
  process.exitCode = 1;
} finally {
  rl.close();
}
