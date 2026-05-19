import { APPLY_FORM_URL } from '../lib/links';

const programDetails = [
  { icon: '/assets/Graduation.png', title: '3 Weeks', desc: 'The program runs for 3 weeks during the summer.' },
  { icon: '/assets/Mentors.png', title: 'Choose Your Courses', desc: 'Students can sign up for 1 course, 2 courses, 3 courses, or whatever fits their schedule.' },
  { icon: '/assets/Zoom.png', title: 'Online Classes', desc: 'All classes are online, so students can join from home.' },
];

const weeklySchedule = [
  {
    week: 'Week 1',
    dates: 'June 8–12 (Mon–Fri)',
    courses: [
      { title: 'Project / Nonprofit Building', instructor: 'Elaine Che' },
      { title: 'Marketing & Digital Design', instructor: 'Austin Zhao' },
    ],
  },
  {
    week: 'Week 2',
    dates: 'June 15–19 (Mon–Fri)',
    courses: [
      { title: 'Productivity, Goal Setting & Decision Making', instructor: 'Austin Zhao' },
      { title: 'Professional Communication', instructor: 'Ivan Satsuta' },
    ],
  },
  {
    week: 'Week 3',
    dates: 'June 22–26 (Mon–Fri)',
    courses: [
      { title: 'Science Research', instructor: 'Michael Zhao' },
      { title: 'AI Literacy', instructor: 'Julie Ye' },
    ],
  },
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
    description: 'Students learn what research looks like, practice finding good questions, design fair experiments, and present evidence clearly.',
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
    instructor: 'Julie Ye',
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
        <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
          <img
            src="/assets/Graduation.png"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            loading="lazy"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">The Program</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4">3 weeks. Pick the classes that fit.</p>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)]">Schedule</h2>
            <p className="text-[var(--text-light)] text-lg mt-4 max-w-2xl mx-auto">
              Two courses run each week. Pick the ones that fit your schedule.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {weeklySchedule.map((week, i) => (
              <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-md border-2 border-transparent hover:border-orange-100 hover:shadow-lg transition-shadow">
                <div className="bg-[var(--primary-orange)] px-8 py-5">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">{week.week}</span>
                  <h3 className="text-xl font-bold text-white mt-1">{week.dates}</h3>
                </div>
                <ul className="px-8 py-6 flex flex-col gap-4">
                  {week.courses.map((course, j) => (
                    <li key={j} className="flex flex-col gap-0.5">
                      <span className="text-[var(--text-charcoal)] font-semibold text-sm leading-snug">{course.title}</span>
                      <span className="text-[var(--primary-orange)] text-xs font-semibold">{course.instructor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Details and Time Commitments */}
      <section className="py-28 md:py-40 relative overflow-hidden min-h-[72vw]">
        <img
          src="/assets/Program%20Overview.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/35"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-white mb-4 drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">Time Commitments</h2>
          <p className="text-center text-white text-lg mb-16 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">Different classes meet at different times, so students can choose what fits their schedule.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {programDetails.map((item, i) => (
              <div key={i} className="bg-[rgba(26,26,46,0.72)] backdrop-blur-md rounded-[2rem] p-8 text-center flex flex-col gap-3 shadow-lg border border-white/30">
                <div className="mb-2 flex h-14 items-center justify-center">
                  <img src={item.icon} alt="" className="h-12 w-12 object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                <p className="text-sm text-white/90 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
            {timeCommitments.map((item, i) => (
              <div key={i} className="bg-[rgba(26,26,46,0.72)] backdrop-blur-md rounded-[2rem] p-8 text-center flex flex-col gap-3 shadow-lg border border-white/30">
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">{item.track}</span>
                <span className="text-3xl font-bold text-white">{item.time}</span>
                <span className="text-sm text-white/90 leading-relaxed">{item.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-white/90 text-sm mt-10 italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
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

      {/* Apply */}
      <section className="py-24 bg-white rounded-t-[4rem]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-rammetto text-[var(--primary-orange)] mb-6">Apply Now!</h2>
          <p className="text-lg text-[var(--text-light)] max-w-2xl mx-auto leading-relaxed mb-10">
            Ready to join Ignite? Apply for free and pick the courses that work best for your summer schedule.
          </p>
          <a
            href={APPLY_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[var(--primary-orange)] text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-orange-200"
          >
            Apply Now
          </a>
        </div>
      </section>

    </div>
  );
};

export default Program;
