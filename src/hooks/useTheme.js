import { useEffect, useState } from 'react';
import { loadTheme, saveTheme } from '../utils/storage.js';
export function useTheme() {
  const [theme, setTheme] = useState(loadTheme);
  useEffect(() => { document.documentElement.dataset.theme = theme; saveTheme(theme); }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}
