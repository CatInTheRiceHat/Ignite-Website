import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { APPLY_FORM_URL, MENTOR_FORM_URL } from '../../lib/links';

const Footer = () => {
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Mentors', path: '/mentors' },
    { name: 'Program', path: '/program' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <footer className="relative overflow-hidden bg-[var(--primary-orange)] text-white shadow-[0_-16px_40px_rgba(240,123,42,0.12)]">
      <div className="absolute inset-y-0 right-0 w-full md:w-[48%] pointer-events-none opacity-15 sm:opacity-20 md:opacity-25">
        <img
          src="/mascots/Celebrate.png"
          alt=""
          className="h-full w-full object-contain object-right-bottom"
          loading="lazy"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="max-w-2xl">
            <Link to="/" className="inline-flex items-center gap-3 text-3xl md:text-4xl font-rammetto text-white">
              <img src="/mascots/Logo.png" alt="Ignite" className="w-12 h-12 object-contain drop-shadow-md" />
              Ignite
            </Link>
            <p className="mt-5 text-xl md:text-2xl font-semibold leading-relaxed text-white/90">
              Free online mentorship that helps students practice useful skills, ask better questions, and find their fire.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <a
                href={APPLY_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-[var(--primary-orange)] px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Apply Now
                <ExternalLink className="h-5 w-5" />
              </a>
              <a
                href={MENTOR_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-white bg-transparent px-8 py-4 rounded-full font-bold text-lg text-white hover:bg-white hover:text-[var(--primary-orange)] active:scale-95 transition-all"
              >
                Apply as a Mentor
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:pt-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">Explore</h2>
              <div className="mt-5 grid gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-lg font-semibold text-white/90 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">Program</h2>
              <div className="mt-5 grid gap-3 text-lg font-semibold text-white/90">
                <p>4th to 8th grade</p>
                <p>Online on Zoom</p>
                <p>100% free</p>
                <p>Summer sessions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-6 flex flex-col gap-3 text-sm font-semibold text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ignite. All rights reserved.</p>
          <p>Student-led. Mentor-powered. Free for every student.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
