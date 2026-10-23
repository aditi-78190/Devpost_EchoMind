import { useCallback, useEffect, useState } from 'react';
import { loadMemories, saveMemories } from '../utils/storage.js';
import { createMemory, demoMemories, updateMemory } from '../services/memoryService.js';

export function useMemories() {
  const [memories, setMemories] = useState(() => loadMemories() ?? demoMemories());
  const [storageError, setStorageError] = useState(false);
  useEffect(() => { setStorageError(!saveMemories(memories)); }, [memories]);

  const add = useCallback((form) => { const m = createMemory(form); setMemories((l) => [m, ...l]); return m; }, []);
  const update = useCallback((old, form) => { const m = updateMemory(old, form); setMemories((l) => l.map((x) => (x.id === old.id ? m : x))); return m; }, []);
  const remove = useCallback((id) => setMemories((l) => l.filter((x) => x.id !== id)), []);
  const toggleFavorite = useCallback((id) => setMemories((l) => l.map((x) => (x.id === id ? { ...x, favorite: !x.favorite } : x))), []);
  const clearAll = useCallback(() => setMemories([]), []);
  const removeDemo = useCallback(() => setMemories((l) => l.filter((x) => !x.demo)), []);
  const restoreDemo = useCallback(() => setMemories((l) => [...demoMemories().filter((d) => !l.some((x) => x.id === d.id)), ...l]), []);
  const importMemories = useCallback((incoming) => setMemories((l) => [...incoming, ...l.filter((x) => !incoming.some((i) => i.id === x.id))]), []);
  return { memories, storageError, add, update, remove, toggleFavorite, clearAll, removeDemo, restoreDemo, importMemories };
}
