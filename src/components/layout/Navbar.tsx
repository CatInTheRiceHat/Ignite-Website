import { RedirectArrow } from '../ui/redirect-arrow';
import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Megaphone, Menu, X } from 'lucide-react';
import { RECORDS_PAGE } from '../../config/records';
import { STUDENT_PREENROLLMENT_URL } from '../../lib/links';

const announcementText = 'Student pre-enrollment is open. Apply now!';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Team', path: '/team' },
    { name: 'Program', path: '/program' },
    { name: 'Partnerships', path: '/partnerships' },
    { name: 'FAQ', path: '/faq' },
    { name: RECORDS_PAGE.label, path: RECORDS_PAGE.path },
    { name: 'Hiring', path: '/hiring' },
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
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
      <div className="max-w-7xl mx-auto px-4 h-20 md:h-24 flex items-center justify-between transition-all duration-300">
        {/* Mobile Header */}
        <div className="w-full xl:w-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[1.4rem] md:text-[1.65rem] font-rammetto text-[var(--primary-orange)] group">
            <img
              src="/mascots/Logo.png"
              alt="Ignite"
              className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
            />
            Ignite
          </Link>
          
          <button 
            className="xl:hidden flex h-10 w-10 items-center justify-center rounded-full text-[var(--primary-orange)] transition-colors hover:bg-orange-50"
            onClick={() => setIsOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            type="button"
          >
            {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Desktop Links */}
        <div className="hidden xl:flex items-center gap-5 whitespace-nowrap font-sans font-bold text-lg">
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
          <a href={STUDENT_PREENROLLMENT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--primary-orange)] px-4 py-2 text-white transition-colors hover:bg-[var(--primary-orange-dark)] font-sans font-bold text-button">
            Apply Now
            <RedirectArrow size={16} />
          </a>
        </div>

      </div>
      <a
        href={STUDENT_PREENROLLMENT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={announcementText}
        className="group flex min-h-14 items-center justify-center bg-[var(--text-charcoal)] px-4 py-2 text-center text-white transition-colors hover:bg-[var(--primary-orange-dark)] sm:min-h-12"
      >
        <span className="flex w-full min-w-0 max-w-7xl items-center justify-center gap-2 text-base font-bold leading-tight sm:text-lg">
          <Megaphone className="h-4 w-4 flex-none text-white" aria-hidden="true" />
          <span className="block min-w-0 max-w-[38ch] flex-1 whitespace-normal text-center sm:max-w-none sm:flex-none">
            {announcementText}
          </span>
          <RedirectArrow size={16} className="hidden transition-transform group-hover:translate-x-1 sm:block" />
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
            className="xl:hidden absolute left-0 right-0 top-full max-h-[calc(100dvh-8.5rem)] sm:max-h-[calc(100dvh-8rem)] md:max-h-[calc(100dvh-9rem)] overflow-y-auto border-t border-orange-100 bg-white shadow-lg"
          >
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 font-sans font-bold text-lg">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 transition-colors hover:bg-orange-50 hover:text-[var(--primary-orange)] ${isActive ? 'text-[var(--primary-orange)]' : 'text-[var(--text-light)]'}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <a href={STUDENT_PREENROLLMENT_URL} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--primary-orange)] px-3 py-2 font-sans text-button font-bold text-white transition-colors hover:bg-[var(--primary-orange-dark)]">
                Apply Now
                <RedirectArrow size={16} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
