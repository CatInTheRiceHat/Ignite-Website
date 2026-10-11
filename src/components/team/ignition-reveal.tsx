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
    const playVisibleCards = () => {
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
      if (event.animationName !== 'ignite-card-flip' || !(event.target instanceof Element)) return;
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
          if (pending.size && !frame) frame = requestAnimationFrame(playVisibleCards);
        }, { rootMargin: '0px 0px -32px 0px', threshold: 0.12 });
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
    </div>
  );
}
