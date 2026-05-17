import { Link } from 'react-router-dom';

const atAGlance = [
  { icon: '📅', title: '3 Weeks', desc: 'Two skill courses per day — 12–1 pm and 3–4 pm — across 3 weeks.' },
  { icon: '🗓️', title: '1 Session', desc: 'One cohort this summer. Apply early — spots fill up.' },
  { icon: '🏆', title: 'Friday Presentations', desc: 'Each class presents on Friday from 12–1 pm, 20 minutes per class.' },
];

const weeklyRhythm = [
  { day: 'Mon – Wed', label: '12–1 pm', desc: 'Skill course (one of six)' },
  { day: 'Mon – Wed', label: '3–4 pm', desc: 'Skill course (one of six)' },
  { day: 'Thursday', label: 'Mixed day', desc: 'Prep for highlighted classes; regular class for non-highlighted' },
  { day: 'Friday', label: '12–1 pm', desc: '20-minute presentations per class' },
];

const skillCourses = [
  {
    icon: '🚀',
    title: 'Project / Nonprofit Building',
    instructor: 'Elaine',
    highlighted: true,
    topics: [
      'Identifying a real problem or idea',
      'Defining a target audience',
      'Value proposition (why it matters)',
      'Planning (goals, timeline, roles)',
      'Basic marketing and outreach',
      'Execution (taking action, not overthinking)',
      'Iteration (improving based on feedback)',
      'Teamwork and coordination',
      'Preparing a final presentation or pitch',
    ],
  },
  {
    icon: '🔬',
    title: 'Science Research',
    instructor: 'Michael',
    highlighted: true,
    topics: [
      'What research actually is (experimental, observational, data-based)',
      'Identifying interests and real-world problems',
      'Formulating strong, testable research questions',
      'Variables (independent, dependent, controls)',
      'Basic experimental design and methodology',
      'Data collection methods (surveys, experiments, observations)',
      'Avoiding bias and ensuring validity',
      'Types of data (qualitative vs quantitative)',
      'Basic data analysis (graphs, patterns, trends)',
      'Correlation vs causation',
      'Drawing conclusions from evidence',
      'Structuring a research project (question → method → results → conclusion)',
      'Scientific communication (presentations, visuals)',
      'Common mistakes in beginner research',
    ],
  },
  {
    icon: '🎨',
    title: 'Marketing & Digital Design',
    instructor: 'Austin',
    highlighted: true,
    topics: [
      'Principles of good design',
      'What makes a good vs bad slide',
      'Visual storytelling',
      'Using Canva and basic design tools',
      'Choosing fonts, colors, and layouts',
      'Data visualization basics',
      'Practice presenting',
    ],
  },
  {
    icon: '⚡',
    title: 'Productivity, Goal Setting & Decision Making',
    instructor: 'Austin',
    highlighted: false,
    topics: [
      'Why people procrastinate (real causes)',
      'Prioritization (important vs urgent)',
      'Planning systems (daily and weekly)',
      'Time blocking and scheduling',
      'Focus techniques (deep work, minimizing distractions)',
      'SMART goals and breaking them into steps',
      'Decision-making frameworks',
      'Opportunity cost and evaluating trade-offs',
    ],
  },
  {
    icon: '✉️',
    title: 'Professional Communication',
    instructor: 'Ivan',
    highlighted: false,
    topics: [
      'Writing clear and concise messages',
      'Email structure (formal vs informal)',
      'Asking for help and opportunities',
      'Following up properly',
      'Tone and professionalism',
      'Common mistakes students make',
      'Communicating with teachers, mentors, and adults',
      'Basic etiquette (online and real-world)',
    ],
  },
  {
    icon: '🤖',
    title: 'AI Literacy',
    instructor: 'Achyut',
    highlighted: false,
    topics: [
      'What AI actually is (simple explanation)',
      'When to use AI vs not use it',
      'Prompting basics (how to get good results)',
      'Using AI for writing, brainstorming, studying, and productivity',
      'Evaluating AI outputs (do not trust blindly)',
      'Ethical use (not cheating)',
      'Limitations and risks of AI',
      'AI as a multiplier for work',
    ],
  },
];

const InstructorAvatar = ({ name }: { name: string }) => (
  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg font-rammetto text-[var(--primary-orange)] flex-shrink-0">
    {name.charAt(0).toUpperCase()}
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
                <div className="mb-6 flex h-16 items-center justify-center text-4xl">{item.icon}</div>
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
            Highlighted classes meet 4 times across 3 weeks. Non-highlighted classes meet 5 times.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {skillCourses.map((course, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-orange-100">
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-3xl">{course.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-[var(--text-charcoal)] leading-tight">{course.title}</h3>
                      {course.highlighted && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[var(--primary-orange)]">
                          Featured
                        </span>
                      )}
                    </div>
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[var(--primary-orange)] rounded-[4rem] mx-4 mb-12 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto mb-6">Ready to join?</h2>
          <p className="text-xl opacity-90 mb-10">No prerequisites. Just show up and learn.</p>
          <Link
            to="/apply"
            className="inline-block bg-white text-[var(--primary-orange)] font-bold text-lg px-12 py-4 rounded-full hover:bg-orange-50 transition-colors shadow-md"
          >
            Apply Now
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Program;
