const atAGlance = [
  { icon: '📅', title: '4 Weeks', desc: '2 new skill courses per week, morning and afternoon — you pick what you attend.' },
  { icon: '👥', title: '10–15 Students', desc: 'Small cohorts with interactive sessions and required Slido participation each week.' },
  { icon: '🗓️', title: '2 Sessions/Summer', desc: 'Same content, different dates — pick the schedule that works for you.' },
  { icon: '🏆', title: 'Weekly Showcases', desc: 'Present your work every Saturday. Final anchor track presentation at the end of Week 4.' },
];

const weeklyRhythm = [
  { day: 'Mon – Thu', label: 'Morning', desc: 'Skill Course A' },
  { day: 'Mon – Thu', label: 'Afternoon', desc: 'Skill Course B' },
  { day: 'Evenings', label: 'Anchor Track', desc: 'Optional sessions for enrolled students' },
  { day: 'Friday', label: 'Prep', desc: 'Showcase preparation' },
  { day: 'Saturday', label: 'Showcase', desc: "Present the week's deliverable" },
];

const skillCourses = [
  {
    icon: '✉️',
    title: 'Professional Communication',
    instructor: 'Ryan J',
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
    instructor: 'Adithya Sathya',
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
  {
    icon: '⚡',
    title: 'Productivity, Goal Setting & Decision Making',
    instructor: 'Sid',
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
    icon: '💰',
    title: 'Personal Finance',
    instructor: 'Riki',
    topics: [
      'Income, expenses, and budgeting',
      'Needs vs wants',
      'Saving strategies',
      'Intro to investing (stocks, long-term thinking)',
      'Compound growth (simple explanation)',
      'Smart spending habits',
      'Avoiding common money mistakes',
      'Basic financial independence concepts',
    ],
  },
  {
    icon: '🎨',
    title: 'Marketing & Digital Design',
    instructor: 'Austin',
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
    icon: '🗺️',
    title: 'Career Exploration',
    instructor: 'Achyut',
    topics: [
      'What careers actually look like (day-to-day reality)',
      'Different career paths (STEM, business, creative, etc.)',
      'Skills vs degrees (what actually matters)',
      'How people end up in careers (non-linear paths)',
      'Identifying personal interests and strengths',
      'Exploring opportunities (programs, internships, competitions)',
      'Talking to mentors and professionals',
      'Debunking career myths',
    ],
  },
  {
    icon: '🎓',
    title: 'College & Application Strategy',
    instructor: 'Austin',
    topics: [
      'How applications are evaluated',
      'Building a strong student profile',
      'Activities vs impact',
      'Essay basics',
      'Course selection strategy',
      'Long-term positioning',
    ],
  },
  {
    icon: '🤝',
    title: 'Leadership & Teamwork',
    instructor: 'Elaine',
    topics: [
      'What leadership actually means',
      'Leading vs managing',
      'Team dynamics',
      'Communication in teams',
      'Conflict resolution',
      'Accountability',
      'Taking initiative',
    ],
  },
];

const anchorTracks = [
  {
    icon: '🔬',
    title: 'Science Research',
    instructor: 'Michael',
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
    icon: '🚀',
    title: 'Project / Nonprofit Building',
    instructor: 'Achyut',
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
];

const sampleActivities = [
  { icon: '📝', title: 'Email Makeover Challenge', desc: 'Edit a bad example email into a polished professional one. Learn subject lines, greetings, tone, and sign-offs.' },
  { icon: '🔥', title: 'Hot Take: Agree or Disagree', desc: 'Drop a controversial statement on screen — students vote instantly on Slido and defend their position live.' },
  { icon: '💰', title: 'Budget for a Month', desc: 'Given a hypothetical student income, allocate funds across needs, wants, and savings — then defend your choices.' },
  { icon: '🤖', title: 'AI Writing Workshop', desc: 'Improve a piece of your own writing using AI, then reflect on what changed, why it matters, and where AI fell short.' },
  {
    icon: <img src="/assets/Lightbulb.png" alt="Lightbulb icon" className="h-14 w-14 object-contain" />,
    title: 'Prioritize Under Pressure',
    desc: 'Given a list of tasks, money, or competing goals — rank them and justify every trade-off you make.',
  },
  {
    icon: <img src="/assets/Trophy.png" alt="Trophy icon" className="h-14 w-14 object-contain" />,
    title: 'Final Showcase',
    desc: 'Present your research or pitch to mentors, peers, and guest judges at our celebration event.',
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
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">The Ignite Program</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4">4 weeks. Real skills. Your choice.</p>
        </div>
      </section>

      {/* At a Glance */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-rammetto text-center text-[var(--primary-orange)] mb-16">At a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
          <p className="text-center text-[var(--text-light)] text-lg mb-16">Every week follows the same rhythm — show up to what matters to you.</p>
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
            No hard requirements — show up to what matters to you. Anchor track is optional and runs every evening across all 4 weeks.
          </p>
        </div>
      </section>

      {/* Courses */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)]">Courses</h2>
            <p className="text-[var(--text-light)] text-lg mt-4 max-w-2xl mx-auto">
              8 courses across 4 weeks — 2 per week, morning and afternoon. All optional. Repeat in Session 2 if you want.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {skillCourses.map((course, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-8 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-orange-100">
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-3xl">{course.icon}</span>
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
            ))}
          </div>
        </div>
      </section>

      {/* Sample Activities */}
      <section className="py-24 bg-white rounded-[4rem]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16">Sample Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sampleActivities.map((item, i) => (
              <div key={i} className="bg-[var(--bg-cream)] p-10 rounded-[2.5rem] hover:shadow-xl transition-shadow border-t-8 border-[var(--primary-orange)] group">
                <div className="mb-6 flex h-14 items-center text-3xl group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-charcoal)]">{item.title}</h3>
                <p className="text-[var(--text-light)] text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anchor Tracks */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)]">Anchor Tracks</h2>
            <p className="text-[var(--text-light)] text-lg mt-4 max-w-2xl mx-auto">
              Optional deep-dive tracks that run every evening across all 4 weeks, ending with a final presentation on the last day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {anchorTracks.map((track, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] p-10 shadow-sm border-t-8 border-[var(--primary-orange)] hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">{track.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-[var(--text-charcoal)]">{track.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <InstructorAvatar name={track.instructor} />
                    <span className="text-sm font-semibold text-[var(--primary-orange)]">{track.instructor}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {track.topics.map((topic, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-light)]">
                      <span className="text-[var(--primary-orange)] mt-0.5 flex-shrink-0">→</span>
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
          <p className="text-xl opacity-90 mb-10">No prerequisites. No judgment. Just show up and learn.</p>
          <a
            href="/apply"
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
