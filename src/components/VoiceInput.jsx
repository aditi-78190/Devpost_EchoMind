import { Mic, Square } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech.js';

/** Calls onText(text) with recognized speech. The parent puts it in an editable field. */
export default function VoiceInput({ onText, label = 'Dictate' }) {
  const { supported, listening, interim, error, start, stop } = useSpeech(onText);
  if (!supported) return <span className="voice-note">Voice input isn't supported in this browser. Type instead.</span>;
  return (
    <span className="voice">
      <button type="button" className={`btn small ${listening ? 'rec' : ''}`} onClick={listening ? stop : start} aria-pressed={listening}>
        {listening ? <Square size={14} /> : <Mic size={14} />}{listening ? 'Stop' : label}
      </button>
      {listening && <span className="voice-note" aria-live="polite"><i className="pulse" />Listening… {interim}</span>}
      {error && <span className="voice-note err" role="alert">{error}</span>}
    </span>
  );
}
