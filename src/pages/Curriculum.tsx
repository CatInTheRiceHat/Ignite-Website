const keySkills = [
  {
    icon: <img src="/assets/Lightbulb.png" alt="Lightbulb icon" className="h-14 w-14 object-contain" />,
    title: 'Real-World Skills',
    desc: 'Productivity, personal finance, professional communication, and AI literacy — the things school doesn\'t teach.'
  },
  {
    icon: '🔬',
    title: 'Project-Based Learning',
    desc: 'Every student finishes with a real deliverable: a research study or a nonprofit pitch.'
  },
  {
    icon: '🤖',
    title: 'AI Literacy',
    desc: 'Learn to prompt, evaluate, and apply AI tools ethically — as a multiplier for your work and ideas.'
  }
];

const pairedWeeks = [
  {
    week: 'Week 1',
    optionA: {
      icon: <img src="/assets/Laptop.png" alt="Laptop icon" className="h-10 w-10 object-contain" />,
      title: 'Professional Communication',
      topics: ['Writing clear and concise messages', 'Email structure (formal vs informal)', 'Asking for help and opportunities', 'Following up properly', 'Tone and professionalism', 'Common mistakes students make', 'Communicating with teachers, mentors, and adults', 'Basic etiquette (online and real-world)'],
      deliverable: 'Write 2 real emails for real-life scenarios, then edit a bad example'
    },
    optionB: {
      icon: '🤖',
      title: 'AI Literacy',
      topics: ['What AI actually is (simple explanation)', 'When to use AI vs not use it', 'Prompting basics (how to get good results)', 'Using AI for writing, brainstorming, studying, and productivity', 'Evaluating AI outputs (don\'t trust blindly)', 'Ethical use (not cheating)', 'Limitations and risks of AI', 'AI as a multiplier for work'],
      deliverable: 'Use AI to improve your own writing, then explain what changed and why it matters'
    }
  },
  {
    week: 'Week 2',
    optionA: {
      icon: '⚡',
      title: 'Productivity, Goal Setting & Decision Making',
      topics: ['Why people procrastinate (real causes)', 'Prioritization (important vs urgent)', 'Planning systems (daily and weekly)', 'Time blocking and scheduling', 'Focus techniques (deep work, minimizing distractions)', 'SMART goals + breaking big goals into steps', 'Decision-making frameworks', 'Opportunity cost + evaluating risks and outcomes'],
      deliverable: 'Build a weekly schedule + 1 SMART goal action plan with decision criteria'
    },
    optionB: {
      icon: '💰',
      title: 'Personal Finance',
      topics: ['Income, expenses, and budgeting', 'Needs vs wants', 'Saving strategies', 'Intro to investing (stocks, long-term thinking)', 'Compound growth (simple explanation)', 'Smart spending habits', 'Avoiding common money mistakes', 'Basic financial independence concepts'],
      deliverable: 'Build a simple monthly budget for a hypothetical student and defend your choices'
    }
  },
  {
    week: 'Week 3',
    required: true,
    optionA: {
      icon: '🔬',
      title: 'Science Research',
      topics: ['Formulating testable research questions', 'Variables + experimental design', 'Data collection methods', 'Avoiding bias and ensuring validity', 'Basic data analysis', 'Correlation vs causation', 'Structuring a research project'],
      deliverable: 'Develop a research question and outline a full study design'
    },
    optionB: {
      icon: '🚀',
      title: 'Project / Nonprofit Building',
      topics: ['Identifying a problem or idea', 'Defining your target audience', 'Value proposition', 'Planning: goals, timeline, roles', 'Basic marketing & outreach', 'Execution mindset', 'Teamwork and coordination'],
      deliverable: 'Build a pitch deck for your idea'
    }
  }
];

const closingWeeks = [
  {
    week: 'Week 4',
    icon: '🛠️',
    title: 'Project Work Week',
    desc: 'No new content — this week is yours. Work on your anchor project, meet with mentors for feedback, and refine your deliverable with peer input.',
    project: 'Mentor check-ins + peer feedback sessions. Bring your questions.'
  },
  {
    week: 'Week 5',
    icon: <img src="/assets/Trophy.png" alt="Trophy icon" className="h-16 w-16 object-contain" />,
    title: 'Showcase Day',
    desc: 'Put it all together. Science Research students present their findings; Project/Nonprofit students deliver a Shark Tank-style pitch. Mentors and guest judges attend.',
    project: 'Science presentations (1 hr) + Pitch showcase (1 hr) + Certificate ceremony.'
  }
];

const Curriculum = () => {
  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">Curriculum</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4">Choose your path. Build real skills.</p>
        </div>
      </section>

      {/* Key Skills Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-rammetto text-center text-[var(--primary-orange)] mb-16">What You'll Walk Away With</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {keySkills.map((skill, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl text-center shadow-sm hover:shadow-md transition-shadow group">
                <div className="mb-6 flex h-14 items-center justify-center text-4xl group-hover:scale-110 transition-transform">{skill.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-[var(--text-charcoal)]">{skill.title}</h3>
                <p className="text-[var(--text-light)]">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white rounded-[4rem]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-rammetto text-[var(--primary-orange)] mb-6">How It Works</h2>
          <p className="text-xl text-[var(--text-light)] leading-relaxed">
            Each week, you choose between two modules. Pick the ones that matter to you — build a curriculum
            that fits your goals. Week 4 is your <span className="font-bold text-[var(--text-charcoal)]">project anchor</span> (required):
            choose Science Research or Project/Nonprofit Building. That's what you'll present at the final showcase.
          </p>
          <div className="flex justify-center gap-12 mt-10">
            <div className="text-center">
              <div className="text-4xl font-rammetto text-[var(--primary-orange)]">2</div>
              <div className="text-sm text-[var(--text-light)] mt-1">elective weeks</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-rammetto text-[var(--primary-orange)]">1</div>
              <div className="text-sm text-[var(--text-light)] mt-1">project anchor</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-rammetto text-[var(--primary-orange)]">1</div>
              <div className="text-sm text-[var(--text-light)] mt-1">work week</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-rammetto text-[var(--primary-orange)]">1</div>
              <div className="text-sm text-[var(--text-light)] mt-1">showcase day</div>
            </div>
          </div>
        </div>
      </section>

      {/* Paired Weeks */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16">Week-by-Week Overview</h2>
          <div className="flex flex-col gap-10">
            {pairedWeeks.map((week, i) => (
              <div key={i} className="bg-white rounded-[3rem] p-10 shadow-sm border-2 border-transparent hover:border-orange-100 transition-all">
                <div className="flex items-center gap-4 mb-8">
                  <div className="inline-block px-4 py-1 bg-[var(--primary-orange)] text-white font-bold rounded-lg text-sm">
                    {week.week}
                  </div>
                  {week.required ? (
                    <span className="px-3 py-1 bg-orange-100 text-[var(--primary-orange)] font-bold rounded-full text-xs tracking-wide uppercase">
                      Required — Choose Your Project Anchor
                    </span>
                  ) : (
                    <span className="text-[var(--text-light)] text-sm font-medium">Choose One</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[week.optionA, week.optionB].map((option, j) => (
                    <div key={j} className="bg-[var(--bg-cream)] p-8 rounded-[2rem] flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{option.icon}</div>
                        <h3 className="text-xl font-bold text-[var(--text-charcoal)]">{option.title}</h3>
                      </div>
                      <ul className="space-y-1">
                        {option.topics.map((topic, k) => (
                          <li key={k} className="text-sm text-[var(--text-light)] flex gap-2">
                            <span className="text-[var(--primary-orange)] flex-shrink-0">•</span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto bg-white p-4 rounded-xl border border-orange-100">
                        <p className="text-xs font-bold text-[var(--text-charcoal)]">
                          <span className="text-[var(--primary-orange)]">Deliverable:</span> {option.deliverable}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Weeks 5 & 6 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {closingWeeks.map((week, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-8 p-10 bg-[var(--bg-cream)] rounded-[3rem] border-2 border-transparent hover:border-orange-100 transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-orange-50">
                      {week.icon}
                    </div>
                  </div>
                  <div>
                    <div className="inline-block px-4 py-1 bg-[var(--primary-orange)] text-white font-bold rounded-lg text-sm mb-4">
                      {week.week}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-[var(--text-charcoal)]">{week.title}</h3>
                    <p className="text-[var(--text-light)] text-lg mb-6 leading-relaxed">{week.desc}</p>
                    <div className="bg-white/60 p-4 rounded-xl border border-orange-100">
                      <p className="text-sm font-bold text-[var(--text-charcoal)]">
                        <span className="text-[var(--primary-orange)]">Format:</span> {week.project}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[var(--primary-orange)] rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-rammetto mb-6">Ready to Learn?</h2>
              <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                Applications are open for our summer program. Spots are limited!
              </p>
              <button className="bg-white text-[var(--primary-orange)] px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-xl">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Curriculum;
