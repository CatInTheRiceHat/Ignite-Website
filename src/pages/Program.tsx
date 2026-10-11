import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const skillAreas = [
  {
    icon: '/mascots/Productivity.png',
    title: 'Skills for everyday life',
    description: 'Plan your time, organize commitments, communicate clearly, and make thoughtful decisions. Build habits you can use in school and beyond.',
  },
  {
    icon: '/mascots/Project.png',
    title: 'Ideas you can put into practice',
    description: 'Explore how to design, investigate, and build. Turn a question or idea into a project, explain your choices, and improve your work.',
  },
  {
    icon: '/mascots/Lightbulb.png',
    title: 'A direction worth exploring',
    description: 'Discover interests through practical work. Connect what you enjoy with skills and possible career pathways, then choose what to try next.',
  },
];

// Curriculum sources: Ignite_Asynchronous_Curriculum_Framework and
// Ignite Asynchronous Grading System. These describe a planned experience;
// they do not establish launch dates, access rules, or formats for each course.
const learningSteps = [
  { title: 'Learn', description: 'Start with clear lessons, demonstrations, and examples that explain a useful skill.' },
  { title: 'Practice', description: 'Try guided activities, scenarios, and knowledge checks to put the idea to work.' },
  { title: 'Build', description: 'Apply what you learn to a practical project, with smaller tasks building toward a final piece of work.' },
  { title: 'Improve', description: 'Use self-checks, reflection, and feedback to revise your work and recognize your progress.' },
];

// The supplied current catalog is authoritative for titles and development status.
// Topic groups are navigation aids, not delivery formats or instructor assignments.
const courseGroups = [
  {
    title: 'Communication & creativity',
    icon: '/mascots/Microphone.png',
    headerImage: '/courses/Digital%20Design.jpeg',
    courses: [
      'Content Creation & Digital Storytelling',
      'Professional Communication & Public Speaking',
      'Marketing, Branding & Digital Design',
    ],
  },
  {
    title: 'Technology & design',
    icon: '/mascots/Laptop.png',
    headerImage: '/courses/AI%20Literacy.jpeg',
    courses: [
      'Game Development (Scratch)',
      'AI Literacy and Responsible Use',
      '3D Design & CAD Fundamentals',
      'Intro to Computer Science (Python)',
    ],
  },
  {
    title: 'Research & digital awareness',
    icon: '/mascots/Research.png',
    headerImage: '/courses/Science%20Research.jpeg',
    courses: [
      'Scientific Research & Data Analysis',
      'Cybersecurity, Online Safety & Media Literacy',
      'Introductory Physics and Astronomy',
    ],
  },
  {
    title: 'Everyday skills & wellbeing',
    icon: '/mascots/Productivity.png',
    headerImage: '/courses/Productivity.jpeg',
    courses: [
      'Productivity, Time Management & Organization',
      'Resilience & Stress Management',
      'Relationships, Boundaries & Social Skills',
      'Emergency Preparedness & Safety',
    ],
  },
  {
    title: 'Business & career exploration',
    icon: '/mascots/Finance.png',
    headerImage: '/courses/Project%20and%20Nonprofit%20Building.jpeg',
    courses: [
      'Career Exploration & Pathway Planning',
      'Financial Literacy & Economics',
      'Entrepreneurship & Business Building',
    ],
  },
  {
    title: 'Leadership & community',
    icon: '/mascots/Mentors.png',
    headerImage: '/courses/Communication.jpeg',
    courses: [
      'Social Impact & Project Development',
      'Leadership, Teamwork & Conflict Resolution',
      'Civic Literacy & Community Action',
    ],
  },
];

const Program = () => {
  return (
    <div className="bg-[var(--bg-cream)]">
      <section className="bg-[var(--primary-orange)] py-16 sm:py-20 text-[var(--text-charcoal)] text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
          <img src="/mascots/Graduation.png" alt="" className="h-full w-full object-contain object-right-bottom" />
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-rammetto text-[var(--text-charcoal)]">The Program</h1>
          <p className="text-xl md:text-2xl mt-5 leading-relaxed">Practical skills. New interests. Your next step.</p>
          <p className="text-lg leading-relaxed mt-6 max-w-3xl mx-auto">
            Ignite is growing into a student-led learning platform for practical life skills
            and intentional career exploration. We're developing courses that help students
            try new ideas, build useful skills, and discover what they want to explore next.
          </p>
          <a href="#courses-in-development" className="ignite-button inline-flex items-center justify-center gap-2 mt-8 bg-white text-[var(--text-charcoal)] px-6 py-4 rounded-full font-bold shadow-md hover:bg-orange-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            Explore courses in development
            <ArrowRight className="h-5 w-5 flex-none" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="skills-heading">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <h2 id="skills-heading" className="text-3xl sm:text-4xl md:text-5xl font-rammetto text-[var(--text-charcoal)]">Skills that go with you</h2>
            <p className="text-[var(--text-light)] text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
              Our focus is learning you can use: in everyday decisions, creative projects,
              and the paths you choose to explore.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skillAreas.map((area) => (
              <div key={area.title} className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-orange-100">
                <img src={area.icon} alt="" className="w-14 h-14 object-contain mb-5" loading="lazy" />
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-charcoal)] mb-3">{area.title}</h3>
                <p className="text-[var(--text-light)] text-lg leading-relaxed">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white rounded-[2.5rem] md:rounded-[4rem]" aria-labelledby="learning-heading">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <p className="font-bold text-[var(--text-light)] text-sm uppercase tracking-widest mb-3">The planned learning experience</p>
            <h2 id="learning-heading" className="text-3xl sm:text-4xl md:text-5xl font-rammetto text-[var(--text-charcoal)]">Learning by doing</h2>
            <p className="text-[var(--text-light)] text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
              Our courses are being designed around a simple rhythm: learn a skill, try it,
              build something, and improve it.
            </p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningSteps.map((step, index) => (
              <li key={step.title} className="bg-[var(--bg-cream)] rounded-[2rem] p-6 sm:p-8">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-[var(--text-charcoal)] font-bold mb-5" aria-hidden="true">{index + 1}</span>
                <h3 className="text-2xl font-bold text-[var(--text-charcoal)] mb-3">{step.title}</h3>
                <p className="text-[var(--text-light)] text-lg leading-relaxed">{step.description}</p>
              </li>
            ))}
          </ol>
          <p className="text-[var(--text-light)] text-base leading-relaxed mt-8 max-w-3xl mx-auto text-center">
            Ignite is developing both live and independent online learning experiences.
            Each course's format, workload, and participation details still need to be confirmed.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="availability-heading">
        <div className="max-w-7xl mx-auto px-4">
          <h2 id="availability-heading" className="text-3xl sm:text-4xl font-rammetto text-[var(--text-charcoal)] text-center mb-10">Course availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-2 border-orange-100">
              <h3 className="text-2xl font-bold text-[var(--text-charcoal)] mb-3">Looking for a course to start?</h3>
              <p className="text-[var(--text-light)] text-lg leading-relaxed">
                Current course availability and joining details are not yet confirmed on this page.
                Contact Ignite for the latest information before making plans.
              </p>
              <a href="mailto:ignitefindyourfire@gmail.com" className="inline-flex items-center gap-2 mt-5 min-h-11 font-bold text-[var(--text-charcoal)] underline underline-offset-4 hover:text-[var(--text-charcoal)] hover:decoration-[var(--primary-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-charcoal)]">
                Ask about availability
                <ArrowRight className="h-5 w-5 flex-none" aria-hidden="true" />
              </a>
            </div>
            <div className="bg-orange-100 rounded-[2rem] p-6 sm:p-8 border-2 border-orange-200">
              <h3 className="text-2xl font-bold text-[var(--text-charcoal)] mb-3">What's in development?</h3>
              <p className="text-[var(--text-light)] text-lg leading-relaxed">
                The 20 courses below are in development and have not launched.
                Their launch dates, lengths, weekly time commitments, and meeting requirements
                are still being finalized.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="courses-in-development" className="pb-16 md:pb-24 scroll-mt-44 md:scroll-mt-48" aria-labelledby="courses-heading">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <h2 id="courses-heading" className="text-3xl sm:text-4xl md:text-5xl font-rammetto text-[var(--text-charcoal)]">Courses in development</h2>
            <p className="text-[var(--text-light)] text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
              Explore the subjects we're working on, grouped by topic to help you find your interests.
              These are planned courses, with details to come as development progresses.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
            {courseGroups.map((group) => (
              <div key={group.title} className="min-w-0 bg-white rounded-[2rem] overflow-hidden shadow-sm border-t-8 border-[var(--primary-orange)]">
                <img
                  src={group.headerImage}
                  alt=""
                  width={2752}
                  height={1536}
                  className="w-full aspect-[43/24] object-cover bg-orange-50"
                  loading="lazy"
                />
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={group.icon} alt="" className="w-11 h-11 object-contain flex-none" loading="lazy" />
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-[var(--text-charcoal)]">In development</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-charcoal)] mb-5">{group.title}</h3>
                  <ul className="divide-y divide-orange-100">
                    {group.courses.map((title) => (
                      <li key={title} className="py-3 text-base sm:text-lg font-semibold leading-relaxed text-[var(--text-light)]">{title}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white rounded-t-[2.5rem] md:rounded-t-[4rem]" aria-labelledby="questions-heading">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 id="questions-heading" className="text-3xl sm:text-4xl font-rammetto text-[var(--text-charcoal)] mb-6">Curious about your next step?</h2>
          <p className="text-lg text-[var(--text-light)] max-w-2xl mx-auto leading-relaxed mb-8">
            Students and parents can contact Ignite with questions about courses and participation.
            Our FAQ explains what's planned and which details are still being finalized.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/faq" className="ignite-button inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[var(--primary-orange)] text-[var(--text-charcoal)] px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-200 transition-colors shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-charcoal)]">
              Read the FAQ
              <ArrowRight className="h-5 w-5 flex-none" aria-hidden="true" />
            </Link>
            <a href="mailto:ignitefindyourfire@gmail.com" className="ignite-button inline-flex w-full sm:w-auto items-center justify-center border-2 border-[var(--primary-orange)] text-[var(--text-charcoal)] px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-charcoal)]">
              Email Ignite
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Program;
