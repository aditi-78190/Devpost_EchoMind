import { useCallback, useEffect, useRef, useState } from 'react';
import { Star, Pencil, Trash2, Bell } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import MemoryForm from './components/MemoryForm.jsx';
import ConfirmDialog, { Modal } from './components/ConfirmDialog.jsx';
import Toast from './components/Toast.jsx';
import { fmt } from './components/MemoryCard.jsx';
import AskEchoMind from './components/AskEchoMind.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MemoryList from './pages/MemoryList.jsx';
import Settings from './pages/Settings.jsx';
import { useMemories } from './hooks/useMemories.js';
import { useTheme } from './hooks/useTheme.js';

const notifSupport = () => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);

export default function App() {
  const store = useMemories();
  const { memories } = store;
  const [theme, toggleTheme] = useTheme();
  const [view, setView] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [menu, setMenu] = useState(false);
  const [form, setForm] = useState(null); // { memory? }
  const [detailId, setDetailId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifPerm, setNotifPerm] = useState(notifSupport);
  const alerted = useRef(new Set());

  const notify = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  useEffect(() => { if (store.storageError) notify('Could not save to browser storage. Export a backup so you don’t lose changes.', 'error'); }, [store.storageError, notify]);

  // Alerts only while the app is open and the user has granted permission.
  useEffect(() => {
    if (notifPerm !== 'granted') return undefined;
    const check = () => memories.forEach((m) => {
      const t = Date.parse(m.reminder);
      if (m.reminder && t <= Date.now() && Date.now() - t < 3600000 && !alerted.current.has(m.id + m.reminder)) {
        alerted.current.add(m.id + m.reminder);
        try { new Notification('EchoMind reminder', { body: m.title }); } catch { /* ignore */ }
      }
    });
    check();
    const i = setInterval(check, 30000);
    return () => clearInterval(i);
  }, [memories, notifPerm]);

  const navigate = (v) => { setView(v); setMenu(false); if (v !== 'all') setQuery(''); window.scrollTo(0, 0); };
  const onQuery = (q) => { setQuery(q); if (q && !['all', 'favorites', 'recent', 'categories'].includes(view)) setView('all'); };

  const save = (data) => {
    if (form.memory) { store.update(form.memory, data); notify('Memory updated.', 'success'); }
    else { store.add(data); notify('Memory saved.', 'success'); }
    setForm(null);
  };
  const askDelete = (m) => setConfirm({ title: 'Delete this memory?', message: `“${m.title}” will be permanently deleted.`, confirmLabel: 'Delete', onConfirm: () => { store.remove(m.id); if (detailId === m.id) setDetailId(null); notify('Memory deleted.', 'success'); } });
  const actions = { ...store, open: (m) => setDetailId(m.id), edit: (m) => setForm({ memory: m }), askDelete, toggleFavorite: (id) => { store.toggleFavorite(id); } };
  const detail = memories.find((m) => m.id === detailId);
  const listMode = ['all', 'favorites', 'recent', 'categories'].includes(view);

  return (
    <div className="app">
      <Sidebar view={view} onNavigate={navigate} onNew={() => { setMenu(false); setForm({}); }} open={menu} onClose={() => setMenu(false)} />
      <div className="main">
        <Header query={query} onQuery={onQuery} onAsk={() => navigate('ask')} theme={theme} onTheme={toggleTheme} onMenu={() => setMenu(true)} />
        <main>
          {view === 'dashboard' && <Dashboard memories={memories} actions={actions} onNew={() => setForm({})} onAsk={() => navigate('ask')} onNavigate={navigate} />}
          {listMode && <MemoryList key={view} mode={view} memories={memories} query={query} actions={actions} onNew={() => setForm({})} />}
          {view === 'ask' && <AskEchoMind memories={memories} onOpen={actions.open} />}
          {view === 'settings' && <Settings memories={memories} theme={theme} onTheme={toggleTheme} actions={store} notify={notify} askConfirm={setConfirm} notifPerm={notifPerm}
            onEnableNotif={async () => { try { setNotifPerm(await Notification.requestPermission()); } catch { setNotifPerm('denied'); } }} />}
        </main>
      </div>

      {form && <MemoryForm memory={form.memory} onSubmit={save} onClose={() => setForm(null)} />}
      {detail && !form && (
        <Modal title={detail.title} onClose={() => setDetailId(null)} wide>
          <div className="detail">
            <div className="card-top"><span className={`badge cat-${detail.category.toLowerCase()}`}>{detail.category}</span>{detail.demo && <span className="badge demo">Demo</span>}</div>
            <p className="detail-body">{detail.content}</p>
            {detail.tags.length > 0 && <div className="tags">{detail.tags.map((t) => <span key={t} className="tag">#{t}</span>)}</div>}
            {detail.reminder && <p className="rem"><Bell size={14} />Reminder: {fmt(detail.reminder)}</p>}
            <p className="muted small-t">Created {fmt(detail.createdAt)} · Updated {fmt(detail.updatedAt)}</p>
          </div>
          <div className="actions">
            <button className="btn" onClick={() => store.toggleFavorite(detail.id)}><Star size={16} fill={detail.favorite ? 'currentColor' : 'none'} />{detail.favorite ? 'Unfavorite' : 'Favorite'}</button>
            <button className="btn" onClick={() => { setForm({ memory: detail }); }}><Pencil size={16} />Edit</button>
            <button className="btn danger" onClick={() => askDelete(detail)}><Trash2 size={16} />Delete</button>
          </div>
        </Modal>
      )}
      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} />}
      <Toast toasts={toasts} />
    </div>
  );
}
