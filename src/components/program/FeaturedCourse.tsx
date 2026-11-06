import { Link } from 'react-router-dom';
import { featuredCourse } from '../../config/courseDemo';
import { RedirectArrow } from '../ui/redirect-arrow';
import CourseCreators from './CourseCreators';

export default function FeaturedCourse() {
  const { course, path } = featuredCourse;

  return <section id="featured-course" className="px-4 py-12 md:py-16 scroll-mt-40" aria-labelledby="featured-course-heading">
    <div className="mx-auto max-w-7xl">
      <h2 id="featured-course-heading" className="mb-8 font-rammetto text-4xl font-normal leading-[1.4] text-[var(--primary-orange)] md:text-5xl">This Month’s Featured Course</h2>
      <article className="overflow-hidden rounded-[2rem] border-2 border-orange-100 bg-white shadow-sm lg:grid lg:grid-cols-[1fr_1.2fr]">
        <div className="flex items-center bg-[var(--bg-cream)]">
          <img src={course.headerImage ?? course.icon} alt="" width={2752} height={1536} loading="lazy" className="aspect-[43/24] w-full object-contain" />
        </div>
        <div className="flex flex-col items-start justify-center p-6 sm:p-8 lg:p-10">
          <h3 className="font-display text-2xl font-bold leading-snug sm:text-3xl">{course.title}</h3>
          <CourseCreators course={course} className="mt-5" />
          <Link to={path} className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary-orange)] px-7 py-4 text-white transition-colors hover:bg-[var(--primary-orange-dark)] font-sans font-bold text-button">Try a sample week<RedirectArrow /></Link>
        </div>
      </article>
    </div>
  </section>;
}
