import React from 'react';

const Program = () => {
  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center rounded-b-[4rem] shadow-lg relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">Program Overview 🔥</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4">6 weeks. Life-changing skills.</p>
        </div>
      </section>

      {/* Program Structure */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-rammetto text-center text-[var(--primary-orange)] mb-16 underline decoration-double">Program Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '📅', title: '6 Weeks', desc: 'Summer program with flexible scheduling.' },
              { icon: '🤝', title: 'Open Cohorts', desc: 'Online virtual cohorts where everyone is welcome.' },
              { icon: '⏱️', title: '2-3 Hours/Week', desc: 'Live sessions + independent projects.' },
              { icon: '🎯', title: 'Project-Based', desc: 'Learn by doing, not just listening.' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm text-center hover:scale-105 transition-all border-2 border-transparent hover:border-orange-200">
                <div className="text-4xl mb-6">{item.icon}</div>
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
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16 underline decoration-wavy">What Students Will Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { 
                icon: '📧', 
                title: 'Write Professional Emails', 
                desc: 'Learn to communicate with teachers, mentors, and future employers in a professional tone.' 
              },
              { icon: '🎨', title: 'Design with Canva', desc: 'Create stunning presentations, social media graphics, and personal branding materials.' },
              { icon: '🎤', title: 'Practice Public Speaking', desc: 'Build confidence presenting in front of peers. Learn breathing, posture, and voice projection.' },
              { icon: '💡', title: 'Develop an Elevator Pitch', desc: 'Craft and deliver a compelling 60-second pitch about themselves or an idea.' },
              { icon: '👔', title: 'Meet Guest Speakers', desc: 'Hear from professionals in STEM, business, law, and entrepreneurship.' },
              { icon: '🏆', title: 'Pitch at Showcase', desc: 'Present final projects at our Shark Tank-style finale event.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-8 p-8 bg-[var(--bg-cream)] rounded-[2.5rem] hover:bg-orange-50 transition-colors group">
                <div className="flex-shrink-0 text-4xl group-hover:scale-110 transition-transform">
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
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16 underline decoration-wavy">Sample Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📝', title: 'Email Makeover Challenge', desc: 'Transform casual texts into professional emails. Learn subject lines, greetings, and sign-offs.' },
              { icon: '🖼️', title: 'Personal Brand Board', desc: 'Design a visual representation of your interests, goals, and unique strengths using Canva.' },
              { icon: '🎤', title: '2-Minute Talk', desc: "Prepare and deliver a short presentation on something you're passionate about." },
              { icon: '💡', title: 'Career Speed Networking', desc: 'Rotate through stations meeting professionals and asking questions about their paths.' },
              { icon: '🚀', title: 'Pitch Drafting Workshop', desc: 'Write, revise, and practice your personal elevator pitch with peer feedback.' },
              { icon: '🏆', title: 'Final Showcase', desc: 'Present your pitch to mentors, peers, and guest speakers at our celebration event.' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-shadow border-t-8 border-[var(--primary-orange)] group">
                <div className="text-3xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
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
          <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)] mb-16 underline decoration-wavy">Guest Speakers</h2>
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
