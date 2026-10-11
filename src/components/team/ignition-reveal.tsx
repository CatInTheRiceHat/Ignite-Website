import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';
import './ignition-reveal.css';

/** A page-scoped history survives card remounts when a staff list is filtered. */
export function IgnitionGroup({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const revealed = useRef(new Set<string>());

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-ignition-id]'));
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    const pending = new Set<HTMLElement>();
    const complete = (card: HTMLElement) => {
      revealed.current.add(card.dataset.ignitionId!);
      card.dataset.ignitionState = 'complete';
      pending.delete(card);
      observer?.unobserve(card);
    };
    const showAll = () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      pending.clear();
      cards.forEach(complete);
    };

    // Static HTML is the default. Only a successful viewport callback adds motion.
    if (typeof IntersectionObserver === 'undefined' || typeof window.matchMedia !== 'function') {
      showAll();
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const playVisibleRows = () => {
      frame = 0;
      try {
        if (reducedMotion.matches) {
          showAll();
          return;
        }
        // Only this visible batch is staggered, in responsive DOM reading order.
        // Mobile rows share the same capped clock; offscreen cards never queue.
        let visibleIndex = 0;
        for (const card of cards) {
          if (!pending.has(card) || revealed.current.has(card.dataset.ignitionId!)) continue;
          pending.delete(card);
          const bounds = card.getBoundingClientRect();
          if (bounds.bottom <= 0 || bounds.top >= window.innerHeight - 32) continue;
          card.style.setProperty('--ignition-delay', `${Math.min(visibleIndex++ * 80, 240)}ms`);
          revealed.current.add(card.dataset.ignitionId!);
          card.dataset.ignitionState = 'playing';
          observer?.unobserve(card);
        }
      } catch {
        showAll();
      }
    };

    const finish = (event: AnimationEvent) => {
      if (event.animationName !== 'ignite-content' || !(event.target instanceof Element)) return;
      const card = event.target.closest<HTMLElement>('[data-ignition-id]');
      if (card) complete(card);
    };
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const card = event.target.closest<HTMLElement>('[data-ignition-id]');
      if (card) complete(card);
    };
    const preferenceChanged = () => {
      if (reducedMotion.matches) showAll();
    };

    try {
      if (reducedMotion.matches) {
        showAll();
      } else {
        observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            const card = entry.target as HTMLElement;
            if (entry.isIntersecting) pending.add(card);
            else pending.delete(card);
          }
          if (pending.size && !frame) frame = requestAnimationFrame(playVisibleRows);
        }, { rootMargin: '0px 0px -32px 0px', threshold: 0 });
        for (const card of cards) {
          if (revealed.current.has(card.dataset.ignitionId!)) complete(card);
          else observer.observe(card);
        }
      }
    } catch {
      showAll();
    }

    root.addEventListener('animationend', finish);
    root.addEventListener('focusin', focus);
    reducedMotion.addEventListener('change', preferenceChanged);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      root.removeEventListener('animationend', finish);
      root.removeEventListener('focusin', focus);
      reducedMotion.removeEventListener('change', preferenceChanged);
    };
  }, [children]);

  return <section ref={rootRef} className={className}>{children}</section>;
}

export function IgnitionCard({ children, revealId, className, style }: {
  children: ReactNode;
  revealId: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`ignition-card ${className ?? ''}`} style={style} data-ignition-id={revealId}>
      <div className="ignition-card-content">{children}</div>
      <span className="ignition-edge" aria-hidden="true">
        <span className="ignition-flame-travel">
          <svg className="ignition-flame" viewBox="0 0 24 30" focusable="false" aria-hidden="true">
            {/* Three soft tips and a cream center echo Ignite's flame mascot. */}
            <path className="ignition-flame-body" d="M12 28C4 28 1 23 2 17c.5-3 2-6 4-8 1-1 1 4 3 3C10 6 14 3 17 1c1-1 1 1 1 3 0 4 1 7 3 10 1 1 1-3 2-2 2 3 3 6 2 10-1 4-5 6-13 6Z" transform="translate(-1 0)" />
            <path className="ignition-flame-center" d="M12 25c-5 0-7-3-6-6 .5-2 1-3 2-4 1 3 2 2 3 0 1-3 3-5 4-6 0 5 2 7 3 9 2 4-1 7-6 7Z" />
            <path className="ignition-flame-core" d="M12 24c-3 0-4-2-3-4l3-4c0 3 3 4 3 6 0 1-1 2-3 2Z" />
          </svg>
        </span>
      </span>
    </div>
  );
}
