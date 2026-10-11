import { ArrowUpRight } from 'lucide-react';

type RecognitionEntry = {
  name: string;
} & (
  | { status: 'pending'; sourceUrl?: string; missingInputs: string[] }
  | {
      status: 'verified';
      relationship: 'Partner' | 'Featured in' | 'Listed on';
      description: string;
      sourceUrl: string;
      context?: { text: string; sourceUrl: string };
      internApplicationUrl?: string;
    }
);

// Add a verified entry only after confirming its relationship and source link.
// Use text names until approved logo assets and usage permission are supplied.
// Evidence reviewed: "2026-27 Ignite Plan" (2026-10-10) and
// "Ignite One Pager" (2026-10-06) in Ignite's connected Drive, the user's
// supplied listing/application URLs, and TeenLife's About Us page.
const entries: RecognitionEntry[] = [
  {
    name: 'Doorstop Education',
    status: 'pending',
    sourceUrl: 'https://doorstopeducation.org/',
    missingInputs: ['Confirmed partnership and its scope'],
  },
  {
    name: 'TeenLife',
    status: 'verified',
    relationship: 'Listed on',
    description: 'Explore Ignite’s paid internship listing in TeenLife’s enrichment directory.',
    sourceUrl: 'https://www.teenlife.com/l/enrichment/ignite-paid-internship/',
    // Corporate ownership explains the U.S. News connection. This is a
    // directory listing, not editorial coverage or an endorsement of Ignite.
    context: {
      text: 'TeenLife is part of U.S. News & World Report.',
      sourceUrl: 'https://www.teenlife.com/about-us/',
    },
    internApplicationUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSczl9i6dtC2R92JWz8kC43AZ_VJmnOJgmqys4yOG1j-OWHvKg/viewform?usp=send_form',
  },
];

export default function RecognitionSection() {
  const verifiedEntries = entries.filter((entry) => entry.status === 'verified');
  if (verifiedEntries.length === 0) return null;

  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="home-recognition-heading">
      <div className="mx-auto max-w-7xl px-4">
        <h2 id="home-recognition-heading" className="mb-10 text-center font-rammetto text-3xl text-[var(--text-charcoal)] sm:text-4xl md:text-5xl">
          Partnerships &amp; Recognition
        </h2>
        <div className={`mx-auto grid gap-6 ${verifiedEntries.length === 1 ? 'max-w-3xl' : 'md:grid-cols-2'}`}>
          {verifiedEntries.map((entry) => (
            <article key={entry.name} className="flex flex-col rounded-3xl border border-orange-100 bg-[var(--bg-cream)] p-6 sm:p-8">
              <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--text-light)]">{entry.relationship}</p>
              <h3 className="text-2xl font-bold text-[var(--text-charcoal)]">{entry.name}</h3>
              <p className="mt-3 text-lg leading-relaxed text-[var(--text-light)]">{entry.description}</p>
              {entry.context && (
                <p className="mt-3 text-base leading-relaxed text-[var(--text-light)]">
                  <a href={entry.context.sourceUrl} target="_blank" rel="noopener noreferrer" className="rounded underline decoration-orange-300 underline-offset-4 hover:decoration-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-charcoal)]">
                    {entry.context.text}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
              )}
              <div className="mt-auto flex flex-col gap-4 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <a
                  href={entry.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg font-bold text-[var(--text-charcoal)] underline decoration-orange-300 underline-offset-4 hover:decoration-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-charcoal)]"
                >
                  {entry.relationship === 'Partner' ? 'About the partnership' : entry.relationship === 'Listed on' ? 'View the listing' : 'Read the feature'}
                  <span className="sr-only">: {entry.name} (opens in a new tab)</span>
                  <ArrowUpRight className="h-5 w-5 flex-none" aria-hidden="true" />
                </a>
                {entry.internApplicationUrl && (
                  <a href={entry.internApplicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--text-charcoal)] px-6 py-3 font-bold text-white transition-colors hover:bg-[var(--text-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-charcoal)]">
                    Apply as an Intern
                    <ArrowUpRight className="h-5 w-5 flex-none" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
