import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
}

const FadingCarousel = ({
  items,
  intervalMs = 4000,
  autoPlay = true,
  variant = 'dark',
  imageStyle = 'boxed',
}: FadingCarouselProps) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!autoPlay || paused) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [autoPlay, paused, next, intervalMs]);

  const isLight = variant === 'light';

  return (
    <div className="max-w-5xl mx-auto px-4">
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
            <div className="relative h-[420px]">
              <AnimatePresence>
                <motion.img
                  key={active}
                  src={items[active].image}
                  alt={items[active].title}
                  className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                />
              </AnimatePresence>
              {/* Dot indicators */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 z-10">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === active
                        ? 'bg-white w-6 h-2.5'
                        : 'bg-white/50 w-2.5 h-2.5 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
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
          ))}
        </div>

      </div>
    </div>
  );
};

export default FadingCarousel;
