import { useEffect, useRef } from 'react';

/** Content is visible before observation; motion only enhances a successful callback. */
export function useBriefAnimation(keyframes: Keyframe[], duration: number, delay = 0, enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || played.current || typeof IntersectionObserver === 'undefined' || typeof window.matchMedia !== 'function' || typeof element.animate !== 'function') return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;
    let observer: IntersectionObserver | undefined;
    let animation: Animation | undefined;
    const stop = () => animation?.cancel();
    const preferenceChanged = () => { if (preference.matches) stop(); };
    try {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || played.current) return;
        played.current = true;
        observer?.disconnect();
        if (preference.matches || element.contains(document.activeElement)) return;
        try {
          animation = element.animate(keyframes, { duration, delay: Math.min(Math.max(delay, 0), 240), easing: 'ease-out' });
        } catch { /* Keep the unchanged, readable default when animation fails. */ }
      }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });
      observer.observe(element);
    } catch { observer?.disconnect(); }
    element.addEventListener('focusin', stop);
    preference.addEventListener('change', preferenceChanged);
    return () => {
      observer?.disconnect();
      stop();
      element.removeEventListener('focusin', stop);
      preference.removeEventListener('change', preferenceChanged);
    };
  }, [keyframes, duration, delay, enabled]);
  return ref;
}
