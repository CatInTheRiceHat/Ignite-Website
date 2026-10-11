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
    let frame = 0;
    let fallback = 0;
    const complete = (card: HTMLElement) => {
      revealed.current.add(card.dataset.ignitionId!);
      card.dataset.ignitionState = 'complete';
    };
    const showAll = () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
      cards.forEach(complete);
    };

    // Static HTML stays readable if page-entry animation cannot initialize.
    if (typeof window.matchMedia !== 'function') {
      showAll();
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const playCards = () => {
      frame = 0;
      try {
        if (reducedMotion.matches) {
          showAll();
          return;
        }
        // Run every row left to right on page entry, including offscreen rows.
        // Measure columns once so resizing and scrolling never restart the sequence.
        const plannedCards: { card: HTMLElement; offset: number }[] = [];
        let rowIndex = 0;
        for (const grid of new Set(cards.map((card) => card.parentElement))) {
          if (!grid) continue;
          const columns = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(/\s+/).length);
          const gridCards = cards.filter((card) => card.parentElement === grid);
          for (let start = 0; start < gridCards.length; start += columns) {
            const row = gridCards.slice(start, start + columns);
            for (const [columnIndex, card] of row.entries()) {
              plannedCards.push({ card, offset: rowIndex * 600 + columnIndex * 180 });
            }
            rowIndex += 1;
          }
        }
        // Keep the entire sequence bounded, even for a long single-column roster.
        const lastOffset = plannedCards[plannedCards.length - 1]?.offset ?? 0;
        const timingScale = Math.min(1, 6000 / Math.max(lastOffset, 1));
        for (const { card, offset } of plannedCards) {
          if (revealed.current.has(card.dataset.ignitionId!)) {
            complete(card);
            continue;
          }
          card.style.setProperty('--ignition-delay', `${250 + offset * timingScale}ms`);
          revealed.current.add(card.dataset.ignitionId!);
          card.dataset.ignitionState = 'playing';
        }
        // Restore static content if animationend never arrives.
        fallback = window.setTimeout(showAll, 250 + lastOffset * timingScale + 1500);
      } catch {
        showAll();
      }
    };

    const finish = (event: AnimationEvent) => {
      if (event.animationName !== 'ignite-card-fade' || !(event.target instanceof Element)) return;
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
        frame = requestAnimationFrame(playCards);
      }
    } catch {
      showAll();
    }

    root.addEventListener('animationend', finish);
    root.addEventListener('focusin', focus);
    reducedMotion.addEventListener('change', preferenceChanged);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
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
