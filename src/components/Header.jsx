import { Menu, Search, Sparkles, Sun, Moon } from 'lucide-react';
export default function Header({ query, onQuery, onAsk, theme, onTheme, onMenu }) {
  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
      <label className="search">
        <Search size={17} />
        <input type="search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search titles, notes, tags…" aria-label="Search memories" />
      </label>
      <button className="btn accent" onClick={onAsk}><Sparkles size={16} /><span className="hide-sm">Ask EchoMind</span></button>
      <button className="icon-btn" onClick={onTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
    </header>
  );
}
