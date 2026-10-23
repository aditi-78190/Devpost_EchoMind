import { Brain, Star, Folder, Plus, Sparkles, Bell, AlertTriangle } from 'lucide-react';
import MemoryCard, { fmt } from '../components/MemoryCard.jsx';

const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

export default function Dashboard({ memories, actions, onNew, onAsk, onNavigate }) {
  const recent = [...memories].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const withRem = memories.filter((m) => m.reminder).sort((a, b) => a.reminder.localeCompare(b.reminder));
  const now = Date.now();
  const overdue = withRem.filter((m) => Date.parse(m.reminder) < now);
  const upcoming = withRem.filter((m) => Date.parse(m.reminder) >= now);
  const stats = [
    { label: 'Memories saved', value: memories.length, icon: Brain, to: 'all' },
    { label: 'Favorites', value: memories.filter((m) => m.favorite).length, icon: Star, to: 'favorites' },
    { label: 'Categories in use', value: new Set(memories.map((m) => m.category)).size, icon: Folder, to: 'categories' },
  ];
  const hasDemo = memories.some((m) => m.demo);
  return (
    <section className="page">
      <div className="hero">
        <div><h1>{greet()}. What should we remember today?</h1><p className="muted">Save a note, or ask a question and EchoMind will search what you've saved.</p></div>
        <div className="hero-actions"><button className="btn primary" onClick={onNew}><Plus size={17} />Save a memory</button><button className="btn" onClick={onAsk}><Sparkles size={17} />Ask a question</button></div>
      </div>
      {hasDemo && (
        <div className="banner">Some memories are demo data so you can explore. <button className="link" onClick={actions.removeDemo}>Remove demo data</button></div>
      )}
      <div className="stats">
        {stats.map(({ label, value, icon: I, to }) => (
          <button key={label} className="card stat" onClick={() => onNavigate(to)}><I size={20} /><strong>{value}</strong><span>{label}</span></button>
        ))}
      </div>
      <div className="two-col">
        <div>
          <div className="row-between"><h2>Recently added</h2><button className="link" onClick={() => onNavigate('recent')}>View all</button></div>
          {recent.length ? <div className="list">{recent.map((m) => <MemoryCard key={m.id} memory={m} onOpen={actions.open} onFavorite={actions.toggleFavorite} />)}</div>
            : <div className="card empty"><p>No memories yet.</p><button className="btn primary" onClick={onNew}>Save your first memory</button></div>}
        </div>
        <div>
          <h2>Reminders</h2>
          <div className="card rem-card">
            {!withRem.length && <p className="muted">No reminders. Add a date and time to any memory.</p>}
            {overdue.length > 0 && <h4 className="over"><AlertTriangle size={15} />Overdue</h4>}
            {overdue.map((m) => <button key={m.id} className="rem-item over" onClick={() => actions.open(m)}>{m.title}<small>{fmt(m.reminder)}</small></button>)}
            {upcoming.length > 0 && <h4><Bell size={15} />Upcoming</h4>}
            {upcoming.slice(0, 5).map((m) => <button key={m.id} className="rem-item" onClick={() => actions.open(m)}>{m.title}<small>{fmt(m.reminder)}</small></button>)}
            <p className="muted small-t">Reminders are stored dates shown here. Browser alerts only fire while EchoMind is open, and only if you enable them in Settings.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
