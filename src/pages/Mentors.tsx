import { BookOpen, ExternalLink, Mail, MapPin } from 'lucide-react';
import BlurFade from '../components/ui/blur-fade';
import { mentors } from '../data/mentors';
import { INTERN_FORM_URL } from '../lib/links';

const Mentors = () => {

  return (
    <div className="bg-[var(--bg-cream)] min-h-screen">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
          <img
            src="/mascots/Mentors.png"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            loading="lazy"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">Our Team</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4 leading-relaxed">High school students who want to help.</p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-rammetto text-[var(--primary-orange)] mb-6">Learn from Students Like You</h2>
          <p className="text-xl text-[var(--text-light)] leading-relaxed">
            Our interns are high school students who remember what it felt like to be younger and unsure where to start.
            They help students practice skills they wish they had learned earlier.
          </p>
        </div>
      </section>

      {/* Mentors Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-rammetto text-center text-[var(--text-charcoal)] mb-12">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {mentors.map((mentor, index) => (
              <BlurFade key={index} delay={index * 0.08}>
              <div
                className={`${mentor.role === 'Co-Founder' ? 'border-0 text-white shadow-orange-200/70' : 'bg-white border-b-8 border-[var(--primary-orange)]'} rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group h-full`}
                style={mentor.role === 'Co-Founder' ? { background: 'linear-gradient(135deg, var(--primary-orange) 0%, #E87324 55%, var(--primary-orange-dark) 100%)' } : undefined}
              >
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner transform group-hover:rotate-6 transition-transform flex-shrink-0">
                    {mentor.image ? (
                      <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-orange-100 flex items-center justify-center text-4xl font-rammetto text-[var(--primary-orange)]">
                        {mentor.initial}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-2xl font-bold mb-1 ${mentor.role === 'Co-Founder' ? 'text-white' : 'text-[var(--text-charcoal)]'}`}>{mentor.name}</h3>
                    <p className={`font-bold text-sm tracking-uppercase ${mentor.role === 'Co-Founder' ? 'text-white/90' : 'text-[var(--primary-orange)]'}`}>{mentor.role}</p>
                  </div>
                  {mentor.email && (
                    <a
                      href={`mailto:${mentor.email}`}
                      aria-label={`Email ${mentor.name}`}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        mentor.role === 'Co-Founder'
                          ? 'border-white text-white hover:bg-white hover:text-[var(--primary-orange)]'
                          : 'border-[var(--primary-orange)] text-[var(--primary-orange)] hover:bg-[var(--primary-orange)] hover:text-white'
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl ${mentor.role === 'Co-Founder' ? 'bg-white/15 text-white shadow-inner' : 'bg-[var(--bg-cream)] text-[var(--text-light)]'}`}>
                    <MapPin className={`h-4 w-4 flex-shrink-0 ${mentor.role === 'Co-Founder' ? 'text-white' : 'text-[var(--primary-orange)]'}`} /> {mentor.school}
                  </div>
                  {mentor.subjects && (
                    <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl ${mentor.role === 'Co-Founder' ? 'bg-white/15 text-white shadow-inner' : 'bg-[var(--bg-cream)] text-[var(--text-light)]'}`}>
                      <BookOpen className={`h-4 w-4 flex-shrink-0 ${mentor.role === 'Co-Founder' ? 'text-white' : 'text-[var(--primary-orange)]'}`} /> {mentor.subjects}
                    </div>
                  )}
                </div>
              </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 bg-white rounded-t-[4rem]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-rammetto text-[var(--primary-orange)] mb-6">Apply to Be an Intern!</h2>
          <p className="text-lg text-[var(--text-light)] max-w-2xl mx-auto leading-relaxed">
            Want to help younger students build confidence and explore new interests? Apply to join the Ignite intern team.
          </p>
          <a
            href={INTERN_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 bg-[var(--primary-orange)] text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 hover:bg-[var(--primary-orange-dark)] active:scale-95 transition-all shadow-lg"
          >
            Apply as an Intern
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Mentors;
