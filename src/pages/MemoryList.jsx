import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import MemoryCard from '../components/MemoryCard.jsx';
import { CATEGORIES } from '../utils/validation.js';
import { searchMemories } from '../services/searchService.js';

const TITLES = { all: 'All memories', favorites: 'Favorites', recent: 'Recently added', categories: 'Categories' };

export default function MemoryList({ mode, memories, query, actions, onNew }) {
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState(mode === 'recent' ? 'newest' : 'newest');

  const rows = useMemo(() => {
    let list = mode === 'favorites' ? memories.filter((m) => m.favorite) : memories;
    if (category !== 'All') list = list.filter((m) => m.category === category);
    let items;
    if (query.trim()) {
      items = searchMemories(list, query).map((r) => ({ memory: r.memory, excerpt: r.excerpt }));
      if (!items.length) {
        const q = query.trim().toLowerCase(); // substring fallback for partial words
        items = list.filter((m) => `${m.title} ${m.content} ${m.tags.join(' ')}`.toLowerCase().includes(q)).map((memory) => ({ memory }));
      }
    } else {
      const s = [...list].sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt));
      items = (mode === 'recent' ? s.slice(0, 12) : s).map((memory) => ({ memory }));
    }
    return items;
  }, [memories, mode, category, sort, query]);

  const count = (c) => memories.filter((m) => m.category === c).length;
  return (
    <section className="page">
      <div className="page-head">
        <div><h1>{TITLES[mode]}</h1><p className="muted">{rows.length} {rows.length === 1 ? 'memory' : 'memories'}{query.trim() ? ` matching “${query.trim()}”` : ''}</p></div>
        <button className="btn primary" onClick={onNew}><Plus size={17} />New memory</button>
      </div>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filter by category">
          {['All', ...CATEGORIES].map((c) => (
            <button key={c} className={`chip ${category === c ? 'on' : ''}`} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}{c !== 'All' && <small>{count(c)}</small>}</button>
          ))}
        </div>
        <label className="sort">Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)} disabled={!!query.trim()} title={query.trim() ? 'Results are sorted by relevance while searching' : ''}>
            <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="title">Title (A–Z)</option>
          </select>
        </label>
      </div>
      {rows.length ? (
        <div className="grid">{rows.map(({ memory, excerpt }) => <MemoryCard key={memory.id} memory={memory} excerpt={excerpt} onOpen={actions.open} onEdit={actions.edit} onDelete={actions.askDelete} onFavorite={actions.toggleFavorite} />)}</div>
      ) : (
        <div className="card empty">
          <p>{query.trim() ? 'No memories match your search.' : mode === 'favorites' ? 'No favorites yet. Star a memory to pin it here.' : 'Nothing here yet.'}</p>
          {!query.trim() && mode !== 'favorites' && <button className="btn primary" onClick={onNew}>Save a memory</button>}
        </div>
      )}
    </section>
  );
}
