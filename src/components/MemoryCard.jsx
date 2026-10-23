import { Star, Pencil, Trash2, Bell } from 'lucide-react';
export const fmt = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
export const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });

export default function MemoryCard({ memory: m, excerpt, onOpen, onEdit, onDelete, onFavorite }) {
  const overdue = m.reminder && Date.parse(m.reminder) < Date.now();
  return (
    <article className="card memory">
      <div className="card-top">
        <span className={`badge cat-${m.category.toLowerCase()}`}>{m.category}</span>
        {m.demo && <span className="badge demo">Demo</span>}
        <span className="spacer" />
        <button className={`icon-btn ${m.favorite ? 'fav' : ''}`} onClick={() => onFavorite(m.id)} aria-pressed={m.favorite} aria-label={m.favorite ? `Remove ${m.title} from favorites` : `Add ${m.title} to favorites`}><Star size={17} fill={m.favorite ? 'currentColor' : 'none'} /></button>
      </div>
      <h3><button className="link" onClick={() => onOpen(m)}>{m.title}</button></h3>
      <p className="excerpt">{excerpt ?? (m.content.length > 150 ? `${m.content.slice(0, 150)}…` : m.content)}</p>
      {m.tags.length > 0 && <div className="tags">{m.tags.map((t) => <span key={t} className="tag">#{t}</span>)}</div>}
      <div className="card-foot">
        <span className="muted small-t">{fmtDate(m.createdAt)}</span>
        {m.reminder && <span className={`rem ${overdue ? 'over' : ''}`}><Bell size={13} />{overdue ? 'Overdue · ' : ''}{fmt(m.reminder)}</span>}
        <span className="spacer" />
        {onEdit && <button className="icon-btn" onClick={() => onEdit(m)} aria-label={`Edit ${m.title}`}><Pencil size={16} /></button>}
        {onDelete && <button className="icon-btn" onClick={() => onDelete(m)} aria-label={`Delete ${m.title}`}><Trash2 size={16} /></button>}
      </div>
    </article>
  );
}
