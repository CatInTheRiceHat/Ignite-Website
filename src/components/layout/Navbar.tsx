import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Mentors', path: '/mentors' },
    { name: 'Program', path: '/program' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <motion.div
        style={{ scaleX }}
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--primary-orange)] origin-left z-50"
      />
      <div className="max-w-7xl mx-auto px-4 h-24 md:h-28 flex flex-col md:flex-row items-center justify-between transition-all duration-300">
        {/* Mobile Header */}
        <div className="w-full md:w-auto flex items-center justify-between h-20 md:h-auto">
          <Link to="/" className="flex items-center gap-3 text-[1.7rem] md:text-[1.95rem] font-rammetto text-[var(--primary-orange)] group">
            <img
              src="/assets/Logo.png"
              alt="Ignite"
              className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
            />
            Ignite
          </Link>
          
          <button 
            className="md:hidden flex flex-col gap-1.5"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
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

        {/* Mobile Links */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden flex flex-col items-center gap-4 pb-6 font-semibold text-base overflow-hidden w-full"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `transition-colors hover:text-[var(--primary-orange)] ${isActive ? 'text-[var(--primary-orange)] border-b-2 border-[var(--primary-orange)]' : 'text-[var(--text-light)]'}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
