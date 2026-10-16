import { ArrowRight } from 'lucide-react';
import { getGoogleFormLinks, PARTNERSHIP_FORM_URL } from '../../lib/links';

const PartnershipApplication = () => {
  const form = getGoogleFormLinks(PARTNERSHIP_FORM_URL);

  return (
    <section id="partnership-application" tabIndex={-1} className="scroll-mt-44 rounded-t-[4rem] bg-white py-24 focus:outline-none" aria-labelledby="partnership-application-heading">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="partnership-application-heading" className="text-balance font-rammetto text-3xl/[1.4] text-[var(--primary-orange)] sm:text-4xl/[1.4] md:text-5xl/[1.4]">Let’s explore a partnership.</h2>
          <p className="mt-8 text-lg leading-relaxed text-[var(--text-light)] md:text-xl">
            You don’t need a polished proposal or an established organization to reach out. Tell us what you have in mind, who it would help, and how we could work together.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {form ? (
            <>
              {form.embedUrl ? (
                <iframe src={form.embedUrl} title="Ignite Partnership Application Google Form" className="h-[1400px] w-full rounded-2xl border-0 bg-white md:h-[1200px]" loading="lazy" />
              ) : null}
              <div className="flex justify-center">
                <a href={form.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--primary-orange)] px-6 py-4 text-xl font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-[var(--primary-orange-dark)] motion-safe:hover:scale-105 motion-safe:active:scale-95 sm:px-8">
                  Open partnership application
                  <ArrowRight className="h-5 w-5 flex-none" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </>
          ) : (
            <p className="mx-auto max-w-xl text-center text-lg leading-relaxed text-[var(--text-light)]">
              Our partnership application will be available here once it’s ready. We look forward to hearing your ideas.
            </p>
          )}
        </div>

      </div>
    </section>
  );
};

export default PartnershipApplication;
