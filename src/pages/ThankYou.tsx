import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const celebrationGif = import.meta.glob<string>('/src/assets/thank-you.gif', {
  eager: true,
  query: '?url',
  import: 'default',
})['/src/assets/thank-you.gif'];

const ThankYou = () => (
  <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
    <Link to="/" className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-display text-lg font-bold text-[var(--text-charcoal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
      <img src="/mascots/Socials%20Logo.png" alt="" className="h-8 w-8 rounded-lg object-contain" />
      Ignite
    </Link>

    <section aria-labelledby="thank-you-heading" className="w-full rounded-[2rem] border border-orange-100 bg-white px-5 py-8 text-center shadow-[0_16px_48px_rgba(131,58,24,0.09)] sm:px-12 sm:py-10">
      <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-orange-900">
        <Check aria-hidden="true" size={16} />
        Pre-enrollment received
      </div>
      <h1 id="thank-you-heading" className="mt-4 text-balance font-rammetto text-3xl leading-tight text-[var(--text-charcoal)] sm:text-5xl">
        You’re on the list!
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[var(--text-light)] sm:text-lg">
        Thanks for pre-enrolling with Ignite. We’re excited to help you find a skill that sparks your curiosity.
      </p>

      <picture className="mx-auto my-5 flex aspect-square w-full max-w-48 items-center justify-center overflow-hidden rounded-3xl bg-[var(--bg-cream)] sm:max-w-52">
        {celebrationGif && <source media="(prefers-reduced-motion: no-preference)" srcSet={celebrationGif} />}
        <img src="/mascots/Celebrate.png" alt="" width={1422} height={1422} className="h-full w-full object-contain" />
      </picture>

      <div className="mx-auto max-w-md rounded-2xl bg-[var(--bg-cream)] px-4 py-4 sm:px-6">
        <h2 className="font-display text-base font-bold text-[var(--text-charcoal)]">What happens next?</h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--text-light)] sm:text-base">
          We’ll email you when we have updates on course availability and how to enroll. All Ignite courses are free.
        </p>
      </div>
      <Link to="/program" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-800 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
        Explore our courses <ArrowRight aria-hidden="true" size={18} />
      </Link>
    </section>
  </div>
);

export default ThankYou;
