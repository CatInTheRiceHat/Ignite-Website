import { Briefcase, Mail, MapPin } from 'lucide-react';
import BlurFade from '../components/ui/blur-fade';
import { mentors } from '../data/mentors';
import { MENTOR_FORM_URL } from '../lib/links';

const Mentors = () => {

  return (
    <div className="bg-[var(--bg-cream)] min-h-screen">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
          <img
            src="/assets/Mentors.png"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            loading="lazy"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-white">Our Mentors</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4 leading-relaxed">High school students who want to help.</p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-rammetto text-[var(--primary-orange)] mb-6">Learn from Students Like You</h2>
          <p className="text-xl text-[var(--text-light)] leading-relaxed">
            Our mentors are high school students who remember what it felt like to be younger and unsure where to start.
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
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border-b-8 border-[var(--primary-orange)] hover:-translate-y-2 group h-full">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner transform group-hover:rotate-6 transition-transform flex-shrink-0">
                    {mentor.image ? (
                      <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-orange-100 flex items-center justify-center text-4xl font-rammetto text-[var(--primary-orange)]">
                        {mentor.initial}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--text-charcoal)] mb-1">{mentor.name}</h3>
                    <p className="text-[var(--primary-orange)] font-bold text-sm tracking-uppercase">{mentor.role}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-light)] font-semibold bg-[var(--bg-cream)] px-4 py-2 rounded-xl">
                    <MapPin className="h-4 w-4 text-[var(--primary-orange)] flex-shrink-0" /> {mentor.details}
                  </div>
                  <p className="text-[var(--text-light)] leading-relaxed italic">
                    "{mentor.bio}"
                  </p>
                </div>

                <div className="mt-8 flex gap-3">
                  {mentor.linkedin && (
                    <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${mentor.name} LinkedIn`} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-gray-400 hover:bg-[var(--primary-orange)] hover:text-white transition-colors">
                      <Briefcase className="h-4 w-4" />
                    </a>
                  )}
                  {mentor.email && (
                    <a href={`mailto:${mentor.email}`} aria-label={`Email ${mentor.name}`} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-gray-400 hover:bg-[var(--primary-orange)] hover:text-white transition-colors">
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-white rounded-t-[4rem]">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-rammetto text-[var(--primary-orange)] mb-6">Want to Join the Team?</h2>
            <p className="text-lg text-[var(--text-light)] mb-10">
              We are looking for high school students who want to teach, help organize, or support younger students.
              It is a simple way to lead and give back.
            </p>
            <a href={MENTOR_FORM_URL} target="_blank" rel="noopener noreferrer" className="inline-block bg-[var(--primary-orange)] text-white px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-lg shadow-orange-200">
              Apply to Mentor
            </a>
        </div>
      </section>
    </div>
  );
};

export default Mentors;
