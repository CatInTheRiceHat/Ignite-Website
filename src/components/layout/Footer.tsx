import StudentApplicationButton from '../ui/student-application-button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { INTERN_FORM_URL } from '../../lib/links';
import { RECORDS_PAGE } from '../../config/records';

const Footer = () => {
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Team', path: '/team' },
    { name: 'Program', path: '/program' },
    { name: 'FAQ', path: '/faq' },
    { name: RECORDS_PAGE.label, path: RECORDS_PAGE.path },
    { name: 'Hiring', path: '/hiring' },
  ];

  return (
    <footer className="relative overflow-hidden bg-[var(--primary-orange)] text-[var(--text-charcoal)] shadow-[0_-16px_40px_rgba(240,123,42,0.12)]">
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
            <Link to="/" className="inline-flex items-center gap-3 text-3xl md:text-4xl font-rammetto text-[var(--text-charcoal)]">
              <img src="/mascots/Logo.png" alt="Ignite" className="w-12 h-12 object-contain drop-shadow-md" />
              Ignite
            </Link>
            <p className="mt-5 text-xl md:text-2xl font-semibold leading-relaxed text-[var(--text-charcoal)]">
              A student-led initiative developing free online courses in practical life skills and career exploration.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <StudentApplicationButton className="ignite-button inline-flex items-center justify-center gap-2 bg-white text-[var(--text-charcoal)] px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg" />
              <a
                href={INTERN_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ignite-button inline-flex items-center justify-center gap-2 border-2 border-[var(--text-charcoal)] bg-transparent px-8 py-4 rounded-full font-bold text-lg text-[var(--text-charcoal)] hover:bg-white hover:text-[var(--text-charcoal)] transition-all"
              >
                Apply as an Intern
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:pt-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-charcoal)]">Explore</h2>
              <div className="mt-5 grid gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-lg font-semibold text-[var(--text-charcoal)] hover:text-[var(--text-charcoal)] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-charcoal)]">Program</h2>
              <div className="mt-5 grid gap-3 text-lg font-semibold text-[var(--text-charcoal)]">
                <p>Practical life skills</p>
                <p>Career exploration</p>
                <p>Courses in development</p>
                <Link to="/program" className="underline underline-offset-4">Check course availability</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--text-charcoal)] pt-6 flex flex-col gap-3 text-sm font-semibold text-[var(--text-charcoal)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ignite. All rights reserved.</p>
          <p>Student-led. Practical skills. A mission to keep learning free.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
