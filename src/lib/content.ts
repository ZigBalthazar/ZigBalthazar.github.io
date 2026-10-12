import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../../site.config';

export type Note = CollectionEntry<'notes'>;
export type Topic = CollectionEntry<'topics'>;

const isProd = import.meta.env.PROD;

/** Entry ids look like "fa/complex-numbers/introduction" or "en/some-note". */
function parseId(id: string) {
  const [lang, ...rest] = id.split('/');
  const file = rest.pop()!;
  const topicId = rest.length ? rest.join('/') : null;
  return { lang: lang as Lang, topicId, file };
}

/** Public URL for a note, e.g. /fa/complex-numbers/introduction/ */
export function noteHref(note: Note): string {
  const { lang, topicId } = parseId(note.id);
  const slug = note.data.permalink ?? parseId(note.id).file;
  return topicId ? `/${lang}/${topicId}/${slug}/` : `/${lang}/${slug}/`;
}

export function topicHref(topic: Topic): string {
  const { lang, file } = parseId(topic.id);
  return `/${lang}/${file}/`;
}

export function langOf(entry: Note | Topic): Lang {
  return parseId(entry.id).lang;
}

export function topicIdOf(note: Note): string | null {
  return parseId(note.id).topicId;
}

/** All non-draft notes for a language, newest first. Drafts show up in dev only. */
export async function getNotes(lang: Lang): Promise<Note[]> {
  const all = await getCollection('notes', (n) => {
    if (parseId(n.id).lang !== lang) return false;
    return isProd ? !n.data.draft : true;
  });
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getTopics(lang: Lang): Promise<Topic[]> {
  const all = await getCollection('topics', (t) => {
    if (parseId(t.id).lang !== lang) return false;
    return isProd ? !t.data.draft : true;
  });
  return all.sort((a, b) => a.data.weight - b.data.weight);
}

export type TopicGroup = {
  topic: Topic;
  id: string;
  notes: Note[];
};

/**
 * Notes inside an ordered topic sort by `order`; inside an unordered topic they
 * sort oldest-first so a topic page reads like it was written.
 */
function sortWithin(topic: Topic, notes: Note[]): Note[] {
  if (topic.data.ordered) {
    return [...notes].sort((a, b) => (a.data.order ?? 1e9) - (b.data.order ?? 1e9));
  }
  return [...notes].sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

/** The home page's backbone: every topic with its notes attached. */
export async function getTopicGroups(lang: Lang): Promise<TopicGroup[]> {
  const [topics, notes] = await Promise.all([getTopics(lang), getNotes(lang)]);
  return topics
    .map((topic) => {
      const id = parseId(topic.id).file;
      const own = notes.filter((n) => topicIdOf(n) === id);
      return { topic, id, notes: sortWithin(topic, own) };
    })
    .filter((g) => g.notes.length > 0);
}

/** Notes that live directly under the language folder, with no topic. */
export async function getStandaloneNotes(lang: Lang): Promise<Note[]> {
  const notes = await getNotes(lang);
  return notes.filter((n) => topicIdOf(n) === null);
}

/** Previous/next within the same ordered topic, for the footer nav on a note. */
export async function getSeriesContext(note: Note) {
  const topicId = topicIdOf(note);
  if (!topicId) return null;
  const lang = langOf(note);
  const groups = await getTopicGroups(lang);
  const group = groups.find((g) => g.id === topicId);
  if (!group || !group.topic.data.ordered) return null;
  const index = group.notes.findIndex((n) => n.id === note.id);
  if (index === -1) return null;
  return {
    topic: group.topic,
    topicId,
    index: index + 1,
    total: group.notes.length,
    prev: group.notes[index - 1] ?? null,
    next: group.notes[index + 1] ?? null,
    siblings: group.notes,
  };
}

/** The sidebar index: every topic and note for a language, in reading order. */
export async function getSidebar(lang: Lang) {
  const [groups, loose] = await Promise.all([getTopicGroups(lang), getStandaloneNotes(lang)]);
  return { groups, loose };
}

/**
 * Finds the same note in the other language via `translationKey`, so the
 * language switcher lands on the translation instead of the home page.
 */
export async function getTranslation(note: Note, target: Lang): Promise<Note | null> {
  const key = note.data.translationKey;
  if (!key) return null;
  const candidates = await getNotes(target);
  return candidates.find((n) => n.data.translationKey === key) ?? null;
}
