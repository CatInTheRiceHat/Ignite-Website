import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
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
            className="md:hidden flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full"
            onClick={() => setIsOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            type="button"
          >
            <span className={`w-6 h-0.5 bg-[var(--primary-orange)] transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[var(--primary-orange)] ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[var(--primary-orange)] transition-transform ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-lg">
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
        </div>

      </div>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
