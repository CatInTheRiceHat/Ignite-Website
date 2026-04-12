const keySkills = [
  { icon: <img src="/assets/Laptop.png" alt="Laptop icon" className="h-14 w-14 object-contain" />, title: 'Communication', desc: 'Professional email writing, tone, and structure.' },
  {
    icon: <img src="/assets/Artist.png" alt="Artist palette icon" className="h-14 w-14 object-contain" />,
    title: 'Visual Design',
    desc: 'Canva basics, color theory, and personal branding.'
  },
  {
    icon: <img src="/assets/Microphone.png" alt="Microphone icon" className="h-14 w-14 object-contain" />,
    title: 'Presentation',
    desc: 'Public speaking, body language, and confidence.'
  }
];

const Curriculum = () => {
  const weeks = [
    {
      week: "Week 1",
      icon: <img src="/assets/Laptop.png" alt="Laptop icon" className="h-16 w-16 object-contain" />,
      title: "Professional Communication",
      desc: "Master professional email writing. Learn tone, structure, subject lines, and how to make a great first impression when reaching out to teachers, mentors, and future employers.",
      project: "Write emails for real scenarios (asking for a recommendation, inquiring about opportunities)."
    },
    {
      week: "Week 2",
      icon: <img src="/assets/Artist.png" alt="Artist palette icon" className="h-16 w-16 object-contain" />,
      title: "Digital Branding with Canva",
      desc: "Create stunning visuals and develop your personal brand. Learn design principles, color theory, typography, and how to use Canva like a pro.",
      project: "Design a personal brand board showcasing your interests and goals."
    },
    {
      week: "Week 3",
      icon: <img src="/assets/Microphone.png" alt="Microphone icon" className="h-16 w-16 object-contain" />,
      title: "Public Speaking Basics",
      desc: "Find your voice and own the room. Learn breathing techniques, body language, voice projection, and how to manage nervous energy.",
      project: "Deliver a 2-minute talk on something you're passionate about."
    },
    {
      week: "Week 4",
      icon: <img src="/assets/Lightbulb.png" alt="Lightbulb icon" className="h-16 w-16 object-contain" />,
      title: "Career Exploration",
      desc: "Discover paths you didn't know existed. Explore different industries, job roles, and what it takes to succeed. Meet guest speakers from various fields.",
      project: "Research and present on a career that interests you."
    },
    {
      week: "Week 5",
      icon: "🚀",
      title: "Elevator Pitching",
      desc: "Craft your perfect pitch. Learn to communicate your ideas clearly and persuasively in 60 seconds or less. Practice, refine, and polish.",
      project: "Write and rehearse your personal elevator pitch."
    },
    {
      week: "Week 6",
      icon: <img src="/assets/Trophy.png" alt="Trophy icon" className="h-16 w-16 object-contain" />,
      title: "Shark Tank Showcase",
      desc: "Put it all together. Present your elevator pitch to mentors, peers, and guest speakers at our finale celebration event.",
      project: "Final pitch presentation + certificate ceremony."
    }
  ];

  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">Curriculum</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4">Week by week breakdown. Skills for life.</p>
        </div>
      </section>

      {/* Key Skills Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-rammetto text-center text-[var(--primary-orange)] mb-16">Key Skills You'll Learn</h2>
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

      {/* Week-by-Week Overview */}
      <section className="py-24 bg-white rounded-[4rem]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16">Week-by-Week Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {weeks.map((week, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-8 p-10 bg-[var(--bg-cream)] rounded-[3rem] border-2 border-transparent hover:border-orange-100 transition-all">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-orange-50 transform hover:rotate-6 transition-transform">
                    {week.icon}
                  </div>
                </div>
                <div>
                  <div className="inline-block px-4 py-1 bg-[var(--primary-orange)] text-white font-bold rounded-lg text-sm mb-4">
                    {week.week}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-[var(--text-charcoal)]">{week.title}</h3>
                  <p className="text-[var(--text-light)] text-lg mb-6 leading-relaxed">
                    {week.desc}
                  </p>
                  <div className="bg-white/60 p-4 rounded-xl border border-orange-100">
                    <p className="text-sm font-bold text-[var(--text-charcoal)]">
                      <span className="text-[var(--primary-orange)]">Project:</span> {week.project}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Elevator Pitch Feature */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-rammetto text-[var(--primary-orange)]">Example Project: Elevator Pitch</h2>
              <p className="text-xl text-[var(--text-light)] mt-4">By the end of the program, every student will have their own polished pitch.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: '✏️', title: 'Write', desc: 'Draft your pitch: Who are you? What are you passionate about? What makes you unique?' },
                { icon: '🔄', title: 'Revise', desc: 'Get feedback from mentors and peers. Refine your message. Cut the fluff.' },
                { icon: '🎯', title: 'Deliver', desc: 'Present your pitch at the showcase with confidence and clarity.' }
              ].map((step, i) => (
                <div key={i} className="bg-white p-12 rounded-[2.5rem] shadow-sm text-center relative group">
                  <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">{step.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 text-[var(--text-charcoal)]">{step.title}</h3>
                  <p className="text-[var(--text-light)] leading-relaxed">{step.desc}</p>
                  {i < 2 && <div className="hidden lg:block absolute top-1/2 -right-4 translate-y-[-50%] text-3xl opacity-20 text-[var(--primary-orange)]">➔</div>}
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[var(--primary-orange)] rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden group">
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
