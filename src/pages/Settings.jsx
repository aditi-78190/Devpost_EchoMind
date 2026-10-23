import { useRef, useState } from 'react';
import { Download, Upload, Trash2, RotateCcw, Bell, ShieldAlert, Sun, Moon } from 'lucide-react';
import { exportJSON, parseImport } from '../services/memoryService.js';

export default function Settings({ memories, theme, onTheme, actions, notify, askConfirm, notifPerm, onEnableNotif }) {
  const file = useRef(null);
  const [importErr, setImportErr] = useState('');

  const doExport = () => {
    const url = URL.createObjectURL(exportJSON(memories));
    const a = Object.assign(document.createElement('a'), { href: url, download: `echomind-backup-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    notify('Backup downloaded.', 'success');
  };
  const doImport = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setImportErr('');
    try {
      if (f.size > 5_000_000) throw new Error('That file is too large (limit 5 MB).');
      const { memories: list, skipped } = parseImport(await f.text());
      actions.importMemories(list);
      notify(`Imported ${list.length} ${list.length === 1 ? 'memory' : 'memories'}${skipped ? ` (${skipped} skipped)` : ''}.`, 'success');
    } catch (err) { setImportErr(err.message); notify('Import failed.', 'error'); }
  };
  const notifText = notifPerm === 'unsupported' ? 'Not supported in this browser.' : notifPerm === 'granted' ? 'Enabled. Alerts appear only while EchoMind is open in a tab.' : notifPerm === 'denied' ? 'Blocked in your browser settings.' : 'Off.';

  return (
    <section className="page narrow">
      <div className="page-head"><h1>Settings</h1></div>
      <div className="card setting"><div><h3>Theme</h3><p className="muted">Currently {theme}.</p></div><button className="btn" onClick={onTheme}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}Switch to {theme === 'dark' ? 'light' : 'dark'}</button></div>
      <div className="card setting"><div><h3>Reminder alerts</h3><p className="muted">{notifText} Reminders can't alert you when the app is closed.</p></div>
        <button className="btn" disabled={notifPerm !== 'default'} onClick={onEnableNotif}><Bell size={16} />Enable alerts</button></div>
      <div className="card setting"><div><h3>Export backup</h3><p className="muted">Download all {memories.length} memories as a JSON file.</p></div><button className="btn" onClick={doExport}><Download size={16} />Export</button></div>
      <div className="card setting"><div><h3>Import backup</h3><p className="muted">Add memories from an EchoMind JSON backup. Matching IDs are updated.</p>{importErr && <p className="field-err" role="alert">{importErr}</p>}</div>
        <button className="btn" onClick={() => file.current.click()}><Upload size={16} />Import</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={doImport} /></div>
      <div className="card setting"><div><h3>Demo data</h3><p className="muted">Restore the sample memories, or remove them.</p></div>
        <div className="actions tight"><button className="btn" onClick={() => { actions.restoreDemo(); notify('Demo memories restored.', 'success'); }}><RotateCcw size={16} />Restore</button>
          <button className="btn" onClick={() => { actions.removeDemo(); notify('Demo memories removed.', 'success'); }}>Remove</button></div></div>
      <div className="card setting danger-zone"><div><h3>Clear all memories</h3><p className="muted">Permanently deletes everything saved in this browser.</p></div>
        <button className="btn danger" onClick={() => askConfirm({ title: 'Clear all memories?', message: 'This deletes every memory in this browser and cannot be undone. Export a backup first if you might need them.', confirmLabel: 'Clear all', onConfirm: () => { actions.clearAll(); notify('All memories cleared.', 'success'); } })}><Trash2 size={16} />Clear all</button></div>
      <div className="card privacy"><ShieldAlert size={20} /><p>Memories are stored in this browser's localStorage on this device. They are not encrypted, not backed up, and not synced to a cloud. Clearing browser data or switching browsers or devices loses them, so export backups regularly. Anyone with access to this browser profile can read them.</p></div>
    </section>
  );
}
