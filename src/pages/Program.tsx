import { APPLY_FORM_URL } from '../lib/links';

const atAGlance = [
  { icon: '/assets/Graduation.png', title: '3 Weeks', desc: 'Short summer courses with different time commitments by track.' },
  { icon: '/assets/Zoom.png', title: 'Featured: 12-1 pm PST', desc: 'Featured courses meet midday for students who want the main track.' },
  { icon: '/assets/Trophy.png', title: 'Regular: 7-8 pm PST', desc: 'Regular courses meet in the evening for students across time zones.' },
];

const timeCommitments = [
  { track: 'Featured Courses', time: '12-1 pm PST', desc: 'Best for students who want the main midday track and a slightly deeper commitment.' },
  { track: 'Regular Courses', time: '7-8 pm PST', desc: 'Best for students who want an evening class with a lighter schedule.' },
];

const skillCourses = [
  {
    icon: '/assets/Project.png',
    title: 'Project / Nonprofit Building',
    instructor: 'Elaine',
    highlighted: true,
    description: 'Students learn how to turn a real problem or idea into a simple project plan, define who it helps, explain why it matters, and build toward a final pitch.',
  },
  {
    icon: '/assets/Research.png',
    title: 'Science Research',
    instructor: 'Michael',
    highlighted: true,
    description: 'Students explore what research actually looks like, practice finding real-world questions, design fair experiments, and learn how to present evidence clearly.',
  },
  {
    icon: '/assets/Artist.png',
    title: 'Marketing & Digital Design',
    instructor: 'Austin',
    highlighted: true,
    description: 'Students build a stronger eye for design by learning visual storytelling, Canva basics, fonts, colors, layouts, and how to present polished work with confidence.',
  },
  {
    icon: '/assets/Productivity.png',
    title: 'Productivity, Goal Setting & Decision Making',
    instructor: 'Austin',
    highlighted: false,
    description: 'Students learn practical ways to beat procrastination, prioritize what matters, plan their time, set SMART goals, and make better trade-offs.',
  },
  {
    icon: '/assets/Mentors.png',
    title: 'Professional Communication',
    instructor: 'Ivan',
    highlighted: false,
    description: 'Students practice writing clear messages, structuring professional emails, asking for help or opportunities, following up, and communicating with adults.',
  },
  {
    icon: '/assets/AI.png',
    title: 'AI Literacy',
    instructor: 'Achyut Karthikeyan',
    highlighted: false,
    description: 'Students learn what AI is, when it is useful, how to write better prompts, how to check AI outputs, and how to use AI ethically.',
  },
];

const instructorImages: Record<string, string> = {
  Elaine: '/staff/Che_Elaine.png',
  Austin: '/staff/Zhao_Austin.png',
  Michael: '/staff/Zhao_Michael.png',
  Ivan: '/staff/Satsuta_Ivan.png',
  Julie: '/staff/Ye_Julie.png',
  Edwin: '/staff/Wu_Edwin.png',
};

const featuredCourses = skillCourses.filter((course) => course.highlighted);
const additionalCourses = skillCourses.filter((course) => !course.highlighted);

const InstructorAvatar = ({ name }: { name: string }) => {
  const firstName = name.split(' ')[0];
  const image = instructorImages[firstName];

  return image ? (
    <img
      src={image}
      alt={name}
      className="w-11 h-11 rounded-xl object-cover object-top flex-shrink-0 border-2 border-orange-100"
    />
  ) : (
    <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center text-base font-bold text-[var(--primary-orange)] flex-shrink-0">
      {firstName.charAt(0).toUpperCase()}
    </div>
  );
};

const CourseCard = ({ course }: { course: (typeof skillCourses)[number] }) => (
  <div className="bg-white rounded-[2rem] p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-orange-100">
    <div className="flex items-center gap-4 mb-5">
      <img src={course.icon} alt="" className="w-10 h-10 object-contain flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-[var(--text-charcoal)] leading-tight">{course.title}</h3>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <InstructorAvatar name={course.instructor} />
        <span className="text-sm font-semibold text-[var(--primary-orange)] hidden sm:block">{course.instructor}</span>
      </div>
    </div>
    <p className="text-sm text-[var(--text-light)] leading-relaxed">{course.description}</p>
  </div>
);

const Program = () => {
  return (
    <div className="bg-[var(--bg-cream)]">

      {/* Hero */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">The Program</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4">3 weeks. Real skills. Your choice.</p>
        </div>
      </section>

      {/* At a Glance */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-rammetto text-center text-[var(--primary-orange)] mb-16">At a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {atAGlance.map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm text-center hover:scale-105 transition-all border-2 border-transparent hover:border-orange-200">
                <div className="mb-6 flex h-16 items-center justify-center">
                  <img src={item.icon} alt="" className="h-14 w-14 object-contain" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-charcoal)]">{item.title}</h3>
                <p className="text-[var(--text-light)] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Time Commitments */}
      <section className="py-24 bg-white rounded-[4rem]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-4">Time Commitments</h2>
          <p className="text-center text-[var(--text-light)] text-lg mb-16">Different classes meet at different times, so students can choose what fits their schedule.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {timeCommitments.map((item, i) => (
              <div key={i} className="bg-[var(--bg-cream)] rounded-[2rem] p-8 text-center flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary-orange)]">{item.track}</span>
                <span className="text-3xl font-bold text-[var(--text-charcoal)]">{item.time}</span>
                <span className="text-sm text-[var(--text-light)]">{item.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[var(--text-light)] text-sm mt-10 italic">
            All times are listed in Pacific Time to keep the schedule clear for students joining from different locations.
          </p>
        </div>
      </section>

      {/* Courses */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)]">Courses</h2>
            <p className="text-[var(--text-light)] text-lg mt-4 max-w-2xl mx-auto">
              6 courses across 3 weeks. Featured courses meet 12-1 pm PST, and regular courses meet 7-8 pm PST.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-5">
              <h3 className="text-2xl font-bold text-[var(--text-charcoal)] px-2">Featured Courses</h3>
              {featuredCourses.map((course) => (
                <CourseCard key={course.title} course={course} />
              ))}
            </div>
            <div className="space-y-5">
              <h3 className="text-2xl font-bold text-[var(--text-charcoal)] px-2">Regular Courses</h3>
              {additionalCourses.map((course) => (
                <CourseCard key={course.title} course={course} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[var(--primary-orange)] rounded-[4rem] mx-4 mb-12 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto mb-6">Ready to join?</h2>
          <p className="text-xl opacity-90 mb-10">No prerequisites. Just show up and learn.</p>
          <a
            href={APPLY_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-[var(--primary-orange)] font-bold text-lg px-12 py-4 rounded-full hover:bg-orange-50 transition-colors shadow-md"
          >
            Apply Now
          </a>
        </div>
      </section>

    </div>
  );
};

export default Program;
