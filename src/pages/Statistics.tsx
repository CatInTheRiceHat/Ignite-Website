import {
  BookOpenCheck,
  CalendarDays,
  Globe2,
  GraduationCap,
  School,
  UsersRound,
} from 'lucide-react';
import BlurFade from '../components/ui/blur-fade';

const reachStatistics = [
  { value: '110', label: 'Applications', icon: UsersRound },
  { value: '295', label: 'Course selections', icon: BookOpenCheck },
  { value: '77', label: 'Schools', icon: School },
  { value: 'Five', label: 'Countries / regions', icon: Globe2 },
];

const Statistics = () => {
  return (
    <div className="overflow-hidden bg-[var(--bg-cream)]">
      <section className="relative overflow-hidden bg-[var(--primary-orange)] py-20 text-center text-white shadow-lg">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-20 sm:opacity-25 md:w-[46%] md:opacity-30">
          <img
            src="/mascots/Trophy.png"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            loading="eager"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <h1 className="font-rammetto text-[2.7rem] text-white sm:text-5xl md:text-7xl">
            <span className="block">2026 Summer</span>
            <span className="mt-3 block md:mt-5"> Statistics</span>
          </h1>
        </div>
      </section>

      <section aria-labelledby="reach-heading" className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <BlurFade>
            <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
              <h2
                id="reach-heading"
                className="font-rammetto text-4xl text-[var(--primary-orange)] md:text-5xl"
              >
                Applications &amp; Reach
              </h2>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {reachStatistics.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <BlurFade key={stat.label} delay={index * 0.07}>
                  <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-[2rem] border-2 border-orange-50 bg-white px-6 py-10 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-[var(--primary-orange)]">
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <p className="order-2 mt-4 text-lg font-bold text-[var(--text-charcoal)]">
                      {stat.label}
                    </p>
                    <p className="order-1 font-rammetto text-5xl leading-none text-[var(--primary-orange)] lg:text-[3.35rem]">
                      {stat.value}
                    </p>
                  </div>
                </BlurFade>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="delivery-heading" className="rounded-[3rem] bg-white py-20 md:rounded-[4rem] md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
          <BlurFade className="order-2 lg:order-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-orange-100 shadow-xl">
              <img
                src="/courses/Communication.jpeg"
                alt="Ignite mascots collaborating around a table with laptops and notebooks"
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </BlurFade>

          <BlurFade className="order-1 lg:order-2" delay={0.08}>
            <div className="text-center lg:text-left">
              <h2
                id="delivery-heading"
                className="font-rammetto text-4xl text-[var(--primary-orange)] md:text-5xl"
              >
                Program Delivery
              </h2>

              <dl className="mt-8 grid grid-cols-2 gap-4 sm:gap-6">
                <div className="flex flex-col rounded-3xl bg-[var(--bg-cream)] px-4 py-8 text-center sm:px-6">
                  <dt className="order-2 mt-3 font-bold text-[var(--text-charcoal)]">Live cohorts</dt>
                  <dd className="order-1 font-rammetto text-4xl text-[var(--primary-orange)] sm:text-5xl">10</dd>
                </div>
                <div className="flex flex-col rounded-3xl bg-[var(--bg-cream)] px-4 py-8 text-center sm:px-6">
                  <dt className="order-2 mt-3 font-bold text-[var(--text-charcoal)]">Weeks</dt>
                  <dd className="order-1 font-rammetto text-4xl text-[var(--primary-orange)] sm:text-5xl">Three</dd>
                </div>
              </dl>
            </div>
          </BlurFade>
        </div>
      </section>

      <section aria-labelledby="mentors-heading" className="py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
          <BlurFade>
            <div className="mx-auto max-w-xl text-center lg:text-left">
              <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-[var(--primary-orange)] lg:mx-0">
                <GraduationCap className="h-8 w-8" aria-hidden="true" />
              </div>
              <h2
                id="mentors-heading"
                className="font-rammetto text-4xl text-[var(--primary-orange)] md:text-5xl"
              >
                Team
              </h2>
              <div className="mt-8 flex items-center justify-center gap-5 lg:justify-start">
                <span className="font-rammetto text-6xl leading-none text-[var(--text-charcoal)] md:text-7xl">10</span>
                <span className="max-w-40 text-left text-xl font-bold leading-snug text-[var(--text-charcoal)] md:text-2xl">
                  Interns trained
                </span>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.08}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-orange-100 shadow-xl">
              <img
                src="/courses/Digital%20Design.jpeg"
                alt="Ignite mascot displaying artwork on an easel"
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </BlurFade>
        </div>
      </section>

      <section className="bg-[var(--primary-orange)] py-8" aria-label="2026 summer statistics summary">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 text-center text-white sm:flex-row sm:gap-5">
          <CalendarDays className="h-7 w-7 flex-none" aria-hidden="true" />
          <p className="text-lg font-bold sm:text-xl">
            10 live cohorts over three weeks
          </p>
        </div>
      </section>
    </div>
  );
};

export default Statistics;
