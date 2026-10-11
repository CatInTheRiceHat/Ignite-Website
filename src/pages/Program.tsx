import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, CalendarDays, Clock3 } from 'lucide-react';
import { coursesInDevelopment, learningFormats, type CourseFormat } from '../data/program';
import { LEARNING_HUB_URL } from '../lib/links';

const filters = [
  { id: 'all', label: 'All courses' },
  { id: 'independent', label: 'Learn independently' },
  { id: 'live', label: 'Learn live' },
] as const;

const Program = () => {
  const [format, setFormat] = useState<'all' | CourseFormat>('all');
  const visibleCourses = coursesInDevelopment.filter((course) => format === 'all' || course.format === format);

  return (
    <div className="bg-[var(--bg-cream)]">
      <section className="relative overflow-hidden bg-[var(--primary-orange)] py-20 text-center text-white shadow-lg">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-20 md:w-[46%] md:opacity-30">
          <img src="/mascots/Graduation.png" alt="" className="h-full w-full object-contain object-right-bottom" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-4">
          <h1 className="font-rammetto text-4xl sm:text-5xl md:text-7xl">The Program</h1>
          <p className="mt-6 text-xl leading-relaxed md:text-2xl">Practical skills. More ways to learn.</p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/95">
            Ignite is growing into a free practical-skills platform. We’re building independent courses
            alongside live classes to help students explore interests, practice useful skills, and create something of their own.
          </p>
          <a href="#courses" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-[var(--text-charcoal)] shadow-lg transition-colors hover:bg-orange-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white">
            Explore the courses<ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="py-20 md:py-24" aria-labelledby="learning-formats-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-widest text-[var(--text-light)]">Our next chapter</p>
            <h2 id="learning-formats-heading" className="mt-3 font-rammetto text-3xl text-[var(--primary-orange)] md:text-5xl">Two ways to learn</h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--text-light)]">
              These are the formats our team is developing. Each course will confirm its schedule,
              intended level, and requirements before enrollment opens.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {learningFormats.map((item) => (
              <article key={item.id} className="flex flex-col rounded-[2rem] border-2 border-orange-100 bg-white p-7 shadow-sm sm:p-10">
                <div className="flex items-center gap-5">
                  <img src={item.image} alt="" className="h-20 w-20 flex-none object-contain" loading="lazy" />
                  <div>
                    <p className="text-sm font-bold text-[var(--text-light)]">{item.label}</p>
                    <h3 className="mt-1 text-2xl font-bold text-[var(--text-charcoal)]">{item.title}</h3>
                  </div>
                </div>
                <div className="my-7 space-y-3 rounded-2xl bg-[var(--bg-cream)] p-5 font-bold text-[var(--text-charcoal)]">
                  <p className="flex items-center gap-3"><CalendarDays className="h-5 w-5 flex-none" aria-hidden="true" />{item.duration}</p>
                  <p className="flex items-center gap-3"><Clock3 className="h-5 w-5 flex-none" aria-hidden="true" />{item.commitment}</p>
                </div>
                <p className="text-lg leading-relaxed text-[var(--text-light)]">{item.description}</p>
                <p className="mt-5 text-base leading-relaxed text-[var(--text-light)]">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 md:py-24" aria-labelledby="learning-path-heading">
        <img src="/backgrounds/Program%20Overview.png" alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <h2 id="learning-path-heading" className="text-center font-rammetto text-3xl text-white md:text-5xl">Learn it. Try it. Make it yours.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-white">
            Independent courses are designed around short lessons, repeated practice, and a project that develops module by module.
          </p>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Explore the idea', description: 'Start with a short lesson, example, or demonstration.' },
              { title: 'Put it into practice', description: 'Try a guided activity and check what you understand.' },
              { title: 'Build and revise', description: 'Create a useful piece of work and improve it with feedback.' },
              { title: 'Bring it together', description: 'Combine what you’ve learned in a final project and reflection.' },
            ].map((step, index) => (
              <li key={step.title} className="rounded-3xl border border-white/30 bg-[rgba(26,26,46,0.85)] p-7 text-white backdrop-blur-sm">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white font-extrabold text-[var(--text-charcoal)]" aria-hidden="true">{index + 1}</span>
                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-white/95">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="courses" className="scroll-mt-52 py-20 md:py-24" aria-labelledby="courses-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 id="courses-heading" className="font-rammetto text-3xl text-[var(--primary-orange)] md:text-5xl">Courses we’re building</h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--text-light)]">
              {coursesInDevelopment.length} courses in development, from everyday life skills to creative and technical projects.
              This is a preview of our work, with availability announced separately for each course.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Filter courses by learning format">
            {filters.map((filter) => (
              <button key={filter.id} type="button" aria-pressed={format === filter.id} onClick={() => setFormat(filter.id)} className={`rounded-full border-2 px-5 py-3 font-bold transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-charcoal)] ${format === filter.id ? 'border-[var(--text-charcoal)] bg-[var(--text-charcoal)] text-white' : 'border-orange-100 bg-white text-[var(--text-charcoal)] hover:border-[var(--primary-orange)]'}`}>
                {filter.label}
              </button>
            ))}
          </div>
          <p className="my-8 text-center font-semibold text-[var(--text-light)]" aria-live="polite" aria-atomic="true">Showing {visibleCourses.length} courses in development</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.map((course) => (
              <article key={course.title} className="flex h-full flex-col rounded-[2rem] border-2 border-orange-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <img src={course.image} alt="" className="h-16 w-16 flex-none object-contain" loading="lazy" />
                  <span className="rounded-full bg-[var(--bg-cream)] px-3 py-2 text-xs font-extrabold text-[var(--text-charcoal)]">In development</span>
                </div>
                <p className="mt-5 text-sm font-bold text-[var(--text-light)]">{course.format === 'live' ? 'Learn live' : 'Learn independently'}</p>
                <h3 className="mt-2 text-xl font-bold leading-snug text-[var(--text-charcoal)]">{course.title}</h3>
                <p className="mt-4 flex-1 leading-relaxed text-[var(--text-light)]">{course.description}</p>
                {course.creators.length > 0 && <p className="mt-6 border-t border-orange-100 pt-4 text-sm leading-relaxed text-[var(--text-light)]"><span className="font-bold">Course development:</span> {course.creators.join(' & ')}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="next-chapter" className="scroll-mt-52 rounded-t-[4rem] bg-white py-20 md:py-24" aria-labelledby="next-chapter-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <BookOpenCheck className="mx-auto h-12 w-12 text-[var(--primary-orange)]" aria-hidden="true" />
            <h2 id="next-chapter-heading" className="mt-6 font-rammetto text-3xl text-[var(--primary-orange)] md:text-5xl">Where Ignite is going</h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-light)]">
              Our goal is a free platform for practical life skills that students can return to as their interests and needs grow.
              Summer 2026 was our first chapter. These are the next steps we’re working toward.
            </p>
          </div>
          <div className="my-12 grid gap-6 md:grid-cols-3">
            {[
              { title: 'A lasting course library', description: 'Develop reusable courses with clear activities, useful projects, and opportunities to improve work.' },
              { title: 'Stronger course quality', description: 'Work toward subject review, student testing, and support from experienced educators and advisors.' },
              { title: 'Reach more students', description: 'Build relationships with schools and community organizations, and explore future translation and international access.' },
            ].map((goal) => (
              <article key={goal.title} className="rounded-3xl bg-[var(--bg-cream)] p-8">
                <h3 className="text-xl font-bold text-[var(--text-charcoal)]">{goal.title}</h3>
                <p className="mt-4 leading-relaxed text-[var(--text-light)]">{goal.description}</p>
              </article>
            ))}
          </div>
          <div className="text-center">
            <a href={LEARNING_HUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--text-charcoal)] px-8 py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-[var(--text-light)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-orange)]">
              Visit the learning hub<ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-[var(--text-light)]">Check individual course announcements for enrollment details. Have a question? <Link to="/faq" className="font-bold text-[var(--text-charcoal)] underline underline-offset-4">Read the FAQ</Link> or <a href="mailto:ignitefindyourfire@gmail.com" className="font-bold text-[var(--text-charcoal)] underline underline-offset-4">contact our team</a>.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Program;
