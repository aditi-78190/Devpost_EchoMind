import { useCallback, useEffect, useRef, useState } from 'react';
const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const MESSAGES = {
  'not-allowed': 'Microphone access was blocked. Allow it in your browser settings, or type instead.',
  'service-not-allowed': 'Voice input is not allowed in this browser. Type instead.',
  'no-speech': 'No speech detected. Try again or type instead.',
  'audio-capture': 'No microphone found. Type instead.',
  network: 'Voice recognition needs a network connection in this browser. Type instead.',
};

export function useSpeech(onFinal) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const rec = useRef(null);
  const cb = useRef(onFinal);
  useEffect(() => { cb.current = onFinal; });
  useEffect(() => () => rec.current?.abort(), []);

  const start = useCallback(() => {
    if (!SR) return;
    setError(''); setInterim('');
    const r = new SR();
    r.lang = navigator.language || 'en-US';
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (e) => {
      let fin = '', tmp = '';
      for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) fin += e.results[i][0].transcript; else tmp += e.results[i][0].transcript; }
      setInterim(tmp);
      if (fin.trim()) cb.current(fin.trim());
    };
    r.onerror = (e) => { if (e.error !== 'aborted') setError(MESSAGES[e.error] || `Voice input failed (${e.error}). Type instead.`); };
    r.onend = () => { setListening(false); setInterim(''); };
    try { r.start(); rec.current = r; setListening(true); } catch { setError('Could not start voice input. Type instead.'); }
  }, []);
  const stop = useCallback(() => rec.current?.stop(), []);
  return { supported: Boolean(SR), listening, interim, error, start, stop };
}
