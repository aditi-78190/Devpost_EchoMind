export const CATEGORIES = ['Personal', 'College', 'Projects', 'Ideas', 'Meetings', 'Tasks', 'Other'];

export const isValidRecord = (m) =>
  !!m && typeof m === 'object' && typeof m.id === 'string' && typeof m.title === 'string' && typeof m.content === 'string';

export function normalizeRecord(m) {
  const now = new Date().toISOString();
  const okDate = (d) => d && !Number.isNaN(Date.parse(d));
  return {
    id: m.id,
    title: m.title.trim().slice(0, 120),
    content: m.content.trim(),
    category: CATEGORIES.includes(m.category) ? m.category : 'Other',
    tags: Array.isArray(m.tags) ? m.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 12) : [],
    reminder: okDate(m.reminder) ? m.reminder : '',
    favorite: Boolean(m.favorite),
    demo: Boolean(m.demo),
    createdAt: okDate(m.createdAt) ? m.createdAt : now,
    updatedAt: okDate(m.updatedAt) ? m.updatedAt : now,
  };
}

export function validateMemory(f) {
  const e = {};
  if (!f.title.trim()) e.title = 'Add a title so you can find this later.';
  else if (f.title.trim().length > 120) e.title = 'Keep the title under 120 characters.';
  if (!f.content.trim()) e.content = 'Write what you want to remember.';
  else if (f.content.length > 5000) e.content = 'Keep the memory under 5,000 characters.';
  if (!CATEGORIES.includes(f.category)) e.category = 'Choose a category.';
  if (f.reminder && Number.isNaN(Date.parse(f.reminder))) e.reminder = 'Enter a valid date and time.';
  return e;
}
