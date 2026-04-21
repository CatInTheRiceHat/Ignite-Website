const programStructure = [
  { icon: '📅', title: '5 Weeks', desc: '2 elective skill weeks, 1 project anchor week, a work week, and showcase day.' },
  { icon: '👥', title: '10–15 Students', desc: 'Small cohorts with interactive sessions and required Slido participation each week.' },
  { icon: '🎯', title: 'Choose Your Path', desc: 'Pick one module each elective week, then choose your project anchor — Science Research or Nonprofit Building.' },
  { icon: '🏆', title: 'Real Deliverable', desc: 'Every student presents a research project or nonprofit pitch at the final showcase.' }
];

const studentActivities = [
  {
    icon: <img src="/assets/Laptop.png" alt="Laptop icon" className="h-16 w-16 object-contain" />,
    title: 'Master Professional Communication',
    desc: 'Write emails, ask for opportunities, and communicate with teachers and mentors like a pro.'
  },
  {
    icon: '🤖',
    title: 'Use AI as a Multiplier',
    desc: 'Learn to prompt, evaluate, and apply AI tools for writing, studying, and productivity — ethically and critically.'
  },
  {
    icon: '⚡',
    title: 'Build Real Productivity Systems',
    desc: 'Stop procrastinating for real. Learn time blocking, decision-making frameworks, and how to set goals that stick.'
  },
  {
    icon: '💰',
    title: 'Take Control of Personal Finance',
    desc: 'Understand budgeting, saving, and the basics of investing — before most adults do.'
  },
  {
    icon: '🔬',
    title: 'Run a Research Project or Build Something',
    desc: 'Choose your anchor: design and present a real science study, or pitch a nonprofit / startup idea.'
  },
  {
    icon: <img src="/assets/Trophy.png" alt="Trophy icon" className="h-16 w-16 object-contain" />,
    title: 'Present at Showcase',
    desc: 'Deliver a research presentation or a Shark Tank-style pitch to mentors and guest judges.'
  }
];

const sampleActivities = [
  { icon: '📝', title: 'Email Makeover Challenge', desc: 'Edit a bad example email into a polished professional one. Learn subject lines, greetings, tone, and sign-offs.' },
  { icon: '🔥', title: 'Hot Take: Agree or Disagree', desc: 'Drop a controversial statement on screen — students vote instantly on Slido and defend their position live.' },
  { icon: '💰', title: 'Budget for a Month', desc: 'Given a hypothetical student income, allocate funds across needs, wants, and savings — then defend your choices.' },
  { icon: '🤖', title: 'AI Writing Workshop', desc: 'Improve a piece of your own writing using AI, then reflect on what changed, why it matters, and where AI fell short.' },
  {
    icon: <img src="/assets/Lightbulb.png" alt="Lightbulb icon" className="h-14 w-14 object-contain" />,
    title: 'Prioritize Under Pressure',
    desc: 'Given a list of tasks, money, or competing goals — rank them and justify every trade-off you make.'
  },
  {
    icon: <img src="/assets/Trophy.png" alt="Trophy icon" className="h-14 w-14 object-contain" />,
    title: 'Final Showcase',
    desc: 'Present your research or pitch to mentors, peers, and guest judges at our celebration event.'
  }
];

const Program = () => {
  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">Program Overview</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4">5 weeks. You choose the skills.</p>
        </div>
      </section>

      {/* Program Structure */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-rammetto text-center text-[var(--primary-orange)] mb-16">Program Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {programStructure.map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm text-center hover:scale-105 transition-all border-2 border-transparent hover:border-orange-200">
                <div className="mb-6 flex h-16 items-center justify-center text-4xl">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-charcoal)]">{item.title}</h3>
                <p className="text-[var(--text-light)] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Students Will Do */}
      <section className="py-24 bg-white rounded-[4rem]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16">What Students Will Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {studentActivities.map((item, i) => (
              <div key={i} className="flex gap-8 p-8 bg-[var(--bg-cream)] rounded-[2.5rem] hover:bg-orange-50 transition-colors group">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-[var(--text-charcoal)]">{item.title}</h3>
                  <p className="text-[var(--text-light)] text-lg leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Activities */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16">Sample Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sampleActivities.map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-shadow border-t-8 border-[var(--primary-orange)] group">
                <div className="mb-6 flex h-14 items-center text-3xl group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-charcoal)]">{item.title}</h3>
                <p className="text-[var(--text-light)] text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Speakers Section */}
      <section className="py-24 bg-white rounded-[4rem]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)] mb-16">Guest Speakers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '🔬', field: 'STEM', desc: 'Scientists, engineers, and tech professionals sharing their journeys.' },
              { icon: '💰', field: 'Business', desc: 'Entrepreneurs and business leaders discussing building from scratch.' },
              { icon: '⚖️', field: 'Law', desc: 'Attorneys explaining how they advocate for justice and change.' },
              { icon: '💡', field: 'Entrepreneurship', desc: 'Founders sharing wins, losses, and lessons learned.' }
            ].map((item, i) => (
              <div key={i} className="bg-[var(--bg-cream)] p-8 rounded-[2rem] hover:-translate-y-2 transition-transform shadow-sm">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h4 className="text-xl font-bold mb-3 text-[var(--primary-orange)]">{item.field}</h4>
                <p className="text-sm text-[var(--text-light)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Program;
