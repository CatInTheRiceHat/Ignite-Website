import { useState } from 'react';
import { Link } from 'react-router-dom';
import { featuredCourse } from '../config/courseDemo';
import { courseCounts, courseFields, courseFormats, developmentCourses, programCopy, type CourseField, type CourseFormat, type DevelopmentCourse } from '../data/program';
import ProgramNextSteps from '../components/program/ProgramNextSteps';
import { STUDENT_PREENROLLMENT_URL } from '../lib/links';
import { RedirectArrow } from '../components/ui/redirect-arrow';

const CourseCard = ({ course }: { course: DevelopmentCourse }) => {
  const summary = course.description?.trim() || 'Course in progress.';
  const instructors = course.instructors ?? [];

  return (
    <article className="flex h-full min-w-0 flex-col bg-white rounded-[2rem] overflow-hidden hover:shadow-lg transition-shadow border-2 border-orange-100">
      {course.headerImage ? (
        <div className="aspect-[43/24] w-full shrink-0 overflow-hidden bg-orange-50">
          <img src={course.headerImage} alt="" width={2752} height={1536} className="block h-full w-full object-contain" loading="lazy" />
        </div>
      ) : (
        <div className="aspect-[43/24] w-full shrink-0 flex items-center justify-center bg-orange-50">
          <img src={course.icon} alt="" className="h-24 w-24 object-contain" loading="lazy" />
        </div>
      )}
      <div className="grid min-h-[22rem] min-w-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[1.5rem_3.5rem_minmax(4.5rem,1fr)_auto] gap-4 p-6 sm:p-8">
        <div className="flex gap-2 whitespace-nowrap text-xs font-bold text-[var(--text-charcoal)]">
          <span className="rounded-full bg-orange-100 px-3 py-1">{courseFormats[course.format].label}</span>
          <span className="rounded-full bg-[var(--bg-cream)] px-3 py-1">In development</span>
        </div>
        <h4 className="line-clamp-2 text-xl font-bold text-[var(--text-charcoal)] leading-snug" title={course.title}>{course.title}</h4>
        <div className="min-h-0 overflow-hidden">
          <p className="line-clamp-3 text-sm leading-relaxed text-[var(--text-light)]" title={summary}>{summary}</p>
        </div>
        <footer className={`flex min-w-0 flex-col items-center justify-center rounded-2xl bg-[var(--bg-cream)] px-4 py-4 text-center text-sm text-[var(--text-light)] ${instructors.length > 1 ? 'min-h-[6.5rem]' : 'min-h-[5.5rem]'}`}>
          <p className="font-bold text-[var(--text-charcoal)]">{instructors.length > 1 ? 'Teachers' : 'Teacher'}</p>
          {instructors.length > 0 ? (
            <ul className="mt-1 w-full space-y-1">
              {instructors.map((instructor) => (
                <li key={instructor.name} className="break-words leading-5" title={`${instructor.displayName ?? instructor.name}${instructor.grades ? ` · Grades ${instructor.grades}` : ''}`}>
                  {instructor.displayName ?? instructor.name}{instructor.grades ? ` · Grades ${instructor.grades}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 leading-5">Not yet listed.</p>
          )}
        </footer>
      </div>
    </article>
  );
};

const Program = () => {
  const [format, setFormat] = useState<CourseFormat | 'all'>('all');
  const [field, setField] = useState<CourseField | 'all'>('all');
  const coursesForFormat = developmentCourses.filter((course) => format === 'all' || course.format === format);
  const coursesForField = developmentCourses.filter((course) => field === 'all' || course.field === field);
  const visibleCourses = coursesForFormat.filter((course) => field === 'all' || course.field === field);
  const visibleGroups = courseFields.map((group) => ({
    ...group,
    courses: visibleCourses.filter((course) => course.field === group.id),
  })).filter((group) => group.courses.length > 0);
  const formatCounts = {
    all: coursesForField.length,
    live: coursesForField.filter((course) => course.format === 'live').length,
    independent: coursesForField.filter((course) => course.format === 'independent').length,
  };
  const filters = [
    { value: 'all', label: 'All formats' },
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
          <p className="mt-6 text-lg font-bold">Student pre-enrollment is now open.</p>
          <a href={STUDENT_PREENROLLMENT_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-[var(--primary-orange)] shadow-lg transition-transform hover:scale-105 active:scale-95 font-sans font-bold text-button">
            Enroll Now
            <RedirectArrow />
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="sample-week-heading">
        <div className="flex flex-col gap-6 rounded-[2rem] border-2 border-orange-100 bg-white p-7 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-2xl"><p className="text-sm font-bold text-[var(--text-light)]">A complete sample week · No account needed</p><h2 id="sample-week-heading" className="mt-2 text-2xl md:text-3xl">Experience learning on Ignite.</h2><p className="mt-3 text-[var(--text-light)]">Explore Week {featuredCourse.weekNumber} of {featuredCourse.course.title}. {featuredCourse.summary} {featuredCourse.workload}, at your pace.</p></div>
          <Link to={featuredCourse.path} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--primary-orange)] px-7 py-4 text-white transition-colors hover:bg-[var(--primary-orange-dark)] font-sans font-bold text-button">Explore a sample week<RedirectArrow /></Link>
        </div>
      </section>

      <div className="relative isolate overflow-hidden">
        <img src="/backgrounds/Program.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-center" loading="lazy" />
        <div className="absolute inset-0 bg-black/35" />
        <section className="px-4 pt-20 pb-8 md:pt-24 md:pb-12 relative z-10" aria-labelledby="formats-heading">
          <div className="max-w-7xl mx-auto">
            <div className="mx-auto mb-12 max-w-4xl rounded-3xl bg-white/90 p-6 text-center shadow-xl backdrop-blur-sm md:p-8">
              <h2 id="formats-heading" className="text-balance text-3xl/[1.4] md:text-5xl/[1.4] font-rammetto text-[var(--primary-orange)]">Two Planned Formats</h2>
              <p className="text-[var(--text-light)] text-lg mt-6 max-w-3xl mx-auto leading-relaxed">{programCopy.direction}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(courseFormats).map(([key, item]) => (
                <article key={key} className="bg-white rounded-[2rem] overflow-hidden shadow-md">
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
            <p className="mt-8 text-center text-white/90 leading-relaxed max-w-3xl mx-auto">{programCopy.availability}</p>
          </div>
        </section>

        <section className="pt-8 pb-24 md:pt-12 md:pb-32 relative z-10" aria-labelledby="learning-heading">
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
      </div>

      <section id="course-catalog" className="px-4 py-20 md:py-24 scroll-mt-48" aria-labelledby="catalog-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 id="catalog-heading" className="text-3xl md:text-5xl font-rammetto text-[var(--primary-orange)]">Courses in Development</h2>
            <p className="text-[var(--text-light)] text-lg mt-6 max-w-2xl mx-auto">{courseCounts.all} course plans: {courseCounts.live} live and {courseCounts.independent} independent. Every course below is in development.</p>
          </div>
          <div role="group" aria-label="Filter courses by field" className="flex flex-wrap justify-center gap-3 mb-4">
            {[{ id: 'all', label: 'All fields' }, ...courseFields].map((group) => (
              <button key={group.id} type="button" aria-pressed={field === group.id} aria-controls="development-courses" onClick={() => setField(group.id as CourseField | 'all')} className={`min-h-12 px-5 py-3 rounded-full font-bold border-2 transition-colors ${field === group.id ? 'bg-orange-100 border-[var(--primary-orange)] text-[var(--text-charcoal)]' : 'bg-white border-orange-200 text-[var(--text-charcoal)] hover:bg-orange-50'}`}>
                {group.label} ({group.id === 'all' ? coursesForFormat.length : coursesForFormat.filter((course) => course.field === group.id).length})
              </button>
            ))}
          </div>
          <div role="group" aria-label="Filter courses by planned format" className="flex flex-wrap justify-center gap-3 mb-6">
            {filters.map((filter) => (
              <button key={filter.value} type="button" aria-pressed={format === filter.value} aria-controls="development-courses" onClick={() => setFormat(filter.value)} className={`min-h-12 px-6 py-3 rounded-full font-bold border-2 transition-colors ${format === filter.value ? 'bg-[var(--text-charcoal)] border-[var(--text-charcoal)] text-white' : 'bg-white border-orange-200 text-[var(--text-charcoal)] hover:bg-orange-50'}`}>
                {filter.label} ({formatCounts[filter.value]})
              </button>
            ))}
          </div>
          <p role="status" aria-live="polite" aria-atomic="true" className="text-center text-[var(--text-light)] mb-8">
            Showing {visibleCourses.length} {format === 'all' ? '' : `${courseFormats[format].label.toLowerCase()} `}{visibleCourses.length === 1 ? 'course' : 'courses'} in development.
          </p>
          <div id="development-courses" className="space-y-12">
            {visibleGroups.map((group) => (
                <section key={group.id} aria-labelledby={`field-${group.id}`}>
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 text-[var(--primary-orange)]">
                    <h3 id={`field-${group.id}`} className="text-xl sm:text-2xl font-bold">{group.label}</h3>
                    <span className="ml-auto shrink-0 text-sm font-bold text-[var(--text-light)]">{group.courses.length} {group.courses.length === 1 ? 'course' : 'courses'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {group.courses.map((course) => <CourseCard key={course.title} course={course} />)}
                  </div>
                </section>
            ))}
            {visibleCourses.length === 0 && (
              <div className="rounded-3xl border-2 border-orange-100 bg-white p-8 text-center">
                <p className="text-[var(--text-light)]">No courses match these filters.</p>
                <button type="button" onClick={() => { setField('all'); setFormat('all'); }} className="mt-4 min-h-12 rounded-full bg-[var(--primary-orange)] px-6 py-3 font-bold text-white">Show all courses</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <ProgramNextSteps />
    </div>
  );
};

export default Program;
