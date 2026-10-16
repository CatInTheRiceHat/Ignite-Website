import { useState, useEffect, useCallback, useId } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface CarouselItem {
  image: string;
  title: string;
  desc: string;
  details?: { title: string; paragraphs: string[] };
}

interface FadingCarouselProps {
  items: CarouselItem[];
  intervalMs?: number;
  autoPlay?: boolean;
  variant?: 'light' | 'dark'; // light = white text (for dark/image backgrounds), dark = dark text (default)
  imageStyle?: 'boxed' | 'open'; // boxed = rounded container, open = no box
  expandActiveOnly?: boolean;
}

const FadingCarousel = ({
  items,
  intervalMs = 4000,
  autoPlay = true,
  variant = 'dark',
  imageStyle = 'boxed',
  expandActiveOnly = false,
}: FadingCarouselProps) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const id = useId();
  const reducedMotion = useReducedMotion();

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!autoPlay || paused || reducedMotion) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [autoPlay, paused, next, intervalMs, reducedMotion]);

  const isLight = variant === 'light';

  return (
    <div className={`${expandActiveOnly ? 'max-w-7xl' : 'max-w-5xl'} mx-auto px-4`}>
      <div className={`flex flex-col md:flex-row ${expandActiveOnly ? 'items-start gap-0' : 'items-center gap-10 md:gap-16'}`}>

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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
              </AnimatePresence>
              {/* Dot indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === active ? 'bg-white w-6 h-2.5' : 'bg-white/50 w-2.5 h-2.5 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={`relative ${expandActiveOnly ? 'h-96 sm:h-[500px] lg:h-[620px]' : 'h-[420px]'}`}>
              <AnimatePresence>
                <motion.img
                  key={active}
                  src={items[active].image}
                  alt={items[active].title}
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.7, ease: 'easeInOut' }}
                />
              </AnimatePresence>
              {/* Dot indicators */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 z-10">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={expandActiveOnly
                      ? `flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isLight ? 'focus-visible:outline-white' : 'focus-visible:outline-[var(--text-charcoal)]'}`
                      : `rounded-full transition-all duration-300 ${i === active ? 'bg-white w-6 h-2.5' : 'bg-white/50 w-2.5 h-2.5 hover:bg-white/80'}`}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-pressed={i === active}
                    type="button"
                  >
                    {expandActiveOnly && <span aria-hidden="true" className={`h-2.5 rounded-full transition-all duration-300 ${i === active ? `w-6 ${isLight ? 'bg-white' : 'bg-[var(--primary-orange)]'}` : `w-2.5 ${isLight ? 'bg-white/50' : 'bg-[var(--text-charcoal)] opacity-40'}`}`} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right - descriptions */}
        <div className={`w-full md:w-1/2 flex flex-col gap-4 ${expandActiveOnly ? 'md:-ml-8' : ''} ${expandActiveOnly ? (isLight ? 'rounded-[2rem] border border-white/30 bg-black/30 p-4 shadow-lg sm:p-6' : 'rounded-[2rem] border border-orange-100 bg-white/95 p-4 shadow-lg sm:p-6') : ''}`}>
          {items.map((item, i) => (
            expandActiveOnly ? (
              <div key={item.title} className={`rounded-2xl border-l-4 transition-colors ${i === active ? (isLight ? 'border-white bg-white/20' : 'border-[var(--primary-orange)] bg-orange-50') : 'border-transparent'}`}>
                <h3>
                  <button
                    type="button"
                    id={`${id}-role-${i}`}
                    aria-expanded={i === active}
                    aria-controls={`${id}-details-${i}`}
                    onClick={() => setActive(i)}
                    className={`w-full rounded-2xl px-6 py-6 text-left text-xl font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isLight ? 'text-white hover:bg-white/10 focus-visible:outline-white' : 'text-[var(--text-charcoal)] hover:bg-orange-50 focus-visible:outline-[var(--primary-orange)]'}`}
                  >
                    {item.title}
                  </button>
                </h3>
                <div id={`${id}-details-${i}`} role="region" aria-labelledby={`${id}-role-${i}`} hidden={i !== active} className={`space-y-5 px-6 pb-6 text-base leading-relaxed ${isLight ? 'text-white/90' : 'text-[var(--text-light)]'}`}>
                  <p>{item.desc}</p>
                  {item.details && (
                    <div className={`space-y-3 border-t pt-5 ${isLight ? 'border-white/20' : 'border-orange-100'}`}>
                      <p className="font-extrabold">{item.details.title}</p>
                      {item.details.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`text-left rounded-2xl px-6 py-5 transition-all duration-300 border-l-4 ${
                i === active
                  ? isLight
                    ? 'bg-white/20 border-white'
                    : 'bg-white shadow-lg border-[var(--primary-orange)]'
                  : isLight
                  ? 'bg-transparent border-transparent hover:bg-white/10'
                  : 'bg-white/60 border-transparent hover:bg-white/80'
              }`}
            >
              <h3
                className={`text-xl font-bold mb-1 transition-colors duration-300 ${
                  i === active
                    ? isLight ? 'text-white' : 'text-[var(--primary-orange)]'
                    : isLight ? 'text-white/70' : 'text-[var(--text-charcoal)]'
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`text-base leading-relaxed transition-all duration-300 ${
                  i === active
                    ? isLight ? 'text-white/90' : 'text-[var(--text-light)]'
                    : isLight ? 'text-white/50' : 'text-[var(--text-light)] opacity-60'
                }`}
              >
                {item.desc}
              </p>
            </button>
            )
          ))}
        </div>

      </div>
    </div>
  );
};

export default FadingCarousel;
