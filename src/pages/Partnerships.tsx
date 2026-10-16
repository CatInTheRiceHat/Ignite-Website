import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, HandHeart, Megaphone, Presentation, Sparkles } from 'lucide-react';
import Partners from '../components/partnerships/Partners';
import PartnershipApplication from '../components/partnerships/PartnershipApplication';
import { programCopy } from '../data/program';
import { PARTNERSHIP_FORM_URL } from '../lib/links';

const collaborationIdeas = [
  { icon: BookOpen, title: 'Bring learning to your community', description: 'Explore Ignite courses or sample lessons for a school, club, or community program.' },
  { icon: Megaphone, title: 'Help students discover Ignite', description: 'Share learning opportunities through newsletters, community channels, or events.' },
  { icon: Sparkles, title: 'Create something useful together', description: 'Develop or review practical-skills learning resources with us.' },
  { icon: Presentation, title: 'Make space for hands-on learning', description: 'Explore hosting a workshop or live learning experience around your community’s interests.' },
  { icon: HandHeart, title: 'Help keep learning accessible', description: 'Support access through sponsorship, resources, or professional expertise.' },
];

const Partnerships = () => (
  <div className="bg-[var(--bg-cream)]">
    <section className="bg-[var(--primary-orange)] py-20 text-white text-center shadow-lg relative overflow-hidden" aria-labelledby="partnerships-heading">
      <div className="absolute inset-y-0 right-0 w-full md:w-[46%] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
        <img src="/mascots/Partnerships.png" alt="" className="h-full w-full object-contain object-right-bottom" loading="lazy" />
      </div>
      <div className="container relative z-10 mx-auto px-4">
        <h1 id="partnerships-heading" className="text-4xl/[1.4] sm:text-5xl/[1.4] md:text-7xl/[1.4] font-rammetto text-white">Partnerships</h1>
        <p className="text-xl md:text-2xl opacity-90 mt-6">Practical learning. Shared possibilities.</p>
      </div>
    </section>

    <section className="relative overflow-hidden px-4 py-32" aria-labelledby="partnership-intro-heading">
      <img src="/backgrounds/Practical%20Learning.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-center" loading="lazy" />
      <div className="relative mx-auto max-w-4xl rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur-sm sm:p-10 md:p-14">
          <h2 id="partnership-intro-heading" className="text-balance font-rammetto text-3xl/[1.4] text-[var(--primary-orange)] sm:text-4xl/[1.4]">Bring practical learning to your community.</h2>
          <p className="mt-8 text-lg leading-relaxed text-[var(--text-light)] md:text-xl">
            Ignite is a student-led education initiative building free courses in practical life skills. We work with schools, community organizations, nonprofits, educators, and other collaborators to help more students discover learning they can use beyond the classroom.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-[var(--text-light)] md:text-xl">
            Whether you want to introduce Ignite to your community, try a lesson with your students, develop educational resources together, or support our work, we’d love to explore what we can build together.
          </p>
          <a href={PARTNERSHIP_FORM_URL} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--primary-orange)] px-7 py-4 text-xl font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-[var(--primary-orange-dark)] motion-safe:hover:scale-105 motion-safe:active:scale-95 sm:px-10">
            Partner with Ignite
            <ArrowRight className="h-5 w-5 flex-none" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
      </div>
    </section>

    <Partners />

    <section className="relative overflow-hidden pt-24 pb-52 md:pb-64" aria-labelledby="collaboration-heading">
      <img src="/backgrounds/Together.jpg" alt="" className="absolute bottom-0 left-0 h-[28rem] w-full object-cover object-right-bottom sm:inset-0 sm:h-full" loading="lazy" />
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-12 px-4 md:gap-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="collaboration-heading" className="text-balance font-rammetto text-3xl/[1.4] text-[var(--primary-orange)] sm:text-4xl/[1.4] md:text-5xl/[1.4]">What could we build together?</h2>
          <p className="mt-8 text-pretty text-lg leading-relaxed text-[var(--text-light)] md:text-xl">A few ways to start a conversation. We’ll discuss what’s possible and agree on the format, timing, and responsibilities together.</p>
        </div>
        <ul className="divide-y divide-orange-100 rounded-[2rem] border-2 border-orange-100 bg-white/90 px-6 py-2 shadow-xl backdrop-blur-sm sm:px-8">
          {collaborationIdeas.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-4 py-8 sm:gap-5">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-orange-50 text-[var(--primary-orange)]"><Icon className="h-6 w-6" aria-hidden="true" /></span>
              <div>
                <h3 className="text-lg/snug text-[var(--text-charcoal)] md:text-xl/snug">{title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-[var(--text-light)]">{description}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="rounded-2xl border-l-8 border-[var(--primary-orange)] bg-white p-6 leading-relaxed text-[var(--text-light)] shadow-sm">
          These are possibilities to discuss, rather than confirmed services or schedules. {programCopy.availability}{' '}
          <Link to="/program" className="rounded font-bold text-[var(--text-charcoal)] underline decoration-[var(--primary-orange)] decoration-2 underline-offset-4">See current program and eligibility details.</Link>
        </p>
      </div>
    </section>

    <PartnershipApplication />
  </div>
);

export default Partnerships;
