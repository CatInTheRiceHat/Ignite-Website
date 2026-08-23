import { ExternalLink, Mail } from 'lucide-react';
import { INTERN_FORM_URL } from '../lib/links';

const Hiring = () => {
  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-[var(--primary-orange)] py-20 text-center text-white shadow-lg">
        <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
          <img
            src="/mascots/Laptop.png"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            loading="lazy"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">Hiring</h1>
          <p className="mt-4 text-xl leading-relaxed opacity-90 md:text-2xl">
            Apply to support Ignite as a student intern.
          </p>
        </div>
      </section>

      {/* Intern Application */}
      <section
        className="rounded-t-[4rem] bg-white py-20 md:py-24"
        aria-labelledby="intern-application-heading"
      >
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2
            id="intern-application-heading"
            className="font-rammetto text-4xl text-[var(--primary-orange)] md:text-5xl"
          >
            Interested in interning?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-light)] md:text-xl">
            Use the button below to open the intern application.
          </p>

          <a
            href={INTERN_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary-orange)] px-6 py-4 text-[1.1875rem] font-bold text-white shadow-lg shadow-orange-100 transition-all hover:scale-105 hover:bg-[var(--primary-orange-dark)] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 sm:w-auto sm:px-10 sm:text-xl"
          >
            Open Intern Application
            <ExternalLink className="h-5 w-5 flex-none" aria-hidden="true" />
          </a>

          <div className="mx-auto mt-10 max-w-2xl border-t border-orange-100 pt-8">
            <p className="text-[var(--text-light)] leading-relaxed">
              Have a question about the application?
            </p>
            <a
              href="mailto:ignitefindyourfire@gmail.com"
              className="mt-3 inline-flex max-w-full items-center justify-center gap-2 break-all rounded-lg font-bold text-[var(--text-charcoal)] underline decoration-2 decoration-[var(--primary-orange)] underline-offset-4 hover:text-[var(--primary-orange)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              <Mail className="h-5 w-5 flex-none" aria-hidden="true" />
              ignitefindyourfire@gmail.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hiring;
