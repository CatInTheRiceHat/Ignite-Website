import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-2xl font-rammetto text-[var(--primary-orange)]">
            <img src="/assets/Logo.png" alt="Ignite" className="w-8 h-8 object-contain" />
            Ignite
          </Link>
          <p className="text-gray-500 text-sm max-w-xs text-center">
            Free online courses led by high school mentors.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold text-[var(--text-light)]">
          <Link to="/about" className="hover:text-[var(--primary-orange)] transition-colors">About</Link>
          <Link to="/mentors" className="hover:text-[var(--primary-orange)] transition-colors">Mentors</Link>
          <Link to="/program" className="hover:text-[var(--primary-orange)] transition-colors">Program</Link>
          <Link to="/curriculum" className="hover:text-[var(--primary-orange)] transition-colors">Curriculum</Link>
          <Link to="/faq" className="hover:text-[var(--primary-orange)] transition-colors">FAQ</Link>
        </div>

        <div className="w-full h-px bg-gray-100 max-w-lg"></div>

        <p className="text-gray-400 text-xs">© 2026 Ignite. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
