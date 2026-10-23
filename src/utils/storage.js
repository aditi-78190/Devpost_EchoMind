import { isValidRecord, normalizeRecord } from './validation.js';
const KEY = 'echomind.memories.v1';
const THEME = 'echomind.theme';

/** Returns an array, or null when nothing (or unreadable data) is stored. */
export function loadMemories() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isValidRecord).map(normalizeRecord) : null;
  } catch {
    return null;
  }
}
export function saveMemories(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch { return false; }
}
export function loadTheme() {
  try { return localStorage.getItem(THEME) || 'dark'; } catch { return 'dark'; }
}
export function saveTheme(t) {
  try { localStorage.setItem(THEME, t); } catch { /* storage unavailable */ }
}
