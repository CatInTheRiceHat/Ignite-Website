import { useState } from 'react';
import { Link } from 'react-router-dom';
import { courseCounts, courseFormats, developmentCourses, programCopy, type CourseFormat, type DevelopmentCourse } from '../data/program';
import ProgramNextSteps from '../components/program/ProgramNextSteps';
import Expansion from '../components/program/Expansion';

const CourseCard = ({ course }: { course: DevelopmentCourse }) => (
  <article className="bg-white rounded-[2rem] overflow-hidden hover:shadow-lg transition-shadow border-2 border-orange-100 h-full">
    {course.headerImage ? (
      <div className="overflow-hidden bg-orange-50">
        <img src={course.headerImage} alt="" className="block h-auto w-full" loading="lazy" />
      </div>
    ) : (
      <div className="h-32 sm:h-36 flex items-center justify-center bg-orange-50">
        <img src={course.icon} alt="" className="h-24 w-24 object-contain" loading="lazy" />
      </div>
    )}
    <div className="p-6 sm:p-8">
      <div className="flex flex-wrap gap-2 mb-4 text-sm font-bold text-[var(--text-charcoal)]">
        <span className="rounded-full bg-orange-100 px-3 py-1">{courseFormats[course.format].label}</span>
        <span className="rounded-full bg-[var(--bg-cream)] px-3 py-1">In development</span>
      </div>
      <h3 className="text-xl font-bold text-[var(--text-charcoal)] leading-snug">{course.title}</h3>
      <p className="mt-4 text-sm text-[var(--text-light)]">Planned format: {courseFormats[course.format].duration.toLowerCase()}</p>
    </div>
  </article>
);

const Program = () => {
  const [format, setFormat] = useState<CourseFormat | 'all'>('all');
  const visibleCourses = developmentCourses.filter((course) => format === 'all' || course.format === format);
  const filters = [
    { value: 'all', label: 'All courses' },
    { value: 'live', label: courseFormats.live.label },
    { value: 'independent', label: courseFormats.independent.label },
  ] as const;

  return (
    <div className="bg-[var(--bg-cream)]">
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
          <img src="/mascots/Graduation.png" alt="" className="h-full w-full object-contain object-right-bottom" loading="lazy" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">The Program</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4">Practical life skills. Two ways to learn.</p>
          <p className="max-w-2xl mx-auto mt-6 text-lg leading-relaxed">Live and independent courses are being developed. Explore what’s planned below.</p>
        </div>
      </section>

      <section className="py-20 md:py-24" aria-labelledby="formats-heading">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 id="formats-heading" className="text-3xl md:text-5xl font-rammetto text-[var(--primary-orange)]">Two Planned Formats</h2>
            <p className="text-[var(--text-light)] text-lg mt-6 max-w-3xl mx-auto leading-relaxed">{programCopy.direction}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(courseFormats).map(([key, item]) => (
              <article key={key} className="bg-white rounded-[2rem] overflow-hidden shadow-md border-2 border-orange-100">
                <div className="bg-[var(--primary-orange)] px-8 py-5">
                  <p className="text-sm font-bold text-white">Planned · {item.technicalLabel}</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{item.label} · {item.duration}</h3>
                </div>
                <div className="p-8">
                  <img src={item.icon} alt="" className="h-16 w-16 object-contain mb-5" loading="lazy" />
                  <p className="text-lg text-[var(--text-charcoal)] font-bold leading-relaxed mb-4">{item.commitment}</p>
                  <p className="text-[var(--text-light)] leading-relaxed">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center text-[var(--text-light)] leading-relaxed max-w-3xl mx-auto">{programCopy.availability}</p>
        </div>
      </section>

      <section className="py-24 md:py-32 relative overflow-hidden" aria-labelledby="learning-heading">
        <img src="/backgrounds/Program%20Overview.png" alt="" className="absolute inset-0 h-full w-full object-cover object-center" loading="lazy" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 id="learning-heading" className="text-3xl md:text-5xl font-rammetto text-center text-white mb-12 drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">Learn by Doing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '/mascots/Research.png', title: 'Learn & Practice', desc: 'The independent plans pair weekly lessons with practice and quizzes. Live plans include guided activities and discussion.' },
              { icon: '/mascots/Mentors.png', title: 'Feedback & Revision', desc: 'The draft formats include feedback so students can improve their applied work. Support details will vary by course.' },
              { icon: '/mascots/Project.png', title: 'A Final Project', desc: 'Both planned formats build toward a final project that shows how students can use what they learn.' },
            ].map((item) => (
              <div key={item.title} className="bg-[rgba(26,26,46,0.82)] backdrop-blur-md rounded-[2rem] p-8 text-center shadow-lg border border-white/30">
                <img src={item.icon} alt="" className="h-14 w-14 mx-auto object-contain mb-5" loading="lazy" />
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/90 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="course-catalog" className="py-20 md:py-24 scroll-mt-48" aria-labelledby="catalog-heading">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 id="catalog-heading" className="text-3xl md:text-5xl font-rammetto text-[var(--primary-orange)]">Courses in Development</h2>
            <p className="text-[var(--text-light)] text-lg mt-6 max-w-2xl mx-auto">{courseCounts.all} course plans: {courseCounts.live} live and {courseCounts.independent} independent. Every course below is in development.</p>
          </div>
          <div role="group" aria-label="Filter courses by planned format" className="flex flex-wrap justify-center gap-3 mb-6">
            {filters.map((filter) => (
              <button key={filter.value} type="button" aria-pressed={format === filter.value} aria-controls="development-courses" onClick={() => setFormat(filter.value)} className={`min-h-12 px-6 py-3 rounded-full font-bold border-2 transition-colors ${format === filter.value ? 'bg-[var(--text-charcoal)] border-[var(--text-charcoal)] text-white' : 'bg-white border-orange-200 text-[var(--text-charcoal)] hover:bg-orange-50'}`}>
                {filter.label} ({courseCounts[filter.value]})
              </button>
            ))}
          </div>
          <p role="status" aria-live="polite" aria-atomic="true" className="text-center text-[var(--text-light)] mb-8">
            Showing {visibleCourses.length} {format === 'all' ? '' : `${courseFormats[format].label.toLowerCase()} `}courses in development.
          </p>
          <div id="development-courses" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {visibleCourses.map((course) => <CourseCard key={course.title} course={course} />)}
          </div>
          <div className="mt-10 bg-white rounded-[2rem] p-8 border-2 border-orange-100">
            <h3 className="text-xl font-bold text-[var(--text-charcoal)] mb-3">Eligibility: To Be Confirmed</h3>
            <p className="text-[var(--text-light)] leading-relaxed">{programCopy.eligibility}</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-rammetto text-[var(--primary-orange)] mb-5">Our Summer 2026 Foundation</h2>
          <p className="text-lg text-[var(--text-light)] leading-relaxed mb-6">Summer 2026 brought six subjects and ten live cohorts together over three weeks. Those past results are helping shape the next chapter.</p>
          <Link to="/records" className="inline-flex rounded-full bg-orange-50 px-6 py-3 font-bold text-[var(--text-charcoal)] hover:bg-orange-100 transition-colors">See Summer 2026 Results</Link>
        </div>
      </section>
      <Expansion />
      <ProgramNextSteps />
    </div>
  );
};

export default Program;
