import { APPLY_FORM_URL } from '../lib/links';

const atAGlance = [
  { icon: '/assets/Graduation.png', title: '3 Weeks', desc: 'Two skill courses per day — 12–1 pm and 3–4 pm — across 3 weeks.' },
  { icon: '/assets/Zoom.png', title: '1 Session', desc: 'One cohort this summer. Apply early — spots fill up.' },
  { icon: '/assets/Trophy.png', title: 'Friday Presentations', desc: 'Each class presents on Friday from 12–1 pm, 20 minutes per class.' },
];

const weeklyRhythm = [
  { day: 'Mon – Wed', label: '12–1 pm', desc: 'Skill course (one of six)' },
  { day: 'Mon – Wed', label: '3–4 pm', desc: 'Skill course (one of six)' },
  { day: 'Thursday', label: 'Workshop day', desc: 'Class time, project work, and presentation prep' },
  { day: 'Friday', label: '12–1 pm', desc: '20-minute presentations per class' },
];

const skillCourses = [
  {
    icon: '/assets/Project.png',
    title: 'Project / Nonprofit Building',
    instructor: 'Elaine',
    highlighted: true,
    topics: [
      'Identifying a real problem or idea',
      'Defining a target audience',
      'Value proposition (why it matters)',
      'Planning (goals, timeline, roles)',
      'Building and pitching a project',
    ],
  },
  {
    icon: '/assets/Research.png',
    title: 'Science Research',
    instructor: 'Michael',
    highlighted: true,
    topics: [
      'What research actually is',
      'Finding real-world problems',
      'Writing testable research questions',
      'Designing fair experiments',
      'Presenting evidence clearly',
    ],
  },
  {
    icon: '/assets/Artist.png',
    title: 'Marketing & Digital Design',
    instructor: 'Austin',
    highlighted: true,
    topics: [
      'Principles of good design',
      'Visual storytelling',
      'Using Canva and basic design tools',
      'Choosing fonts, colors, and layouts',
      'Presenting with confidence',
    ],
  },
  {
    icon: '/assets/Productivity.png',
    title: 'Productivity, Goal Setting & Decision Making',
    instructor: 'Austin',
    highlighted: false,
    topics: [
      'Why people procrastinate',
      'Prioritization (important vs urgent)',
      'Time blocking and scheduling',
      'SMART goals and action steps',
      'Making better trade-offs',
    ],
  },
  {
    icon: '/assets/Mentors.png',
    title: 'Professional Communication',
    instructor: 'Ivan',
    highlighted: false,
    topics: [
      'Writing clear messages',
      'Professional email structure',
      'Asking for help and opportunities',
      'Following up properly',
      'Communicating with adults',
    ],
  },
  {
    icon: '/assets/AI.png',
    title: 'AI Literacy',
    instructor: 'Achyut Karthikeyan',
    highlighted: false,
    topics: [
      'What AI actually is',
      'When to use AI vs not use it',
      'Writing better prompts',
      'Checking AI outputs',
      'Using AI ethically',
    ],
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
    <ul className="space-y-1.5">
      {course.topics.map((topic, j) => (
        <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-light)]">
          <span className="text-[var(--primary-orange)] mt-0.5 flex-shrink-0">·</span>
          {topic}
        </li>
      ))}
    </ul>
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

      {/* How It Works */}
      <section className="py-24 bg-white rounded-[4rem]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-4">How It Works</h2>
          <p className="text-center text-[var(--text-light)] text-lg mb-16">Every week has a clear rhythm. Show up, learn, and present on Fridays.</p>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {weeklyRhythm.map((item, i) => (
              <div key={i} className="flex-1 bg-[var(--bg-cream)] rounded-[2rem] p-6 text-center flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary-orange)]">{item.day}</span>
                <span className="text-lg font-bold text-[var(--text-charcoal)]">{item.label}</span>
                <span className="text-sm text-[var(--text-light)]">{item.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[var(--text-light)] text-sm mt-10 italic">
            Thursday sessions are flexible so each class has time for hands-on work and Friday presentation prep.
          </p>
        </div>
      </section>

      {/* Courses */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)]">Courses</h2>
            <p className="text-[var(--text-light)] text-lg mt-4 max-w-2xl mx-auto">
              6 courses across 3 weeks. Classes meet daily at 12–1 pm and 3–4 pm.
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
              <h3 className="text-2xl font-bold text-[var(--text-charcoal)] px-2">More Courses</h3>
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
