import { useRef, useState } from 'react';
import { CATEGORIES, validateMemory } from '../utils/validation.js';
import VoiceInput from './VoiceInput.jsx';
import { Modal } from './ConfirmDialog.jsx';

const blank = { title: '', content: '', category: 'Personal', tags: '', reminder: '', favorite: false };

export default function MemoryForm({ memory, onSubmit, onClose }) {
  const [f, setF] = useState(memory ? { ...memory, tags: memory.tags.join(', ') } : blank);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (lock.current) return;
    const errs = validateMemory(f);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    lock.current = true; setBusy(true);
    onSubmit(f);
  };
  const err = (k) => errors[k] && <span className="field-err" id={`err-${k}`} role="alert">{errors[k]}</span>;

  return (
    <Modal title={memory ? 'Edit memory' : 'New memory'} onClose={onClose} wide>
      <form onSubmit={submit} noValidate className="form">
        <label>Title
          <input value={f.title} onChange={set('title')} maxLength={130} aria-invalid={!!errors.title} aria-describedby="err-title" placeholder="e.g. Project report location" />
          {err('title')}
        </label>
        <label>
          <span className="row-between">Memory <VoiceInput onText={(t) => setF((p) => ({ ...p, content: p.content ? `${p.content} ${t}` : t }))} /></span>
          <textarea rows={5} value={f.content} onChange={set('content')} aria-invalid={!!errors.content} aria-describedby="err-content" placeholder="What do you want to remember? Dictated text appears here so you can edit it." />
          {err('content')}
        </label>
        <div className="grid2">
          <label>Category
            <select value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label>Reminder (optional)
            <input type="datetime-local" value={f.reminder} onChange={set('reminder')} aria-invalid={!!errors.reminder} aria-describedby="err-reminder" />
            {err('reminder')}
          </label>
        </div>
        <label>Tags (comma separated)
          <input value={f.tags} onChange={set('tags')} placeholder="report, drive, project" />
        </label>
        <label className="check"><input type="checkbox" checked={f.favorite} onChange={set('favorite')} />Mark as favorite</label>
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={busy}>{memory ? 'Save changes' : 'Save memory'}</button>
        </div>
      </form>
    </Modal>
  );
}
