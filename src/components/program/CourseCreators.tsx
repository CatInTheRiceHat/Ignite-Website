import { teamMembers } from '../../data/mentors';
import type { DevelopmentCourse } from '../../data/program';
import StaffImage from '../ui/staff-image';

export default function CourseCreators({ course, className = '' }: { course: Pick<DevelopmentCourse, 'instructors'>; className?: string }) {
  if (!course.instructors?.length) return null;

  return <ul className={`flex flex-wrap gap-x-6 gap-y-4 ${className}`} aria-label="Course creators">
    {course.instructors.map(instructor => <li key={instructor.name} className="flex items-center gap-3">
      <StaffImage src={teamMembers.find(member => member.name === instructor.name)?.image} alt="" width={52} height={52} className="h-[52px] w-[52px] shrink-0 rounded-full border-2 border-[var(--primary-orange)] object-cover" />
      <p className="text-[0.9375rem] leading-relaxed">By <strong className="font-display">{instructor.displayName ?? instructor.name}</strong></p>
    </li>)}
  </ul>;
}
