import React from 'react';

const Mentors = () => {
  const mentors = [
    {
      initial: "E",
      name: "Elaine Che",
      role: "Co-Founder",
      details: "Saratoga High School · 11th Grade",
      bio: "Passionate about education equity and making mentorship accessible to all students."
    },
    {
      initial: "A",
      name: "Austin Zhao",
      role: "Co-Founder",
      details: "Saratoga High School · 11th Grade",
      bio: "Combines tech skills with a drive to create meaningful programs for younger students."
    },
    {
      initial: "M",
      name: "Michael Zhao",
      role: "Co-Founder",
      details: "Saratoga High School · 11th Grade",
      bio: "Focused on program design and building partnerships to expand SkillBridge's reach."
    },
    {
      initial: "I",
      name: "Ivan Satsuta",
      role: "Director of Operations",
      details: "Saratoga High School · 11th Grade",
      bio: "Keeps the program running smoothly — from scheduling to logistics to team coordination."
    },
    {
      initial: "J",
      name: "Julie Ye",
      role: "Director of Programs",
      details: "Saratoga High School · 11th Grade",
      bio: "Designs engaging curriculum and activities that make each session impactful and fun."
    }
  ];

  return (
    <div className="bg-[var(--bg-cream)] min-h-screen">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center rounded-b-[4rem] shadow-lg relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">Our Mentors 🔥</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4 leading-relaxed">High schoolers who've been there. Ready to guide you.</p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/10 to-transparent"></div>
      </section>

      {/* Intro Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-rammetto text-[var(--primary-orange)] mb-6">Learn from Students Like You</h2>
          <p className="text-xl text-[var(--text-light)] leading-relaxed">
            We believe that mentorship is most effective when it comes from people who understand your current journey. 
            Our mentors are high-achieving high school students who are passionate about sharing their knowledge, 
            experiences, and the "real-world" skills they wish they had learned in middle school.
          </p>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-rammetto text-center text-[var(--text-charcoal)] mb-12 underline decoration-[var(--primary-orange)] decoration-4 underline-offset-8">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {mentors.map((mentor, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border-b-8 border-[var(--primary-orange)] hover:-translate-y-2 group">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center text-4xl font-rammetto text-[var(--primary-orange)] shadow-inner transform group-hover:rotate-6 transition-transform">
                    {mentor.initial}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--text-charcoal)] mb-1">{mentor.name}</h3>
                    <p className="text-[var(--primary-orange)] font-bold text-sm tracking-uppercase">{mentor.role}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-light)] font-semibold bg-[var(--bg-cream)] px-4 py-2 rounded-xl">
                    <span>📍</span> {mentor.details}
                  </div>
                  <p className="text-[var(--text-light)] leading-relaxed italic">
                    "{mentor.bio}"
                  </p>
                </div>

                <div className="mt-8 flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-gray-400 hover:bg-[var(--primary-orange)] hover:text-white transition-colors cursor-pointer">💼</div>
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-gray-400 hover:bg-[var(--primary-orange)] hover:text-white transition-colors cursor-pointer">📧</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-white rounded-t-[4rem]">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-rammetto text-[var(--primary-orange)] mb-6 underline decoration-dashed decoration-2">Want to Join the Team?</h2>
            <p className="text-lg text-[var(--text-light)] mb-10">
              We are always looking for passionate high school students to join our mentorship program as volunteers. 
              Gain leadership experience and give back to your community.
            </p>
            <button className="bg-[var(--primary-orange)] text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-lg shadow-orange-200">
              Apply to Mentor
            </button>
        </div>
      </section>
    </div>
  );
};

export default Mentors;
