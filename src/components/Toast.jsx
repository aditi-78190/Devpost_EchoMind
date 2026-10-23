import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };
export default function Toast({ toasts }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => { const I = ICONS[t.type] || Info; return <div key={t.id} className={`toast ${t.type}`}><I size={18} />{t.message}</div>; })}
    </div>
  );
}
