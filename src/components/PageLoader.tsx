import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

type Phase = 'waiting' | 'loading' | 'leaving' | 'ready';

function currentSeason() {
  // Match Moodle's season boundaries, including British Summer Time.
  const month = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', month: 'numeric' }).format(new Date()));
  return ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Fall', 'Fall', 'Fall', 'Winter'][month - 1];
}

function SeasonalBackdrop() {
  const [season, setSeason] = useState(currentSeason);
  useEffect(() => {
    let timer = 0;
    const update = () => {
      setSeason(currentSeason());
      window.clearTimeout(timer);
      timer = window.setTimeout(update, 60000 - Date.now() % 60000);
    };
    update();
    window.addEventListener('pageshow', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pageshow', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return <img className="page-loader__background" src={`/backgrounds/${season}.jpg`} data-season={season.toLowerCase()} alt="" aria-hidden="true" />;
}

function LoadingArtwork() {
  const reducedMotion = useReducedMotion();
  const [gifReady, setGifReady] = useState(false);

  return (
    <div className="page-loader__art" aria-hidden="true">
      <img src="/mascots/Logo.png" alt="" style={{ opacity: gifReady && !reducedMotion ? 0 : 1 }} />
      {!reducedMotion && (
        <img
          src="/backgrounds/Loading.gif"
          alt=""
          style={{ opacity: gifReady ? 1 : 0 }}
          onLoad={() => setGifReady(true)}
          onError={() => setGifReady(false)}
        />
      )}
    </div>
  );
}

/** Wait for the current page's visible artwork, including lazy route content. */
export default function PageLoader({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const { pathname } = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('waiting');
  const blocking = enabled && (phase === 'loading' || phase === 'leaving');

  useEffect(() => {
    if (!enabled) return;
    const content = contentRef.current!;
    let finished = false;
    let frame = 0;
    let pending = 0;
    const watched = new WeakSet<HTMLImageElement>();
    const cleanups: (() => void)[] = [];
    setPhase('waiting');

    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(showTimer);
      window.clearTimeout(maxTimer);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      cleanups.forEach(cleanup => cleanup());
      setPhase(current => current === 'loading' ? 'leaving' : 'ready');
    };

    const scheduleCheck = () => {
      if (finished) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(checkImages);
    };

    function checkImages() {
      if (finished) return;
      // Suspense content may not have mounted yet. Its images are discovered
      // when the fallback is replaced, rather than revealing an empty page.
      if (content.querySelector('[data-page-loading]')) return;

      for (const image of content.querySelectorAll('img')) {
        if (watched.has(image) || !image.getAttribute('src')) continue;
        const bounds = image.getBoundingClientRect();
        if (bounds.width === 0 || bounds.height === 0 || bounds.bottom <= 0 ||
            bounds.top >= window.innerHeight || bounds.right <= 0 || bounds.left >= window.innerWidth) continue;
        const style = window.getComputedStyle(image);
        if (style.visibility === 'hidden' || style.opacity === '0') continue;

        watched.add(image);
        pending += 1;
        let settled = false;
        const cleanup = () => {
          image.removeEventListener('load', loaded);
          image.removeEventListener('error', settle);
        };
        const settle = () => {
          if (settled || finished) return;
          settled = true;
          pending -= 1;
          cleanup();
          scheduleCheck();
        };
        const loaded = () => {
          // Download completion alone doesn't guarantee a large image can paint.
          if (image.naturalWidth && typeof image.decode === 'function') {
            void image.decode().then(settle, settle);
          } else settle();
        };
        cleanups.push(cleanup);
        image.addEventListener('load', loaded);
        image.addEventListener('error', settle);
        if (image.complete) loaded();
      }
      if (pending === 0) finish();
    }

    const observer = new MutationObserver(scheduleCheck);
    observer.observe(content, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset'] });
    // Cached / fast loads bypass the overlay and its GIF download entirely.
    const showTimer = window.setTimeout(() => setPhase('loading'), 200);
    const maxTimer = window.setTimeout(finish, 8000);
    scheduleCheck();

    return () => {
      finished = true;
      window.clearTimeout(showTimer);
      window.clearTimeout(maxTimer);
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      cleanups.forEach(cleanup => cleanup());
    };
  }, [pathname, enabled]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const timer = window.setTimeout(() => setPhase('ready'), 200);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!blocking) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    document.body.dataset.pageLoading = 'true';
    return () => {
      document.body.style.overflow = previousOverflow;
      delete document.body.dataset.pageLoading;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [blocking]);

  return (
    <>
      <div ref={contentRef} {...(blocking ? { inert: '' } : {})} aria-hidden={blocking || undefined}>
        {children}
      </div>
      {blocking && (
        <div className={`page-loader${phase === 'leaving' ? ' page-loader--leaving' : ''}`} role="status" aria-live="polite" aria-atomic="true" aria-labelledby="page-loader-title">
          <SeasonalBackdrop />
          <div className="page-loader__content">
            <LoadingArtwork />
            <h2 id="page-loader-title">Lighting things up…</h2>
          </div>
        </div>
      )}
    </>
  );
}
