import { RedirectArrow } from '../components/ui/redirect-arrow';
import { INTERN_FORM_URL } from '../lib/links';
import BlurFade from '../components/ui/blur-fade';
import FadingCarousel from '../components/ui/fading-carousel';
import { internRoles } from '../data/internRoles';

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
          <p className="mt-4 text-xl opacity-90 md:text-2xl">
            Apply to support Ignite as a student intern.
          </p>
        </div>
      </section>

      {/* Intern Application */}
      <section
        className="relative flex min-h-[74.667vw] flex-col overflow-hidden bg-[var(--bg-cream)] py-20 md:py-24"
        aria-labelledby="intern-application-heading"
      >
        <img
          src="/backgrounds/Hiring.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-bottom"
          loading="lazy"
        />
        <BlurFade className="relative z-10 mx-auto mb-12 max-w-4xl px-4 text-center md:mb-16">
          <h2
            id="intern-application-heading"
            className="text-balance font-rammetto text-3xl/[1.4] text-[var(--primary-orange)] sm:text-4xl/[1.4] md:text-5xl/[1.4]"
          >
            Interested in interning?
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[var(--text-charcoal)] md:text-xl">
            Explore the different ways you can help build Ignite. Select a role to see the work and payout details.
          </p>
        </BlurFade>
        <div className="relative z-10">
          <FadingCarousel items={internRoles} variant="dark" imageStyle="open" autoPlay={false} expandActiveOnly />
        </div>
        <div className="relative z-10 mx-auto mt-12 w-full max-w-4xl px-4 text-center md:mt-16">
          <a
            href={INTERN_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary-orange)] px-6 py-4 text-[1.1875rem] font-bold text-white shadow-lg transition-all hover:bg-[var(--primary-orange-dark)] motion-safe:hover:scale-105 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 sm:w-auto sm:px-10 sm:text-xl"
          >
            Open Intern Application
            <RedirectArrow />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Hiring;
