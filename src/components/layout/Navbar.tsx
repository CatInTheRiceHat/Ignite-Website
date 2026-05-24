import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, Megaphone, Menu, X } from 'lucide-react';
import { APPLY_FORM_URL } from '../../lib/links';

const announcementText = "We've received 80+ applications and spots are filling quickly. Apply soon for Summer 2026!";

function AnnouncementCount({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value]);

  return (
    <span ref={ref} className="inline-block min-w-[2ch] tabular-nums">
      {display}
    </span>
  );
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Mentors', path: '/mentors' },
    { name: 'Program', path: '/program' },
    { name: 'FAQ', path: '/faq' },
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md shadow-sm">
      <motion.div
        style={{ scaleX }}
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--primary-orange)] origin-left z-50"
      />
      <div className="max-w-7xl mx-auto px-4 h-24 md:h-28 flex items-center justify-between transition-all duration-300">
        {/* Mobile Header */}
        <div className="w-full md:w-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-[1.7rem] md:text-[1.95rem] font-rammetto text-[var(--primary-orange)] group">
            <img
              src="/assets/Logo.png"
              alt="Ignite"
              className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
            />
            Ignite
          </Link>
          
          <button 
            className="md:hidden flex h-11 w-11 items-center justify-center rounded-full text-[var(--primary-orange)] transition-colors hover:bg-orange-50"
            onClick={() => setIsOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            type="button"
          >
            {isOpen ? <X className="h-7 w-7" aria-hidden="true" /> : <Menu className="h-7 w-7" aria-hidden="true" />}
          </button>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8 font-semibold text-base lg:text-lg">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `transition-colors hover:text-[var(--primary-orange)] ${isActive ? 'text-[var(--primary-orange)] border-b-2 border-[var(--primary-orange)]' : 'text-[var(--text-light)]'}`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <a
            href={APPLY_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[var(--primary-orange)] px-5 py-3 font-bold text-white shadow-md shadow-orange-100 transition-all hover:scale-105 hover:bg-[var(--primary-orange-dark)] active:scale-95"
          >
            Apply Now
          </a>
        </div>

      </div>
      <a
        href={APPLY_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={announcementText}
        className="group flex min-h-12 items-center justify-center bg-[var(--text-charcoal)] px-4 py-2 text-center text-white transition-colors hover:bg-[var(--primary-orange-dark)]"
      >
        <span className="flex w-full min-w-0 max-w-7xl items-center justify-center gap-2 text-[0.7rem] font-bold leading-tight sm:text-base md:text-lg">
          <Megaphone className="h-4 w-4 flex-none text-white sm:h-5 sm:w-5" aria-hidden="true" />
          <span className="block min-w-0 max-w-[38ch] flex-1 whitespace-normal text-center sm:max-w-none sm:flex-none">
            We've received <AnnouncementCount value={80} />+ applications and spots are filling quickly. Apply soon for Summer 2026!
          </span>
          <ArrowRight className="hidden h-4 w-4 flex-none transition-transform group-hover:translate-x-1 sm:block" aria-hidden="true" />
        </span>
      </a>
      {/* Mobile Links */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="md:hidden absolute left-0 right-0 top-full border-t border-orange-100 bg-white shadow-lg"
          >
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 font-semibold text-base">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 transition-colors hover:bg-orange-50 hover:text-[var(--primary-orange)] ${isActive ? 'text-[var(--primary-orange)]' : 'text-[var(--text-light)]'}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <a
                href={APPLY_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="mt-2 rounded-full bg-[var(--primary-orange)] px-6 py-3 text-center font-bold text-white shadow-md shadow-orange-100 transition-all active:scale-95"
              >
                Apply Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
