import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useBriefAnimation } from '../../lib/use-brief-animation';

const mascotWelcome: Keyframe[] = [
  { transform: 'translateY(0) rotate(0deg)' },
  { transform: 'translateY(-4px) rotate(-1deg)', offset: 0.35 },
  { transform: 'translateY(-1px) rotate(1deg)', offset: 0.7 },
  { transform: 'translateY(0) rotate(0deg)' },
];

interface CarouselItem {
  image: string;
  title: string;
  desc: string;
}

interface FadingCarouselProps {
  items: CarouselItem[];
  intervalMs?: number;
  autoPlay?: boolean;
  variant?: 'light' | 'dark'; // light = white text (for dark/image backgrounds), dark = dark text (default)
  imageStyle?: 'boxed' | 'open'; // boxed = rounded container, open = no box
  mascotMotion?: boolean;
}

const FadingCarousel = ({
  items,
  intervalMs = 4000,
  autoPlay = true,
  variant = 'dark',
  imageStyle = 'boxed',
  mascotMotion = false,
}: FadingCarouselProps) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const mascotRef = useBriefAnimation(mascotWelcome, 850, 0, mascotMotion);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!autoPlay || paused || reduceMotion) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [autoPlay, paused, reduceMotion, next, intervalMs]);

  const isLight = variant === 'light';

  return (
    <div className="max-w-5xl mx-auto px-4" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">

        {/* Left - fading image */}
        <div
          className="w-full md:w-1/2 shrink-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {imageStyle === 'boxed' ? (
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="sync">
                <motion.img
                  key={active}
                  src={items[active].image}
                  alt={items[active].title}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeInOut' }}
                />
              </AnimatePresence>
              {/* Dot indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="ignite-button flex h-11 w-11 items-center justify-center rounded-full bg-[var(--text-charcoal)] focus-visible:outline-white"
                    aria-label={`Go to slide ${i + 1}`}
                    aria-pressed={i === active}
                  ><span className={`h-2.5 rounded-full bg-white ${i === active ? 'w-6' : 'w-2.5'}`} /></button>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative h-[420px]">
              <div ref={mascotRef} className="pointer-events-none absolute inset-x-0 top-0 bottom-14" data-mascot-welcome={mascotMotion || undefined}>
              <AnimatePresence>
                <motion.img
                  key={active}
                  src={items[active].image}
                  alt={items[active].title}
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeInOut' }}
                />
              </AnimatePresence>
              </div>
              {/* Dot indicators */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 z-10">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="ignite-button flex h-11 w-11 items-center justify-center rounded-full bg-[var(--text-charcoal)] focus-visible:outline-white"
                    aria-label={`Go to slide ${i + 1}`}
                    aria-pressed={i === active}
                  ><span className={`h-2.5 rounded-full bg-white ${i === active ? 'w-6' : 'w-2.5'}`} /></button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right - descriptions */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={`ignite-button text-left rounded-2xl px-6 py-5 border-l-4 ${isLight ? 'focus-visible:outline-white' : ''} ${
                i === active
                  ? isLight
                    ? 'bg-[var(--text-charcoal)] border-[var(--primary-orange)]'
                    : 'bg-white shadow-lg border-[var(--primary-orange)]'
                  : isLight
                  ? 'bg-[var(--text-charcoal)] border-transparent hover:bg-[var(--text-light)]'
                  : 'bg-white/60 border-transparent hover:bg-white/80'
              }`}
            >
              <h3
                className={`text-xl font-bold mb-1 transition-colors duration-300 ${
                  i === active
                    ? isLight ? 'text-white' : 'text-[var(--text-charcoal)]'
                    : isLight ? 'text-white' : 'text-[var(--text-charcoal)]'
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`text-base leading-relaxed transition-all duration-300 ${
                  i === active
                    ? isLight ? 'text-white' : 'text-[var(--text-light)]'
                    : isLight ? 'text-white' : 'text-[var(--text-light)]'
                }`}
              >
                {item.desc}
              </p>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FadingCarousel;
