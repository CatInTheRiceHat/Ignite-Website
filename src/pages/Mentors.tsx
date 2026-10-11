import { ArrowRight, BookOpen, GraduationCap, Mail, MapPin } from 'lucide-react';
import { IgnitionCard, IgnitionGroup } from '../components/team/ignition-reveal';
import StaffImage from '../components/ui/staff-image';
import { interns, mentors } from '../data/mentors';
import { INTERN_FORM_URL } from '../lib/links';

const isCoFounder = (role: string) => role.toLowerCase().startsWith('co-founder');
const teamMembers = [...mentors, ...interns];
const staffSections = [
  {
    id: 'current-staff',
    title: 'Current Staff',
    members: teamMembers.filter((member) => member.role !== 'Former Staff'),
  },
  {
    id: 'former-staff',
    title: 'Former Staff',
    members: teamMembers.filter((member) => member.role === 'Former Staff'),
  },
];

const formatEducation = (educationLevel?: string, graduatingClass?: string) => {
  if (!graduatingClass) return null;

  const classLabel = graduatingClass.startsWith('Class of ')
    ? graduatingClass
    : `Class of ${graduatingClass}`;

  return educationLevel ? `${educationLevel}, ${classLabel}` : classLabel;
};

const Mentors = () => {

  return (
    <div className="bg-[var(--bg-cream)] min-h-screen">
      {/* Page Header */}
      <section className="bg-[var(--primary-orange)] py-20 text-[var(--text-charcoal)] text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
          <img
            src="/mascots/Mentors.png"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            loading="lazy"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-rammetto text-[var(--text-charcoal)]">Our Team</h1>
          <p className="text-xl md:text-2xl opacity-90 mt-4 leading-relaxed">Students who want to help.</p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-rammetto text-[var(--text-charcoal)] mb-6">Learn from Students Like You</h2>
          <p className="text-xl text-[var(--text-light)] leading-relaxed">
            Our student interns remember what it felt like to be younger and unsure where to start.
            They help students practice skills they wish they had learned earlier.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <IgnitionGroup className="pb-32">
        <div className="max-w-7xl mx-auto space-y-20 px-4">
          {staffSections.map(({ id, title, members }) => (
            <section key={id} aria-labelledby={id}>
              <h2 id={id} className="mb-10 text-3xl font-rammetto text-[var(--text-charcoal)] md:text-4xl">{title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {members.map((member) => (
                  <IgnitionCard key={member.email ?? member.name} revealId={member.email ?? member.name}
                      className={`${
                        isCoFounder(member.role)
                          ? 'border-0 text-[var(--text-charcoal)] shadow-orange-200/70'
                          : 'border-b-8 border-[var(--primary-orange)] bg-white'
                      } group h-full overflow-hidden rounded-3xl p-6 shadow-sm transition-all duration-300 hover:shadow-xl sm:p-8`}
                      style={isCoFounder(member.role) ? { background: 'linear-gradient(135deg, var(--primary-orange) 0%, #E87324 55%, var(--primary-orange-dark) 100%)' } : undefined}
                    >
                      <div className="mb-8 grid grid-cols-[1fr_auto] items-start gap-4 sm:grid-cols-[auto_1fr_auto] sm:gap-5">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner transform transition-transform flex-shrink-0">
                          <StaffImage
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="col-span-2 row-start-2 min-w-0 sm:col-span-1 sm:row-start-1 sm:col-start-2">
                          <h3 className={`mb-1 break-words text-xl font-bold leading-tight sm:text-2xl ${isCoFounder(member.role) ? 'text-[var(--text-charcoal)]' : 'text-[var(--text-charcoal)]'}`}>{member.name}</h3>
                          <p className={`break-words text-sm font-bold ${isCoFounder(member.role) ? 'text-[var(--text-charcoal)]' : 'text-[var(--text-charcoal)]'}`}>
                            {member.role.split(', ').map((roleLine, roleLineIndex, roleLines) => (
                              <span key={roleLine} className="block">
                                {roleLine}{roleLineIndex < roleLines.length - 1 ? ',' : ''}
                              </span>
                            ))}
                          </p>
                        </div>
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            aria-label={`Email ${member.name}`}
                            className={`col-start-2 row-start-1 sm:col-start-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              isCoFounder(member.role)
                                ? 'border-[var(--text-charcoal)] text-[var(--text-charcoal)] hover:bg-white'
                                : 'border-[var(--primary-orange)] text-[var(--text-charcoal)] hover:bg-[var(--primary-orange)]'
                            }`}
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <div className="space-y-3">
                        {member.school && (
                          <div className={`flex items-start gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${isCoFounder(member.role) ? 'bg-white/30 text-[var(--text-charcoal)] shadow-inner' : 'bg-[var(--bg-cream)] text-[var(--text-light)]'}`}>
                            <MapPin className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isCoFounder(member.role) ? 'text-[var(--text-charcoal)]' : 'text-[var(--primary-orange)]'}`} />
                            <span className="min-w-0 break-words leading-relaxed">{member.school}{member.country ? `, ${member.country}` : ''}</span>
                          </div>
                        )}
                        {member.coursesInDevelopment && member.coursesInDevelopment.length > 0 && (
                          <div className={`flex items-start gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${isCoFounder(member.role) ? 'bg-white/30 text-[var(--text-charcoal)] shadow-inner' : 'bg-[var(--bg-cream)] text-[var(--text-light)]'}`}>
                            <BookOpen className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isCoFounder(member.role) ? 'text-[var(--text-charcoal)]' : 'text-[var(--primary-orange)]'}`} />
                            <div className="min-w-0 flex-1 break-words leading-relaxed">
                              <p className={`mb-1 font-bold ${isCoFounder(member.role) ? 'text-[var(--text-charcoal)]' : 'text-[var(--text-charcoal)]'}`}>Courses in development</p>
                              <ul className="space-y-1">
                                {member.coursesInDevelopment.map((course) => (
                                  <li key={course}>{course}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        {formatEducation(member.educationLevel, member.graduatingClass) && (
                          <div className={`flex items-start gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${isCoFounder(member.role) ? 'bg-white/30 text-[var(--text-charcoal)] shadow-inner' : 'bg-[var(--bg-cream)] text-[var(--text-light)]'}`}>
                            <GraduationCap className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isCoFounder(member.role) ? 'text-[var(--text-charcoal)]' : 'text-[var(--primary-orange)]'}`} />
                            <span className="min-w-0 break-words leading-relaxed">{formatEducation(member.educationLevel, member.graduatingClass)}</span>
                          </div>
                        )}
                      </div>
                  </IgnitionCard>
                ))}
              </div>
            </section>
          ))}
        </div>
      </IgnitionGroup>

      {/* Contact */}
      <section className="py-24 bg-white rounded-t-[4rem]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-rammetto text-[var(--text-charcoal)] mb-6">Apply to Be an Intern!</h2>
          <p className="text-lg text-[var(--text-light)] max-w-2xl mx-auto leading-relaxed">
            Want to help younger students build confidence and explore new interests? Apply to join the Ignite intern team.
          </p>
          <a
            href={INTERN_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ignite-button mt-8 inline-flex items-center justify-center gap-2 bg-[var(--primary-orange)] text-[var(--text-charcoal)] px-10 py-4 rounded-full font-bold text-lg hover:bg-[var(--primary-orange-dark)] transition-all shadow-lg"
          >
            Apply as an Intern
            <ArrowRight className="h-5 w-5 flex-none" aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Mentors;
