import { useEffect, useState } from 'react';
import { DEMO_STORAGE_KEY, emptyProgress, parseProgress, type DemoProgress } from '../../lib/demoProgress';

export function useDemoProgress() {
  const [state, setState] = useState<DemoProgress>(() => {
    try { return parseProgress(localStorage.getItem(DEMO_STORAGE_KEY)); }
    catch { return emptyProgress(); }
  });
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state)); setSaved(true); }
    catch { setSaved(false); }
  }, [state]);
  const reset = () => {
    const fresh = emptyProgress();
    let cleared = false;
    try { localStorage.removeItem(DEMO_STORAGE_KEY); cleared = true; }
    catch {
      try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(fresh)); cleared = true; }
      catch { /* Preserve a truthful warning when the browser denies both operations. */ }
    }
    setState(fresh);
    return cleared;
  };
  return { state, setState, saved, reset };
}
