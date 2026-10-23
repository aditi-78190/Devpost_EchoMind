# EchoMind AI — Your life, remembered intelligently.

A personal memory assistant built with React (hooks) + Vite + plain CSS. Save notes, then retrieve them by keyword search or by asking questions (typed or spoken). No backend and no API keys required.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Features
- Create, view, edit, delete (with confirmation) memories: title, content, category, tags, optional reminder, favorite, created/updated times.
- Search (titles, content, tags), category filter, sort (newest/oldest/title), Favorites, Recently Added, Categories views.
- **Ask EchoMind**: chat-style retrieval over your saved memories with normalization, light stemming, small synonym map, tag/title/category/content scoring. Each answer shows the source note and an "Open memory" button. No match → "I couldn't find a matching saved memory…". It never invents content.
- **Voice** (Web Speech API, Chrome/Edge/Safari): starts only when you press the button; text lands in an editable field. Permission-denied, errors and unsupported browsers are handled; typing always works.
- **Reminders**: stored dates with upcoming/overdue lists. Optional browser notifications (permission requested only from Settings) fire **only while the app is open**. There is no background/push system.
- Settings: light/dark theme, JSON export/import (validated), clear all (confirm), restore/remove demo data, privacy note.
- Accessibility: keyboard navigation, focus trap in dialogs, Escape to close, focus rings, aria labels, reduced-motion support.

## Architecture
```
src/
  components/  Sidebar, Header, MemoryCard, MemoryForm, AskEchoMind, VoiceInput, ConfirmDialog (+Modal), Toast
  pages/       Dashboard, MemoryList (All / Favorites / Recent / Categories), Settings
  services/    memoryService.js (CRUD helpers, demo data, import/export), searchService.js (retrieval)
  hooks/       useMemories, useTheme, useSpeech
  utils/       storage.js (safe localStorage), validation.js
```
`askMemories(memories, question)` in `searchService.js` is the single retrieval entry point. To add semantic/AI search, make it call a **backend** endpoint (keep API keys server-side), return `{ results: [{ memory, excerpt }] }`, and fall back to `searchMemories` on network errors. No AI API is integrated and none is faked.

## Limitations
- Data lives in this browser's localStorage: unencrypted, per-browser, no sync. Export backups.
- Retrieval is keyword-based, not semantic (e.g. "money" will not find "budget").
- Speech recognition depends on browser support (Firefox lacks it); Chrome sends audio to a cloud service.
- Reminders do not alert when the app is closed.
- Chat history is not persisted.

## Future improvements
Semantic search via backend + embeddings, encrypted sync, PWA with push reminders, tag management, attachments.

## Manual testing checklist
- [ ] First launch shows demo memories labelled "Demo"; "Remove demo data" removes them; Settings > Restore brings them back.
- [ ] Add a memory with empty title/content → inline errors; valid → toast and appears on Dashboard/All Memories.
- [ ] Double-click Save → only one memory created.
- [ ] Edit, favorite/unfavorite, delete (confirm + cancel both work).
- [ ] Refresh → everything persists. Clear all → refresh → stays empty.
- [ ] Search bar finds by title, content and tag; category chips and sort work.
- [ ] Favorites and Recently Added pages show correct items; all sidebar links navigate.
- [ ] Ask: "Where did I save my project report?" → "Project report location" with Open button; gibberish → not-found message.
- [ ] Voice (Chrome): dictate into the memory form and the Ask box; deny mic permission → clear message; unsupported browser → note shown.
- [ ] Reminders: past date shows Overdue; future shows Upcoming; Enable alerts only asks after clicking.
- [ ] Export → Import the file; import a non-JSON/invalid file → error message.
- [ ] Theme toggle persists; layout works at ~1280px, ~768px and ~375px; mobile menu opens/closes.
