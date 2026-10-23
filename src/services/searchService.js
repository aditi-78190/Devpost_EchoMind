// Local retrieval engine. Replace `askMemories` with a backend/AI call later; keep the same return shape:
// { results: [{ memory, score, excerpt, matched }], source }
const STOP = new Set(('a an the i my me of to for in on at is are was were do did does what where when which who how show find get about ' +
  'note notes saved save have had that this with and or it its from any all tell give list there their into please can could').split(' '));
const SYNONYMS = { doc: 'document', docs: 'document', todo: 'task', agenda: 'plan', schedule: 'plan', brainstorm: 'idea', homework: 'assignment' };

const stem = (w) => {
  if (w.length > 3) w = w.replace(/s$/, '');
  if (w.length > 5) w = w.replace(/(ing|ed)$/, '');
  return SYNONYMS[w] || w;
};
export const tokenize = (s) =>
  String(s || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)).map(stem);

function excerptFor(text, tokens) {
  const lower = text.toLowerCase();
  let idx = -1;
  for (const t of tokens) { const i = lower.indexOf(t.slice(0, Math.max(3, t.length - 1))); if (i !== -1 && (idx === -1 || i < idx)) idx = i; }
  if (idx === -1) return text.slice(0, 160) + (text.length > 160 ? '…' : '');
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, idx + 130);
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

export function searchMemories(memories, query, limit = 50) {
  const tokens = [...new Set(tokenize(query))];
  if (!tokens.length) return [];
  const out = [];
  for (const memory of memories) {
    const title = tokenize(memory.title);
    const content = tokenize(memory.content);
    const tags = memory.tags.flatMap(tokenize);
    const cat = tokenize(memory.category);
    let score = 0;
    const matched = [];
    for (const t of tokens) {
      let s = 0;
      if (title.includes(t)) s += 5;
      else if (t.length > 3 && title.some((w) => w.startsWith(t))) s += 2;
      if (tags.includes(t)) s += 4;
      if (cat.includes(t)) s += 3;
      const n = content.filter((w) => w === t).length;
      if (n) s += Math.min(n, 3) * 2;
      else if (t.length > 3 && content.some((w) => w.startsWith(t))) s += 1;
      if (s) matched.push(t);
      score += s;
    }
    if (!score) continue;
    score += (matched.length / tokens.length) * 4;
    out.push({ memory, score, matched, excerpt: excerptFor(memory.content, matched) });
  }
  return out.sort((a, b) => b.score - a.score || b.memory.updatedAt.localeCompare(a.memory.updatedAt)).slice(0, limit);
}

export async function askMemories(memories, question) {
  return { results: searchMemories(memories, question, 5), source: 'local' };
}
