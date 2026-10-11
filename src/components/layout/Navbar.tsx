import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { ArrowRight, Megaphone, Menu, X } from 'lucide-react';
import StudentApplicationButton from '../ui/student-application-button';
import { RECORDS_PAGE } from '../../config/records';

const announcementText = "Winter 2026 applications are now open! We're looking for interns to support Ignite.";

const Navbar = () => {
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Team', path: '/team' },
    { name: 'Program', path: '/program' },
    { name: 'FAQ', path: '/faq' },
    { name: RECORDS_PAGE.label, path: RECORDS_PAGE.path },
    { name: 'Hiring', path: '/hiring' },
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
        style={{ scaleX: reduceMotion ? scrollYProgress : scaleX }}
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--primary-orange)] origin-left z-50"
      />
      <div className="max-w-7xl mx-auto px-4 h-24 md:h-28 flex items-center justify-between transition-all duration-300">
        {/* Mobile Header */}
        <div className="w-full md:w-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-[1.7rem] md:text-[1.95rem] font-rammetto text-[var(--text-charcoal)] group">
            <img
              src="/mascots/Logo.png"
              alt="Ignite"
              className="w-10 h-10 object-contain transition-transform "
            />
            Ignite
          </Link>
          
          <button 
            className="ignite-button md:hidden flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-charcoal)] transition-colors hover:bg-orange-50"
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
        <div className="hidden md:flex items-center gap-2 font-semibold text-sm lg:gap-8 lg:text-lg">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `transition-colors hover:text-[var(--text-charcoal)] ${isActive ? 'text-[var(--text-charcoal)] border-b-2 border-[var(--primary-orange)]' : 'text-[var(--text-light)]'}`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <StudentApplicationButton compact className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-orange)] px-5 py-3 font-bold text-[var(--text-charcoal)] shadow-md shadow-orange-100 transition-all hover:bg-[var(--primary-orange-dark)] " />
        </div>

      </div>
      <Link
        to="/hiring"
        aria-label={announcementText}
        className="group flex min-h-12 items-center justify-center bg-[var(--text-charcoal)] px-4 py-2 text-center text-white transition-colors hover:bg-[var(--primary-orange-dark)] hover:text-[var(--text-charcoal)]"
      >
        <span className="flex w-full min-w-0 max-w-7xl items-center justify-center gap-2 text-[0.7rem] font-bold leading-tight sm:text-base md:text-lg">
          <Megaphone className="h-4 w-4 flex-none sm:h-5 sm:w-5" aria-hidden="true" />
          <span className="block min-w-0 max-w-[38ch] flex-1 whitespace-normal text-center sm:max-w-none sm:flex-none">
            {announcementText}
          </span>
          <ArrowRight className="hidden h-4 w-4 flex-none transition-transform sm:block" aria-hidden="true" />
        </span>
      </Link>
      {/* Mobile Links */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={reduceMotion ? false : { opacity: 1, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0 : 0.12, ease: 'easeInOut' }}
            className="md:hidden absolute left-0 right-0 top-full max-h-[calc(100dvh-9rem)] overflow-y-auto overscroll-contain border-t border-orange-100 bg-white shadow-lg"
          >
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 font-semibold text-base">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 transition-colors hover:bg-orange-50 hover:text-[var(--text-charcoal)] ${isActive ? 'text-[var(--text-charcoal)]' : 'text-[var(--text-light)]'}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <StudentApplicationButton compact className="ignite-button mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary-orange)] px-6 py-3 text-center font-bold text-[var(--text-charcoal)] shadow-md shadow-orange-100 transition-all " />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
