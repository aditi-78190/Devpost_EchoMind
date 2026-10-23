import { useEffect, useRef, useState } from 'react';
import { Send, FileText } from 'lucide-react';
import { askMemories } from '../services/searchService.js';
import VoiceInput from './VoiceInput.jsx';
import { fmtDate } from './MemoryCard.jsx';

const SUGGESTIONS = ['Where did I save my project report?', 'What did I plan for Friday?', 'Show my ideas about my hackathon project', 'Find the note about my meeting'];
const NONE = "I couldn't find a matching saved memory. Try different keywords or save the information first.";

export default function AskEchoMind({ memories, onOpen }) {
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, busy]);

  const ask = async (text) => {
    const question = text.trim();
    if (!question || busy) return;
    setQ(''); setBusy(true);
    setMsgs((m) => [...m, { role: 'user', text: question }]);
    try {
      const { results } = await askMemories(memories, question);
      setMsgs((m) => [...m, { role: 'bot', results }]);
    } catch {
      setMsgs((m) => [...m, { role: 'bot', error: true }]);
    } finally { setBusy(false); }
  };

  return (
    <section className="page ask">
      <div className="page-head"><div><h1>Ask EchoMind</h1><p className="muted">Answers come only from memories saved in this browser. Search runs locally; nothing is sent anywhere.</p></div></div>
      <div className="chat card" aria-live="polite">
        {!msgs.length && (
          <div className="empty">
            <p>Ask about something you saved.</p>
            <div className="chips">{SUGGESTIONS.map((s) => <button key={s} className="chip" onClick={() => ask(s)}>{s}</button>)}</div>
          </div>
        )}
        {msgs.map((m, i) => m.role === 'user' ? (
          <div key={i} className="bubble user">{m.text}</div>
        ) : (
          <div key={i} className="bubble bot">
            {m.error ? 'Something went wrong while searching. Try again.' : !m.results.length ? NONE : (
              <>
                <p>I found {m.results.length} saved {m.results.length === 1 ? 'memory' : 'memories'} that may answer this:</p>
                {m.results.map(({ memory: x, excerpt }, k) => (
                  <div key={x.id} className="source">
                    <div className="source-top"><FileText size={14} /><span className="muted small-t">{k === 0 ? 'Best match · ' : ''}From your note “{x.title}”</span></div>
                    <p className="excerpt">{excerpt}</p>
                    <div className="card-foot"><span className={`badge cat-${x.category.toLowerCase()}`}>{x.category}</span><span className="muted small-t">{fmtDate(x.createdAt)}</span><span className="spacer" /><button className="btn small" onClick={() => onOpen(x)}>Open memory</button></div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
        {busy && <div className="bubble bot muted">Searching your memories…</div>}
        <div ref={end} />
      </div>
      <form className="ask-form" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type or dictate a question, then press Send" aria-label="Your question" />
        <button className="btn primary" type="submit" disabled={busy || !q.trim()}><Send size={16} />Send</button>
      </form>
      <VoiceInput onText={(t) => setQ((p) => (p ? `${p} ${t}` : t))} label="Speak question" />
    </section>
  );
}
