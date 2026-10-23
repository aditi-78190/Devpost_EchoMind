import { normalizeRecord, isValidRecord } from '../utils/validation.js';

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
export const parseTags = (s) => [...new Set(String(s || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];

export function createMemory(form) {
  return normalizeRecord({ ...form, id: uid(), tags: parseTags(form.tags), demo: false });
}
export function updateMemory(old, form) {
  return normalizeRecord({ ...old, ...form, tags: parseTags(form.tags), updatedAt: new Date().toISOString() });
}

export function demoMemories() {
  const day = 86400000;
  const now = Date.now();
  const iso = (d) => new Date(now - d * day).toISOString();
  const local = (d, h) => { const x = new Date(now + d * day); x.setHours(h, 0, 0, 0); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
  const mk = (i, title, content, category, tags, created, extra = {}) =>
    normalizeRecord({ id: `demo-${i}`, title, content, category, tags, createdAt: iso(created), updatedAt: iso(created), demo: true, ...extra });
  return [
    mk(1, 'Project report location', 'The final project report is saved in Google Drive under College > Semester 5 > Final_Report_v3.pdf. The backup copy is on my pen drive.', 'College', ['report', 'drive', 'project'], 1, { favorite: true }),
    mk(2, 'Friday plan', 'Friday: submit the lab file before noon, team sync at 4 PM, then practice the hackathon demo for 1 hour.', 'Personal', ['friday', 'plan', 'schedule'], 2, { reminder: local(2, 9) }),
    mk(3, 'Hackathon project ideas', 'Ideas for the hackathon: a voice-first memory assistant, a study planner that reads the timetable, and an offline-first notes app with smart search.', 'Ideas', ['hackathon', 'ideas', 'project'], 3, { favorite: true }),
    mk(4, 'College tasks this week', 'Finish the DBMS assignment, revise operating systems unit 3, and collect the internship certificate from the office.', 'Tasks', ['college', 'tasks', 'assignment'], 4, { reminder: local(-1, 18) }),
    mk(5, 'Mentor meeting notes', 'Meeting with the mentor: focus on a working end-to-end demo, keep the UI simple, and prepare a 3-minute pitch. Next meeting in two weeks.', 'Meetings', ['meeting', 'mentor', 'pitch'], 5),
    mk(6, 'Hostel locker details', 'Library locker number is 214. The key is kept in the inside pocket of the grey backpack.', 'Personal', ['hostel', 'locker'], 6),
  ];
}

export function exportJSON(list) {
  const payload = { app: 'EchoMind AI', version: 1, exportedAt: new Date().toISOString(), memories: list };
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
}

/** Parses a backup file's text. Throws an Error with a user-friendly message when invalid. */
export function parseImport(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('That file is not valid JSON.'); }
  const arr = Array.isArray(data) ? data : data && Array.isArray(data.memories) ? data.memories : null;
  if (!arr) throw new Error('No memories found. Use a backup exported from EchoMind AI.');
  const valid = arr.filter((m) => isValidRecord(m) && m.title.trim() && m.content.trim()).map(normalizeRecord);
  if (!valid.length) throw new Error('The backup contains no valid memories.');
  return { memories: valid, skipped: arr.length - valid.length };
}
