import { useEffect, useRef, useCallback } from 'react';

export function usePolling(callback, intervalMs, { enabled = true, immediate = true } = {}) {
  const savedCallback = useRef(callback);
  const timerRef      = useRef(null);
  const running       = useRef(false);

  useEffect(() => { savedCallback.current = callback; }, [callback]);

  const stop  = useCallback(() => { clearTimeout(timerRef.current); running.current = false; }, []);
  const start = useCallback(() => {
    if (running.current) return;
    running.current = true;
    const tick = async () => {
      if (!running.current) return;
      try { await savedCallback.current(); } catch (_) {}
      if (running.current) timerRef.current = setTimeout(tick, intervalMs);
    };
    if (immediate) tick();
    else timerRef.current = setTimeout(tick, intervalMs);
  }, [intervalMs, immediate]);

  useEffect(() => {
    if (!enabled) { stop(); return; }

    // Pause when tab is hidden — saves battery on Android
    const onVisible  = () => { if (document.visibilityState === 'visible') start(); else stop(); };
    document.addEventListener('visibilitychange', onVisible);
    start();

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, start, stop]);

  return { stop, start };
}
