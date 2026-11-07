import { RedirectArrow } from '../ui/redirect-arrow';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ChevronDown, Megaphone, Menu, X } from 'lucide-react';
import { RECORDS_PAGE } from '../../config/records';
import { STUDENT_PREENROLLMENT_URL } from '../../lib/links';

const announcementText = 'Student pre-enrollment is open. Apply now!';
const navSections = [
  {
    id: 'about',
    name: 'About',
    links: [
      { name: 'About Ignite', path: '/about' },
      { name: 'Our Team', path: '/team' },
      { name: RECORDS_PAGE.label, path: RECORDS_PAGE.path },
    ],
  },
  {
    id: 'program',
    name: 'Program',
    links: [
      { name: 'Program Overview', path: '/program' },
      { name: 'FAQ', path: '/faq' },
    ],
  },
  {
    id: 'involved',
    name: 'Get Involved',
    links: [
      { name: 'Partnerships', path: '/partnerships' },
      { name: 'Sponsors', path: '/sponsors' },
      { name: 'Hiring', path: '/hiring' },
    ],
  },
];
const focusStyles = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-orange)] focus-visible:ring-offset-2';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  const closeMenus = () => {
    setIsOpen(false);
    setOpenSection(null);
  };

  useEffect(() => {
    setIsOpen(false);
    setOpenSection(null);
  }, [location.pathname]);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const handleLayoutChange = () => {
      setIsOpen(false);
      setOpenSection(null);
    };

    desktopQuery.addEventListener('change', handleLayoutChange);
    return () => desktopQuery.removeEventListener('change', handleLayoutChange);
  }, []);

  useEffect(() => {
    if (!isOpen && !openSection) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) {
        setIsOpen(false);
        setOpenSection(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (openSection) {
        document.getElementById(`nav-${openSection}-toggle`)?.focus();
        setOpenSection(null);
      } else {
        mobileToggleRef.current?.focus();
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, openSection]);

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) closeMenus();
      }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md shadow-sm"
    >
      <motion.div
        style={{ scaleX }}
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--primary-orange)] origin-left z-50"
      />
      <div className="max-w-7xl mx-auto px-4 h-20 md:h-24 flex items-center justify-between transition-all duration-300">
        <Link to="/" onClick={closeMenus} aria-label="Ignite home" className={`flex items-center gap-2 rounded-lg text-[1.4rem] md:text-[1.65rem] font-rammetto text-[var(--primary-orange)] group ${focusStyles}`}>
          <img
            src="/mascots/Logo.png"
            alt=""
            className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
          />
          Ignite
        </Link>

        <button
          ref={mobileToggleRef}
          className={`lg:hidden flex h-11 w-11 items-center justify-center rounded-full text-[var(--primary-orange)] transition-colors hover:bg-orange-50 ${focusStyles}`}
          onClick={() => {
            setIsOpen((open) => !open);
            setOpenSection(null);
          }}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="navigation-links"
          type="button"
        >
          {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>

        <div
          id="navigation-links"
          className={`${isOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full max-h-[calc(100dvh-8.5rem)] sm:max-h-[calc(100dvh-8rem)] md:max-h-[calc(100dvh-9rem)] flex-col overflow-y-auto border-t border-orange-100 bg-white px-4 py-3 shadow-lg lg:static lg:flex lg:max-h-none lg:flex-row lg:items-center lg:gap-5 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none font-sans font-bold text-xl`}
        >
          <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
            {navSections.map((section) => {
              const isExpanded = openSection === section.id;
              const isActive = section.links.some((link) => location.pathname === link.path);

              return (
                <li
                  key={section.id}
                  className="relative border-b border-orange-100 last:border-0 lg:border-0"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setOpenSection((current) => current === section.id ? null : current);
                    }
                  }}
                >
                  <button
                    id={`nav-${section.id}-toggle`}
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`nav-${section.id}-links`}
                    onClick={() => setOpenSection(isExpanded ? null : section.id)}
                    className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-xl transition-colors hover:bg-orange-50 hover:text-[var(--primary-orange)] lg:w-auto ${focusStyles} ${isActive || isExpanded ? 'text-[var(--primary-orange)]' : 'text-[var(--text-light)]'}`}
                  >
                    {section.name}
                    <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  <ul
                    id={`nav-${section.id}-links`}
                    hidden={!isExpanded}
                    aria-labelledby={`nav-${section.id}-toggle`}
                    className="space-y-1 pb-3 pl-3 lg:absolute lg:right-0 lg:top-[calc(100%+0.75rem)] lg:z-[60] lg:min-w-56 lg:rounded-2xl lg:border lg:border-orange-100 lg:bg-white lg:p-2 lg:shadow-[0_12px_36px_rgba(26,26,46,0.12)]"
                  >
                    {section.links.map((link) => (
                      <li key={link.path}>
                        <NavLink
                          to={link.path}
                          onClick={closeMenus}
                          className={({ isActive: isLinkActive }) =>
                            `block rounded-xl px-3 py-2.5 text-lg transition-colors hover:bg-orange-50 hover:text-[var(--primary-orange)] ${focusStyles} ${isLinkActive ? 'bg-orange-50 text-[var(--primary-orange)]' : 'text-[var(--text-light)]'}`
                          }
                        >
                          {link.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
          <a href={STUDENT_PREENROLLMENT_URL} target="_blank" rel="noopener noreferrer" onClick={closeMenus} className={`mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--primary-orange)] px-5 py-2 text-white transition-colors hover:bg-[var(--primary-orange-dark)] font-sans font-bold text-xl lg:mt-0 ${focusStyles}`}>
            Apply Now
            <RedirectArrow size={16} />
          </a>
        </div>
      </div>
      <a
        href={STUDENT_PREENROLLMENT_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={closeMenus}
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
    </nav>
  );
};

export default Navbar;
