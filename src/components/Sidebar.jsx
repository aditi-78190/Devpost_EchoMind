import { LayoutDashboard, Brain, Star, Folder, Clock, Settings, Plus, Sparkles } from 'lucide-react';
export const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'all', label: 'All Memories', icon: Brain },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'categories', label: 'Categories', icon: Folder },
  { id: 'recent', label: 'Recently Added', icon: Clock },
  { id: 'ask', label: 'Ask EchoMind', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];
export default function Sidebar({ view, onNavigate, onNew, open, onClose }) {
  return (
    <>
      {open && <div className="scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="brand"><span className="logo"><Brain size={20} /></span><span>EchoMind <b>AI</b></span></div>
        <button className="btn primary block" onClick={onNew}><Plus size={18} />New memory</button>
        <nav>
          {NAV.map(({ id, label, icon: I }) => (
            <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} aria-current={view === id ? 'page' : undefined} onClick={() => onNavigate(id)}>
              <I size={18} />{label}
            </button>
          ))}
        </nav>
        <p className="side-foot">Your life, remembered intelligently.</p>
      </aside>
    </>
  );
}
