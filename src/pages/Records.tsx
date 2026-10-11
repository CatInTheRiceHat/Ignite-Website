import { useEffect, type ReactNode } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Globe2,
  GraduationCap,
  School,
  UsersRound,
} from 'lucide-react';
import StaffImage from '../components/ui/staff-image';
import { RECORDS_PAGE } from '../config/records';
import { mentors } from '../data/mentors';
import { APPLY_FORM_URL, INTERN_FORM_URL } from '../lib/links';

const recordTeam = mentors;

const statistics = {
  applications: 110,
  courseSelections: 295,
  schools: 77,
  countriesAndRegions: 5,
  liveCohorts: 10,
  programWeeks: 3,
  mentors: 10,
} as const;

const studentWork = [
  {
    course: 'Project / Nonprofit Building',
    title: 'Cleanse Nonprofit',
    description: 'A student project pitch exploring the dangers of misinformation.',
    image: '/assets/StudentProject.png',
    alt: 'Cover slide for a student Cleanse Nonprofit project pitch about misinformation',
  },
  {
    course: 'Marketing & Digital Design',
    title: 'Nice Tea campaign',
    description: 'A student-created promotional design featuring products, store details, and a special offer.',
    image: '/assets/StudentDesign.png',
    alt: 'Student promotional design for Nice Tea with drinks, pastries, store hours, and an offer',
  },
  {
    course: 'Science Research',
    title: 'Plant light-absorption study',
    description: 'A student research results page comparing basil growth under red, green, blue, and white light.',
    image: '/assets/StudentResearch.png',
    alt: 'Student science research results comparing basil plant growth under red, green, blue, and white light',
  },
];

const SectionHeading = ({
  eyebrow,
  title,
  children,
  id,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  id: string;
}) => (
  <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
    <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--text-charcoal)]">
      {eyebrow}
    </p>
    <h2
      id={id}
      className="mt-3 font-rammetto text-[2rem] text-[var(--primary-orange)] sm:text-4xl md:text-5xl"
    >
      {title}
    </h2>
    <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--text-light)] md:text-xl">
      {children}
    </p>
  </div>
);

const Records = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;

    document.title = RECORDS_PAGE.metaTitle;
    if (description) description.content = RECORDS_PAGE.metaDescription;

    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  return (
    <div className="overflow-hidden bg-[var(--bg-cream)]">
      <section className="relative overflow-hidden bg-[var(--primary-orange)] py-20 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-20 sm:opacity-25 md:w-[46%] md:opacity-30">
          <img
            src="/mascots/Trophy.png"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            loading="eager"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
          <h1 className="font-rammetto text-5xl text-white md:text-7xl">{RECORDS_PAGE.label}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-xl font-semibold leading-relaxed text-white/90 md:text-2xl">
            A look inside Ignite&apos;s student-led learning environment.
          </p>
        </div>
      </section>

      <section
        className="rounded-b-[3rem] bg-white py-20 md:rounded-b-[4rem] md:py-24"
        aria-labelledby="records-statistics-heading"
      >
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading eyebrow="2026 summer" title="The story behind the numbers" id="records-statistics-heading">
            A visual snapshot of how far Ignite reached and what it took to bring the program to life.
          </SectionHeading>

          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <article className="relative overflow-hidden rounded-[2.5rem] bg-[var(--primary-orange)] p-7 text-white shadow-xl shadow-orange-100 sm:p-9 md:p-10">
              <div className="relative z-10">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-white/75">Interest &amp; choice</p>
                <h3 className="mt-3 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
                  Students came ready to explore.
                </h3>
                <dl className="mt-8 grid grid-cols-2 gap-3 sm:gap-5">
                  <div className="rounded-3xl bg-white/15 p-5 backdrop-blur-sm sm:p-6">
                    <UsersRound className="h-7 w-7" aria-hidden="true" />
                    <dd className="mt-5 font-rammetto text-4xl leading-none text-white sm:text-5xl md:text-6xl">
                      {statistics.applications}
                    </dd>
                    <dt className="mt-3 font-bold text-white/90">Applications</dt>
                  </div>
                  <div className="rounded-3xl bg-white p-5 text-[var(--text-charcoal)] shadow-lg sm:p-6">
                    <BookOpenCheck className="h-7 w-7 text-[var(--primary-orange)]" aria-hidden="true" />
                    <dd className="mt-5 font-rammetto text-4xl leading-none text-[var(--primary-orange)] sm:text-5xl md:text-6xl">
                      {statistics.courseSelections}
                    </dd>
                    <dt className="mt-3 font-bold">Course selections</dt>
                  </div>
                </dl>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[2.5rem] border-2 border-orange-100 bg-[var(--bg-cream)] p-7 shadow-sm sm:p-9 md:p-10">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-orange-100 text-[var(--primary-orange)]">
                  <Globe2 className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--primary-orange)]">Program reach</p>
                  <h3 className="mt-1 text-2xl font-bold text-[var(--text-charcoal)]">A wide Ignite community</h3>
                </div>
              </div>
              <dl className="mt-8 space-y-5">
                <div className="flex items-end justify-between gap-4 border-b-2 border-orange-100 pb-5">
                  <dt className="flex items-center gap-3 font-bold text-[var(--text-charcoal)]">
                    <School className="h-6 w-6 text-[var(--primary-orange)]" aria-hidden="true" />
                    Schools
                  </dt>
                  <dd className="font-rammetto text-5xl leading-none text-[var(--primary-orange)]">
                    {statistics.schools}
                  </dd>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <dt className="max-w-36 font-bold leading-snug text-[var(--text-charcoal)]">Countries / regions</dt>
                  <dd className="font-rammetto text-5xl leading-none text-[var(--primary-orange)]">
                    {statistics.countriesAndRegions}
                  </dd>
                </div>
              </dl>
              <div className="mt-8 flex gap-2" aria-hidden="true">
                {Array.from({ length: statistics.countriesAndRegions }, (_, index) => (
                  <span
                    key={index}
                    className="h-3 flex-1 rounded-full bg-[var(--primary-orange)] first:bg-[var(--primary-orange-dark)]"
                  />
                ))}
              </div>
            </article>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2.5rem] border-2 border-orange-100 bg-[var(--bg-cream)] p-7 shadow-sm sm:p-9 md:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--primary-orange)]">Live learning</p>
                  <h3 className="mt-2 text-2xl font-bold text-[var(--text-charcoal)] sm:text-3xl">Built around real-time connection</h3>
                </div>
                <CalendarDays className="h-10 w-10 flex-none text-[var(--primary-orange)]" aria-hidden="true" />
              </div>
              <dl className="mt-8 grid grid-cols-2 gap-4">
                <div>
                  <dd className="font-rammetto text-5xl leading-none text-[var(--primary-orange)]">
                    {statistics.liveCohorts}
                  </dd>
                  <dt className="mt-3 font-bold text-[var(--text-charcoal)]">Live cohorts</dt>
                </div>
                <div className="border-l-2 border-orange-100 pl-5">
                  <dd className="font-rammetto text-5xl leading-none text-[var(--primary-orange)]">
                    {statistics.programWeeks}
                  </dd>
                  <dt className="mt-3 font-bold text-[var(--text-charcoal)]">Program weeks</dt>
                </div>
              </dl>
              <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl bg-white shadow-sm">
                <img
                  src="/assets/Summer1.webp"
                  alt="Ignite Project and Nonprofit Building lesson slide about why students build projects"
                  className="h-full w-full origin-left scale-105 object-cover object-left"
                  loading="lazy"
                />
                <div className="absolute bottom-3 right-3 aspect-[647/376] w-[40%] overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg sm:bottom-4 sm:right-4">
                  <img
                    src="/assets/live-learning-instructor.webp"
                    alt="Ignite instructor leading a live online lesson"
                    className="h-full w-full scale-[1.05] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[2.5rem] bg-[var(--text-charcoal)] p-7 text-white shadow-xl sm:p-9 md:p-10">
              <GraduationCap className="absolute -right-8 -top-10 h-48 w-48 text-white/5" aria-hidden="true" />
              <div className="relative z-10">
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-orange-300">Team-powered</p>
                <div className="mt-3 flex items-end gap-4">
                  <span className="font-rammetto text-6xl leading-none text-white">{statistics.mentors}</span>
                  <h3 className="max-w-48 pb-1 text-2xl font-bold leading-tight text-white">Mentors</h3>
                </div>
                <div className="mt-8 grid grid-cols-4 gap-2">
                  {recordTeam.map((member) => (
                    <div key={member.name} className="aspect-square overflow-hidden rounded-xl bg-white/10 ring-2 ring-white/10">
                      <StaffImage
                        src={member.image}
                        alt={`${member.name}, Ignite team member`}
                        title={member.name}
                        className="h-full w-full object-cover object-top"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                <a
                  href={INTERN_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[var(--text-charcoal)] shadow-lg transition-all hover:scale-105 hover:text-[var(--primary-orange)] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
                >
                  Apply as an Intern
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
              </div>
            </article>
          </div>

          <p className="mt-8 text-center text-sm font-semibold text-[var(--text-light)]">
            Source: Ignite 2026 Summer Statistics
          </p>
        </div>
      </section>

      <section
        className="py-16 md:py-20"
        aria-labelledby="student-work-heading"
      >
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading eyebrow="Projects and capstones" title="Student work" id="student-work-heading">
            A selection of student-created projects showing how course skills become meaningful final work.
          </SectionHeading>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studentWork.map((item) => (
              <article
                key={item.course}
                className="flex h-full flex-col overflow-hidden rounded-[2rem] border-2 border-orange-50 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
              >
                <div className="aspect-[16/10] overflow-hidden bg-white">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="h-full w-full object-cover object-top"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--primary-orange)]">
                    {item.course}
                  </p>
                  <h3 className="mt-2 text-xl font-bold leading-snug text-[var(--text-charcoal)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-[var(--text-light)]">{item.description}</p>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      <section className="rounded-t-[4rem] bg-white py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 font-rammetto text-4xl text-[var(--primary-orange)]">Apply Now!</h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[var(--text-light)]">
            Applications are open for our online summer program. Students can apply for free and choose the courses
            that fit their schedule.
          </p>
          <a
            href={APPLY_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary-orange)] px-10 py-5 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-orange-200 active:scale-95"
          >
            Apply Now
            <ArrowRight className="h-5 w-5 flex-none" aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Records;
