import { useReducedMotion } from 'framer-motion';
import { confirmedPartners, type Partner } from '../../data/partnerships';

const PartnerLogo = ({ partner, duplicate = false }: { partner: Partner; duplicate?: boolean }) => {
  const logo = (
    <>
      {partner.logo && <img src={partner.logo} alt={`${partner.name} logo`} className="h-32 w-52 object-contain sm:h-44 sm:w-72" loading="eager" decoding="async" />}
      <span className="sr-only">{partner.name}</span>
    </>
  );

  return (
    <li aria-hidden={duplicate || undefined} className="w-72 shrink-0 sm:w-96">
      {partner.website ? (
        <a href={partner.website} target="_blank" rel="noopener noreferrer" tabIndex={duplicate ? -1 : undefined} aria-label={`Visit ${partner.name} (opens in a new tab)`} className="flex h-52 w-full items-center justify-center rounded-lg px-8 sm:h-64">
          {logo}
        </a>
      ) : (
        <div className="flex h-52 w-full items-center justify-center px-8 sm:h-64">{logo}</div>
      )}
    </li>
  );
};

const Partners = () => {
  const reducedMotion = useReducedMotion();
  if (confirmedPartners.length === 0) return null;

  // Each identical group is wider than the viewport, so the loop never reveals a gap.
  const repeatedPartners = Array.from(
    { length: Math.max(3, Math.ceil(6 / confirmedPartners.length)) },
    () => confirmedPartners,
  ).flat();

  return (
    <section className="group/partners rounded-[3rem] bg-white py-24 md:rounded-[4rem]" aria-labelledby="partners-heading">
      <h2 id="partners-heading" className="px-4 text-balance text-center font-rammetto text-3xl/[1.4] text-[var(--primary-orange)] sm:text-4xl/[1.4] md:text-5xl/[1.4]">Our partners</h2>

      {reducedMotion ? (
        <ul className="mx-auto mt-12 flex max-w-7xl flex-wrap items-center justify-center px-4 md:mt-16" aria-label="Ignite partners">
          {confirmedPartners.map(partner => <PartnerLogo key={partner.name} partner={partner} />)}
        </ul>
      ) : (
        <div className="group/track mx-auto mt-12 flex max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_8%,white_92%,transparent)] md:mt-16">
          {[0, 1].map(group => (
            <ul
              key={group}
              aria-label={group === 0 ? 'Ignite partners' : undefined}
              aria-hidden={group === 1 || undefined}
              className="flex w-max shrink-0 animate-marquee-reverse items-center group-hover/partners:[animation-play-state:paused] group-focus-within/track:animate-none motion-reduce:animate-none"
            >
              {repeatedPartners.map((partner, index) => (
                <PartnerLogo key={`${partner.name}-${index}`} partner={partner} duplicate={group === 1 || index >= confirmedPartners.length} />
              ))}
            </ul>
          ))}
        </div>
      )}

    </section>
  );
};

export default Partners;
