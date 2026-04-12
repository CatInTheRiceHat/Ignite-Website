const About = () => {
  return (
    <div className="bg-[var(--bg-cream)]">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center rounded-b-[4rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">About Ignite</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4">Our story. Our mission. Our why.</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-rammetto text-[var(--primary-orange)]">Our Story</h2>
              <p className="text-xl font-semibold text-[var(--text-charcoal)]">
                Ignite started with a failure — and that's exactly why it exists.
              </p>
              <div className="space-y-4 text-[var(--text-light)] text-lg leading-relaxed">
                <p>
                  Our founders tried starting a traditional club in middle school. It didn't work.
                  Low turnout, low engagement, low impact. We realized that what students needed
                  wasn't another club — it was real mentorship and real skills.
                </p>
                <p>
                  So we pivoted. We created Ignite: a free, intensive summer program led by high
                  schoolers who remember exactly what it's like to be in middle school and unsure
                  about the future.
                </p>
                <p>
                  We're not teachers. We're not professors. We're students who've been there,
                  learned the hard way, and want to light the path for the next generation.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-orange-100 rounded-[3rem] p-12 aspect-square flex items-center justify-center transform hover:rotate-3 transition-transform duration-500 shadow-xl">
                 <img src="/assets/Hero.png" alt="Hero flame" className="w-full max-w-[250px] drop-shadow-2xl animate-float" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white rounded-[4rem]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16 underline decoration-wavy">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <img src="/assets/Lightbulb.png" alt="Access" className="w-12 h-12" />, 
                title: 'Access', 
                desc: "We believe every student deserves access to career mentorship — regardless of background or budget. That's why Ignite is 100% free." 
              },
              { 
                icon: '🤝', 
                title: 'Connection', 
                desc: "We connect middle schoolers with high school mentors who understand their challenges and can guide them forward." 
              },
              { 
                icon: '🚀', 
                title: 'Empowerment', 
                desc: "We teach practical skills that students can use immediately — from professional communication to public speaking." 
              }
            ].map((item, i) => (
              <div key={i} className="bg-[var(--bg-cream)] p-10 rounded-3xl border-2 border-orange-50 hover:border-[var(--primary-orange)] transition-colors shadow-sm group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-charcoal)]">{item.title}</h3>
                <p className="text-[var(--text-light)] text-lg leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-rammetto text-[var(--primary-orange)] mb-4">Why This Matters</h2>
            <p className="text-xl text-[var(--text-light)]">Middle school is when students start asking: "What am I good at? What could I become?"</p>
          </div>
          
          <div className="grid gap-6">
            {[
              { text: "Underrepresented students often lack access to career mentorship" },
              { text: "Early exposure to careers changes trajectories" },
              { text: "Near-peer mentorship (high school → middle school) is uniquely effective" },
              { text: "Practical skills build confidence that lasts through high school and beyond" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border-l-8 border-[var(--primary-orange)] hover:translate-x-2 transition-transform">
                <div className="bg-orange-100 text-[var(--primary-orange)] p-2 rounded-lg font-bold">✓</div>
                <p className="text-lg font-semibold text-[var(--text-charcoal)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white rounded-[4rem]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-rammetto text-center text-[var(--primary-orange)] mb-16">Our Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '🌟', title: 'Inclusion', desc: "Every voice matters. Every background is valued." },
              { icon: '💡', title: 'Curiosity', desc: "Questions are welcome. Exploration is encouraged." },
              { icon: '🤝', title: 'Community', desc: "We lift each other up. No one gets left behind." },
              { icon: '🚀', title: 'Growth', desc: "Mistakes are part of learning. Keep going." }
            ].map((item, i) => (
              <div key={i} className="text-center p-8 bg-[var(--bg-cream)] rounded-3xl hover:-translate-y-2 transition-transform shadow-sm">
                <div className="text-4xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-[var(--text-light)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[var(--primary-orange)] rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-rammetto mb-6">Ready to Join Ignite?</h2>
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

export default About;
